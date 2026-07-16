from __future__ import annotations

import json
import uuid
import datetime
from pathlib import Path
from typing import Any

from flask import Blueprint, current_app, jsonify, request, send_file
from werkzeug.utils import secure_filename

from app.services.registry import FUNCTION_REGISTRY
from app.utils.serialization import make_json_safe

api = Blueprint("api", __name__)


def _read_users() -> dict[str, Any]:
    storage_dir = Path(current_app.config["APP_CONFIG"].storage_dir)
    users_file = storage_dir / "users.json"
    if not users_file.exists():
        return {}
    try:
        return json.loads(users_file.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_users(users: dict[str, Any]) -> None:
    storage_dir = Path(current_app.config["APP_CONFIG"].storage_dir)
    users_file = storage_dir / "users.json"
    users_file.write_text(json.dumps(users, indent=2), encoding="utf-8")


def _read_sessions() -> dict[str, str]:
    storage_dir = Path(current_app.config["APP_CONFIG"].storage_dir)
    sessions_file = storage_dir / "sessions.json"
    if not sessions_file.exists():
        return {}
    try:
        return json.loads(sessions_file.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_sessions(sessions: dict[str, str]) -> None:
    storage_dir = Path(current_app.config["APP_CONFIG"].storage_dir)
    sessions_file = storage_dir / "sessions.json"
    sessions_file.write_text(json.dumps(sessions, indent=2), encoding="utf-8")


def _get_authenticated_user_email() -> str | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    sessions = _read_sessions()
    return sessions.get(token)


def _service():
    return current_app.config["service"]


def _jobs():
    return current_app.config["jobs"]


def _state():
    return current_app.config["state"]


def _latest_payload_for_tool(tool_id: str) -> dict[str, Any]:
    for entry in _state().history.list_entries():
        if entry.get("tool_id") == tool_id and isinstance(entry.get("payload"), dict):
            return dict(entry["payload"])
    return {}


def _save_uploads() -> dict[str, str]:
    saved: dict[str, str] = {}
    upload_dir = Path(current_app.config["APP_CONFIG"].uploads_dir)
    for field_name, storage in request.files.items():
        filename = secure_filename(storage.filename or field_name)
        target = upload_dir / filename
        storage.save(target)
        saved[field_name] = str(target)
    return saved


def _coerce_args(tool_meta: dict[str, Any], form_payload: dict[str, Any]) -> dict[str, Any]:
    coerced: dict[str, Any] = {}
    missing_required: list[str] = []
    for param in tool_meta.get("params", []):
        name = param["name"]
        if name not in form_payload or form_payload[name] in ("", None):
            if param.get("required"):
                missing_required.append(name)
            if "default" in param:
                coerced[name] = param["default"]
            continue
        value = form_payload[name]
        param_type = param["type"]
        if param_type == "number":
            coerced[name] = float(value) if "." in str(value) else int(value)
        elif param_type == "boolean":
            coerced[name] = str(value).lower() in {"true", "1", "yes", "on"}
        elif param_type == "json":
            coerced[name] = value if isinstance(value, dict) else json.loads(value)
        else:
            coerced[name] = value
    if missing_required:
        raise ValueError(f"Missing required parameter(s): {', '.join(missing_required)}")
    return coerced


@api.get("/health")
def health():
    return jsonify(_service().health())


@api.get("/tools")
def tools():
    return jsonify({"tools": FUNCTION_REGISTRY})


@api.post("/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")  # Institution
    full_name = data.get("fullName", "")
    role = data.get("role", "Radiologist")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    users = _read_users()
    if email in users:
        return jsonify({"error": "User with this email already exists"}), 400

    def full_name_from_email(e):
        parts = e.split("@")[0].split(".")
        return " ".join([p.capitalize() for p in parts])

    # Create user record
    user = {
        "email": email,
        "password": password,
        "name": name or "ImagePulse Hospital",
        "fullName": full_name or full_name_from_email(email),
        "role": role,
        "department": "Radiology",
        "phone": "",
        "bio": "",
        "photo": ""
    }
    users[email] = user
    _write_users(users)

    # Generate session token
    token = str(uuid.uuid4())
    sessions = _read_sessions()
    sessions[token] = email
    _write_sessions(sessions)

    return jsonify({
        "token": token,
        "user": {
            "email": user["email"],
            "name": user["fullName"],
            "institution": user["name"],
            "role": user["role"],
            "department": user["department"],
            "phone": user["phone"],
            "bio": user["bio"],
            "photo": user["photo"]
        }
    })


@api.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    users = _read_users()
    user = users.get(email)
    if not user or user.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 401

    token = str(uuid.uuid4())
    sessions = _read_sessions()
    sessions[token] = email
    _write_sessions(sessions)

    return jsonify({
        "token": token,
        "user": {
            "email": user["email"],
            "name": user.get("fullName", "Dr. Stanford"),
            "institution": user.get("name", "ImagePulse Hospital"),
            "role": user.get("role", "Radiologist"),
            "department": user.get("department", "Radiology"),
            "phone": user.get("phone", ""),
            "bio": user.get("bio", ""),
            "photo": user.get("photo", "")
        }
    })


@api.post("/auth/google")
def google_auth():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    name = data.get("name")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    users = _read_users()
    user = users.get(email)

    if not user:
        def full_name_from_email(e):
            parts = e.split("@")[0].split(".")
            return " ".join([p.capitalize() for p in parts])

        user = {
            "email": email,
            "password": "google-oauth-placeholder",
            "name": "General Hospital",
            "fullName": name or full_name_from_email(email),
            "role": "Researcher",
            "department": "Clinical Research",
            "phone": "",
            "bio": "",
            "photo": ""
        }
        users[email] = user
        _write_users(users)

    token = str(uuid.uuid4())
    sessions = _read_sessions()
    sessions[token] = email
    _write_sessions(sessions)

    return jsonify({
        "token": token,
        "user": {
            "email": user["email"],
            "name": user.get("fullName", name),
            "institution": user.get("name", "General Hospital"),
            "role": user.get("role", "Researcher"),
            "department": user.get("department", "Clinical Research"),
            "phone": user.get("phone", ""),
            "bio": user.get("bio", ""),
            "photo": user.get("photo", "")
        }
    })


@api.post("/auth/update-profile")
def update_profile():
    email = _get_authenticated_user_email()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    users = _read_users()
    user = users.get(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["fullName"] = data.get("name", user.get("fullName", ""))
    user["name"] = data.get("institution", user.get("name", ""))
    user["department"] = data.get("department", user.get("department", ""))
    user["phone"] = data.get("phone", user.get("phone", ""))
    user["role"] = data.get("role", user.get("role", ""))
    user["bio"] = data.get("bio", user.get("bio", ""))
    if "photo" in data:
        user["photo"] = data.get("photo", user.get("photo", ""))

    users[email] = user
    _write_users(users)

    return jsonify({
        "status": "success",
        "user": {
            "email": user["email"],
            "name": user["fullName"],
            "institution": user["name"],
            "role": user["role"],
            "department": user["department"],
            "phone": user["phone"],
            "bio": user["bio"],
            "photo": user["photo"]
        }
    })


@api.get("/history")
def history():
    email = _get_authenticated_user_email()
    entries = _state().history.list_entries()
    if email:
        user_entries = [e for e in entries if e.get("email") == email]
        return jsonify({"items": user_entries})
    return jsonify({"items": []})


@api.post("/history")
def add_history():
    email = _get_authenticated_user_email()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401
    item = request.get_json(silent=True) or {}
    item["email"] = email
    _state().history.append(item)
    return jsonify({"status": "success", "id": item.get("id")})


@api.get("/jobs/<job_id>")
def job_status(job_id: str):
    job = _state().jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(make_json_safe(job))


@api.get("/artifacts")
def artifacts():
    output_dir = Path(current_app.config["APP_CONFIG"].outputs_dir)
    items = []
    for path in sorted(output_dir.glob("*")):
        items.append({"name": path.name, "path": str(path), "size": path.stat().st_size})
    return jsonify({"items": items})


@api.get("/download")
def download():
    path = request.args.get("path")
    if not path:
        return jsonify({"error": "Missing artifact path"}), 400
    return send_file(path, as_attachment=True)


@api.post("/upload")
def upload():
    saved = _save_uploads()
    return jsonify({"files": saved})


@api.post("/execute/<tool_id>")
def execute(tool_id: str):
    tool_meta = next((tool for tool in FUNCTION_REGISTRY if tool["id"] == tool_id), None)
    if tool_meta is None:
        return jsonify({"error": "Tool not found"}), 404
    payload = request.get_json(silent=True) or {}
    uploads = _save_uploads() if request.files else {}
    # Reuse last successful payload for convenience on repeated runs,
    # especially for file params that are cumbersome to re-upload every time.
    merged_payload = _latest_payload_for_tool(tool_id)
    merged_payload.update(payload)
    merged_payload.update(uploads)
    if request.form:
        form_values = {
            key: value
            for key, value in request.form.to_dict().items()
            if value not in ("", None)
        }
        merged_payload.update(form_values)
    try:
        args = _coerce_args(tool_meta, merged_payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    handler = getattr(_service(), tool_meta["handler"], None)
    if handler is None:
        # Utility functions live at module level on service object fallback.
        from app.services import notebook_adapter

        handler = getattr(notebook_adapter, tool_meta["handler"])
    if tool_meta.get("async"):
        job_id = _jobs().submit(name=tool_meta["name"], payload=args, func=handler, **args)
        return jsonify({"job_id": job_id, "status": "queued"})
    try:
        result = handler(**args)
        history_item = {
            "tool_id": tool_id,
            "tool_name": tool_meta["name"],
            "payload": args,
            "result": make_json_safe(result),
        }
        _state().history.append(history_item)
        return jsonify({"result": make_json_safe(result)})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@api.post("/analyze")
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    upload_dir = Path(current_app.config["APP_CONFIG"].uploads_dir)
    filename = secure_filename(file.filename)
    target_path = upload_dir / filename
    file.save(target_path)

    age_group = request.form.get("age_group")
    gender = request.form.get("gender")

    try:
        result = _service().analyze_single_image(target_path, age_group=age_group, gender=gender)

        email = _get_authenticated_user_email()
        if email:
            history_item = {
                "id": str(uuid.uuid4())[:8].upper(),
                "filename": filename,
                "timestamp": datetime.datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p"),
                "ageGroup": age_group or "Not Provided",
                "gender": gender or "Not Provided",
                "viewPosition": "PA",
                "result": result,
                "email": email
            }
            _state().history.append(history_item)
            return jsonify({**result, "history_id": history_item["id"]})

        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@api.get("/audit")
def audit():
    default_fairness = {
        "gender": [
            {"gender": "Male patients", "error_rate": 47.2, "fn_heavy": "Yes", "p_value": "< 0.05", "bias_indicator": "Moderate gender disparity — likely dataset composition bias"},
            {"gender": "Female patients", "error_rate": 52.8, "fn_heavy": "Yes", "p_value": "< 0.05", "bias_indicator": "Higher FN concentration — anatomical feature variation"}
        ],
        "age_group": [
            {"age_group": "Age < 40", "error_rate": 31.5, "fn_heavy": "No (FP dominant)", "p_value": "> 0.05 (not sig.)", "bias_indicator": "Lower severity; FP over-sensitivity pattern"},
            {"age_group": "Age 40–60", "error_rate": 42.1, "fn_heavy": "Yes", "p_value": "< 0.05", "bias_indicator": "High FN rate; acquisition artifacts in older imaging"},
            {"age_group": "Age > 60", "error_rate": 26.4, "fn_heavy": "Yes", "p_value": "< 0.01", "bias_indicator": "Concentrated high-severity FNs; underrepresented in training"}
        ],
        "p_values": {
            "gender": "< 0.05",
            "age": "< 0.05"
        },
        "key_finding": "Patients aged 40 and above account for 68.5% of high-severity false negative errors. Chi-square testing (p < 0.05) confirms this is statistically significant, not random."
    }
    
    default_inconsistency = {
        "consistent_percentage": 41.0,
        "inconsistent_percentage": 59.0,
        "highest_inconsistency": ["Effusion", "Infiltration"],
        "lowest_inconsistency": ["Hernia", "Cardiomegaly"],
        "measure": "Jaccard I_i = 1 - |K_r \u2229 K_l| / |K_r \u222a K_l| (Score 0 = perfect match, 1 = complete mismatch)"
    }
    
    default_confusion = [
        {"true_disease": "Atelectasis", "predicted_as": "Infiltration", "frequency": "Highest", "reason": "Both produce pulmonary opacification", "impact": "Delayed treatment \u2014 different management path"},
        {"true_disease": "Effusion", "predicted_as": "Cardiomegaly", "frequency": "Very High", "reason": "Enlarged cardiac silhouette overlaps pleural shadow", "impact": "Missed drainage intervention"},
        {"true_disease": "Edema", "predicted_as": "Consolidation", "frequency": "High", "reason": "Bilateral diffuse density similar in appearance", "impact": "Missed diuretic therapy"},
        {"true_disease": "Mass", "predicted_as": "Nodule", "frequency": "High", "reason": "Similar focal lesion; size threshold ambiguous", "impact": "Missed malignancy staging"},
        {"true_disease": "Pneumonia", "predicted_as": "Infiltration", "frequency": "High", "reason": "Both show consolidative pattern", "impact": "Antibiotic vs non-infectious management error"},
        {"true_disease": "Pneumothorax", "predicted_as": "No Finding", "frequency": "Moderate", "reason": "Subtle rim; model under-attends to pleural edge", "impact": "CRITICAL \u2014 tension pneumothorax risk"},
        {"true_disease": "Nodule", "predicted_as": "No Finding", "frequency": "Moderate", "reason": "Faint nodule below model sensitivity threshold", "impact": "Missed early-stage malignancy"}
    ]
    
    return jsonify({
        "fairness_stats": default_fairness,
        "label_inconsistency": default_inconsistency,
        "confusion_pairs": default_confusion
    })


@api.get("/report")
def report():
    research_report = {
        "title": "Clinical Audit and Error Analysis Report",
        "subtitle": "An Agentic AI Framework for Structured Error Taxonomy and Bias-Aware Auditing in Multi-Label Chest X-Ray Classification",
        "meta": {
            "model_name": "EfficientNet-B0",
            "mean_auc": "0.7916",
            "epochs": 10,
            "early_stopping_epoch": 5,
            "validation_loss_start": "0.1398",
            "validation_loss_best": "0.1317"
          },
          "sections": [
              {
                  "id": "executive_summary",
                  "title": "Executive Summary",
                  "paragraphs": [
                      "This report documents a clinical-grade audit of our multi-label Chest X-ray classification model (EfficientNet-B0). The model achieved a mean validation AUC of **0.7916**, showing strong performance on Hernia and Cardiomegaly, but experiencing significant error rates on visually overlapping pathologies such as Infiltration and Atelectasis.",
                      "Our structured audit revealed that **false negatives account for 57% of all errors**, presenting a high clinical risk by delaying critical diagnoses. Demographic auditing identified a statistically significant bias (p < 0.05) where **68.5% of high-severity false negatives** occur in patients aged **40 and older**."
                  ]
              },
              {
                  "id": "classification_performance",
                  "title": "Classification Performance Summary",
                  "paragraphs": [
                      "The model achieves highest accuracy on diseases with highly distinct visual shapes, such as **Cardiomegaly (0.88 AUC)** and **Hernia (0.91 AUC)**. However, performance degrades on interstitial and airspace opacities, with **Infiltration dropping to 0.70 AUC**.",
                      "The dominant error mode across most conditions is **False Negatives**, which constitute a critical failure path. Conditions with high clinical risk, such as **Pneumothorax** and **Edema**, require immediate mitigation of these missed detections."
                  ],
                  "table": [
                      {"disease": "Atelectasis", "auc": "0.76", "error_rate": "High", "dominant_error": "False Negative", "clinical_risk": "Medium"},
                      {"disease": "Cardiomegaly", "auc": "0.88", "error_rate": "Low", "dominant_error": "False Positive", "clinical_risk": "Very High"},
                      {"disease": "Effusion", "auc": "0.82", "error_rate": "Medium", "dominant_error": "False Negative", "clinical_risk": "Moderate"},
                      {"disease": "Infiltration", "auc": "0.70", "error_rate": "Highest", "dominant_error": "False Negative", "clinical_risk": "Medium"},
                      {"disease": "Mass", "auc": "0.79", "error_rate": "Medium", "dominant_error": "False Negative", "clinical_risk": "Very High"},
                      {"disease": "Nodule", "auc": "0.71", "error_rate": "High", "dominant_error": "False Negative", "clinical_risk": "High"},
                      {"disease": "Pneumonia", "auc": "0.74", "error_rate": "High", "dominant_error": "False Negative", "clinical_risk": "High"},
                      {"disease": "Pneumothorax", "auc": "0.84", "error_rate": "Medium", "dominant_error": "False Negative", "clinical_risk": "Highest"},
                      {"disease": "Consolidation", "auc": "0.73", "error_rate": "High", "dominant_error": "Both FN + FP", "clinical_risk": "High"},
                      {"disease": "Edema", "auc": "0.85", "error_rate": "Medium", "dominant_error": "False Negative", "clinical_risk": "Very High"},
                      {"disease": "Emphysema", "auc": "0.86", "error_rate": "Low", "dominant_error": "False Positive", "clinical_risk": "Moderate"},
                      {"disease": "Fibrosis", "auc": "0.80", "error_rate": "Medium", "dominant_error": "False Negative", "clinical_risk": "Moderate"},
                      {"disease": "Pleural Thickening", "auc": "0.78", "error_rate": "Medium", "dominant_error": "False Negative", "clinical_risk": "Low"},
                      {"disease": "Hernia", "auc": "0.91", "error_rate": "Lowest", "dominant_error": "False Positive", "clinical_risk": "Low"}
                  ]
              },
              {
                  "id": "error_taxonomy_summary",
                  "title": "Structured Error Category Breakdown",
                  "paragraphs": [
                      "Errors were categorized into five structured taxonomy categories. **False Negatives** dominate the breakdown with **57%**, followed by **Subtle Pathology Errors (27.5%)** and **Both FP + FN (8.5%)**. Overlapping feature confusion accounts for 4.5% of errors.",
                      "Low-contrast subtle features and overlapping radiological patterns were identified as the main root causes. Faint opacities below 10% contrast delta vs the background frequently trigger subtle pathology errors, particularly in nodule and mass detections."
                  ],
                  "breakdown": [
                      {"category": "False Negative", "count": "2,413", "percentage": "57.0%", "diseases": "Infiltration, Effusion, Atelectasis", "clinical_danger": "HIGH - missed critical pathology"},
                      {"category": "False Positive", "count": "368", "percentage": "8.7%", "diseases": "Hernia, Emphysema, Cardiomegaly", "clinical_danger": "MEDIUM - over-sensitive detection"},
                      {"category": "Both FP + FN", "count": "359", "percentage": "8.5%", "diseases": "Consolidation, Pneumonia", "clinical_danger": "HIGH - combined diagnostic failure"},
                      {"category": "Subtle Pathology Error", "count": "1,160", "percentage": "27.5%", "diseases": "Nodule, Mass, Fibrosis", "clinical_danger": "MEDIUM - low-contrast disease"},
                      {"category": "Overlapping Feature Confusion", "count": "190", "percentage": "4.5%", "diseases": "Atelectasis <-> Infiltration", "clinical_danger": "HIGH - visually ambiguous pair"}
                  ]
              },
              {
                  "id": "severity_analysis",
                  "title": "Clinical Severity Analysis",
                  "paragraphs": [
                      "A critical finding is that **35% of all classification errors carry high clinical severity**, involving conditions like Pneumothorax, Edema, and Mass. These errors require immediate intervention because missed tension pneumothorax or active edema is life-threatening.",
                      "Medium severity errors account for 54% of cases (Effusion, Consolidation, Pneumonia) where delayed diagnosis increases patient morbidity but is not immediately fatal."
                  ]
              },
              {
                  "id": "fairness_analysis",
                  "title": "Demographic Fairness Analysis",
                  "paragraphs": [
                      "The audit confirmed a gender-based error disparity (Male: **47.2%**, Female: **52.8%**). However, the most pronounced demographic shift is age-related: **patients aged 40 and above account for 68.5% of high-severity false negative errors**.",
                      "LLM-based analysis attributes this bias to: (1) reduced chest wall and parenchyma contrast in older cohorts, (2) high comorbidity rates that mask individual disease signatures, and (3) a lack of representative age-stratified data augmentation in training."
                  ]
              },
              {
                  "id": "dataset_quality",
                  "title": "Dataset Quality & Inconsistency",
                  "paragraphs": [
                      "Evaluation of NIH ChestX-ray14 labels against clinician radiology report texts revealed a **59% label-report inconsistency rate**. This noisy supervision seriously degrades model calibration and limits maximum achievable validation AUC.",
                      "Pathologies with the highest linguistic ambiguity in radiology reports include **Effusion** and **Infiltration**. Conversely, **Hernia** and **Cardiomegaly** display lowest ambiguity."
                  ]
              },
              {
                  "id": "recommendations",
                  "title": "Audit Recommendations",
                  "paragraphs": [
                      "To address these critical clinical failures, we recommend the following prioritization: (1) Implement **weighted focal loss** targeting FN-heavy conditions (Pneumothorax, Mass), (2) Apply **CLAHE contrast enhancement** to boost subtle pathology detection (gain: 3-5% AUC).",
                      "For structural improvements, we advise using **Cleanlab confident learning** for label noise correction and introducing **multi-view fusion (frontal + lateral)** inputs in future model versions."
                  ],
                  "fixes": [
                      {"priority": "P1 - Critical", "fix": "Weighted focal loss for FN-heavy diseases (Pneumothorax, Mass)", "gain": "FN rate \u2193 20\u201330%", "effort": "Low"},
                      {"priority": "P1 - Critical", "fix": "CLAHE contrast enhancement in preprocessing pipeline", "gain": "Subtle pathology AUC \u2191 3\u20135%", "effort": "Low"},
                      {"priority": "P2 - High", "fix": "Hard negative mining for confusion pairs (Atelectasis/Infiltration)", "gain": "Confusion rate \u2193 ~40%", "effort": "Medium"},
                      {"priority": "P2 - High", "fix": "Age-stratified sampling and augmentation", "gain": "Demographic bias \u2193 significantly", "effort": "Medium"},
                      {"priority": "P3 - Medium", "fix": "Extend training to 20 epochs with cosine decay scheduler", "gain": "Rare disease AUC \u2191 2\u20134%", "effort": "Low"},
                      {"priority": "P3 - Medium", "fix": "Cleanlab confident learning for label noise correction", "gain": "Overall AUC \u2191 ~3%", "effort": "Medium"}
                  ]
              }
          ]
      }
    return jsonify(research_report)

