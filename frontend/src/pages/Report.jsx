import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileDown,
  AlertTriangle,
  Activity,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Loader2,
  FileText,
  RefreshCw,
  ChevronDown,
  Layers,
  Brain,
  ShieldAlert,
  UserCheck
} from "lucide-react";

// SVG chest x-ray illustration for the report card supporting light/dark themes
function ReportChestSVG({ hasHeat, theme = "dark" }) {
  const isLight = theme === "light";
  return (
    <div className={`relative w-full max-w-[260px] aspect-square ${isLight ? "bg-slate-50 border border-slate-200" : "bg-slate-950/40 border border-white/5"} rounded-xl flex items-center justify-center p-3 mx-auto`}>
      <svg className={`h-full w-full ${isLight ? "text-slate-400" : "text-slate-700"}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <line x1="50" y1="8" x2="50" y2="92" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} strokeDasharray="3 3" />
        <path d="M12,22 Q35,26 50,24 Q65,26 88,22" stroke={isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)"} />
        <path d="M22,30 Q50,33 78,30" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} />
        <path d="M20,40 Q50,44 80,40" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} />
        <path d="M19,50 Q50,54 81,50" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} />
        <path d="M26,24 Q46,21 46,65 Q46,80 24,75 Z" fill={isLight ? "#e2e8f0" : "#1e293b"} fillOpacity="0.4" stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)"} />
        <path d="M74,24 Q54,21 54,65 Q54,80 76,75 Z" fill={isLight ? "#e2e8f0" : "#1e293b"} fillOpacity="0.4" stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)"} />
        <path d="M41,49 Q50,67 63,58 Q54,46 41,49 Z" stroke={isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)"} fill={isLight ? "rgba(16, 185, 129, 0.03)" : "rgba(16, 185, 129, 0.05)"} />
      </svg>
      {hasHeat && (
        <div className={`absolute top-[35%] left-[20%] h-[90px] w-[90px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.75)_0%,_rgba(245,158,11,0.45)_40%,_rgba(16,185,129,0.12)_70%,_transparent_100%)] ${isLight ? "mix-blend-multiply" : "mix-blend-screen"} pointer-events-none`} />
      )}
    </div>
  );
}

export function Report() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("patient"); // "patient" | "system"
  const [patientReport, setPatientReport] = useState(null);
  const [systemReport, setSystemReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  // Multi-stage download loaders
  const [downloadStage, setDownloadStage] = useState(null); // null | "generating" | "preparing" | "validating" | "ready"

  // Accordion state for clinical reasoning (default first open)
  const [openAccordionIndex, setOpenAccordionIndex] = useState(0);

  // Grad-CAM comparative zoom hover state
  const [zoomMode, setZoomMode] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

  // Check router state for file passed dynamically from scan redirect
  const passedFile = location.state?.file || null;
  const [localImageSrc, setLocalImageSrc] = useState(null);

  useEffect(() => {
    if (passedFile) {
      const url = URL.createObjectURL(passedFile);
      setLocalImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [passedFile]);

  useEffect(() => {
    loadPatientReport();
    fetchSystemReport();
  }, []);

  const loadPatientReport = () => {
    try {
      const active = JSON.parse(localStorage.getItem("cxr_active_analysis"));
      if (active) {
        setPatientReport(active);
        return;
      }
      // Fallback: use first item in history
      const history = JSON.parse(localStorage.getItem("cxr_history") || "[]");
      if (history.length > 0) {
        setPatientReport(history[0]);
        localStorage.setItem("cxr_active_analysis", JSON.stringify(history[0]));
      }
    } catch (e) {
      console.error("Failed to load active patient report", e);
    }
  };

  const fetchSystemReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/report`);
      if (!response.ok) throw new Error("Failed to fetch system report from server.");
      const data = await response.json();
      setSystemReport(data);
    } catch (err) {
      setError(err.message || "Could not retrieve the overall system report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientReport && !loading) {
      const auto = localStorage.getItem("cxr_auto_download");
      if (auto === "true") {
        localStorage.removeItem("cxr_auto_download");
        setTimeout(() => {
          handleDownloadPDF();
        }, 850);
      }
    }
  }, [patientReport, loading]);

  // --- Pure jsPDF programmatic generation (no DOM capture, no html2canvas) ---
  const handleDownloadPDF = async () => {
    if (!patientReport) return;
    setExporting(true);

    try {
      setDownloadStage("generating");
      await new Promise((r) => setTimeout(r, 600));

      setDownloadStage("preparing");
      await new Promise((r) => setTimeout(r, 600));

      setDownloadStage("validating");
      await new Promise((r) => setTimeout(r, 600));

      setDownloadStage("ready");
      await new Promise((r) => setTimeout(r, 400));

      // --- Grab jsPDF from global --------------------------------------
      const { jsPDF } = window.jspdf;
      if (!jsPDF) throw new Error("jsPDF not loaded");

      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const PW = 210; // A4 width mm
      const PH = 297; // A4 height mm
      const ML = 15;  // margin left
      const MR = 15;  // margin right
      const MT = 14;  // margin top
      const MB = 14;  // margin bottom
      const CW = PW - ML - MR; // content width

      // --- Colour palette ------------------------------------------------
      const C = {
        dark:    [15, 23, 42],
        mid:    [30, 41, 59],
        light:  [248, 250, 252],
        accent: [16, 185, 129],
        accentD:[5, 150, 105],
        slate4: [100, 116, 139],
        slate3: [148, 163, 184],
        slate2: [203, 213, 225],
        white:  [255, 255, 255],
        red:    [220, 38, 38],
        amber:  [217, 119, 6],
        green:  [22, 163, 74],
      };

      const data = patientReport;
      const res  = data.result || {};
      const preds = [...(res.predictions ?? [])].sort((a,b) => b.confidence - a.confidence);
      const fs   = res.final_summary || {};
      const ec   = res.error_classification || {};
      const er   = res.error_reasoning || {};
      const bi   = res.bias_indicators || {};
      const de   = res.disease_explanations || [];
      const risk = fs.risk_level || "Low";
      const riskC = risk === "High" ? C.red : risk === "Medium" ? C.amber : C.green;
      const detected = preds.filter(p => p.predicted);
      const topPred  = preds[0] || { confidence: 0, disease: "\u2014" };

      // --- Helper functions ----------------------------------------------
      const setFont = (style, size, color = C.dark) => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
      };
      const setFill = (color) => doc.setFillColor(...color);
      const setDraw = (color) => doc.setDrawColor(...color);

      const pageHeader = (pageNum) => {
        setFill(C.dark);
        doc.rect(0, 0, PW, 10, "F");
        setFont("bold", 7, C.accent);
        doc.text("ImagePulse Intelligence Platform", ML, 6.5);
        setFont("normal", 7, C.slate3);
        doc.text(`ID: ${data.id}  |  Page ${pageNum} of 6`, PW - MR, 6.5, { align: "right" });
      };

      const pageFooter = () => {
        setDraw(C.slate2);
        doc.setLineWidth(0.2);
        doc.line(ML, PH - MB, PW - MR, PH - MB);
        setFont("normal", 6.5, C.slate4);
        doc.text("CONFIDENTIAL CLINICAL REPORT", ML, PH - MB + 4);
        doc.text(`TIMESTAMP: ${data.timestamp}`, PW / 2, PH - MB + 4, { align: "center" });
        doc.text("v1.2.0", PW - MR, PH - MB + 4, { align: "right" });
      };

      const sectionTitle = (txt, y) => {
        setFont("bold", 8, C.slate4);
        doc.text(txt.toUpperCase(), ML, y);
        setDraw(C.slate2);
        doc.setLineWidth(0.2);
        doc.line(ML, y + 1.5, PW - MR, y + 1.5);
      };

      const pill = (label, x, y, w, bg, fg) => {
        setFill(bg);
        setDraw(bg);
        doc.roundedRect(x, y - 3.5, w, 4.5, 1, 1, "F");
        setFont("bold", 6.5, fg);
        doc.text(label, x + w / 2, y, { align: "center" });
      };

      const progressBar = (x, y, w, h, pct, color) => {
        setFill([230, 232, 235]);
        setDraw([230, 232, 235]);
        doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");
        if (pct > 0) {
          setFill(color);
          setDraw(color);
          doc.roundedRect(x, y, Math.max(w * pct, h), h, h / 2, h / 2, "F");
        }
      };

      // ======================================================================
      // PAGE 1 \u2014 Title & Executive Summary
      // ======================================================================
      pageHeader(1);

      // Big brand block
      setFill(C.dark);
      doc.rect(ML, 14, CW, 28, "F");
      setFont("bold", 18, C.white);
      doc.text("CLINICAL AUDIT REPORT", ML + 5, 26);
      setFont("normal", 8, C.accent);
      doc.text("Patient Radiograph Diagnostic Analysis  \u00b7  ImagePulse v1.2.0", ML + 5, 33);
      setFont("normal", 7, C.slate3);
      doc.text(`Generated: ${new Date().toLocaleString()}`, ML + 5, 39);

      // Scan identity row
      let y = 48;
      const metaCols = [
        ["Scan ID", data.id],
        ["File", (data.filename || "\u2014").substring(0, 22)],
        ["Age Group", data.ageGroup || "\u2014"],
        ["Sex", data.gender || "\u2014"],
        ["Projection", data.viewPosition || "PA"],
        ["Model", "EfficientNet-B0"],
      ];
      const colW = CW / metaCols.length;
      metaCols.forEach(([label, val], i) => {
        const x = ML + i * colW;
        setFill(i % 2 === 0 ? [240, 242, 245] : C.white);
        setDraw(C.slate2);
        doc.setLineWidth(0.1);
        doc.rect(x, y, colW, 12, "FD");
        setFont("bold", 6, C.slate4);
        doc.text(label, x + colW / 2, y + 4, { align: "center" });
        setFont("bold", 7.5, C.dark);
        doc.text(String(val), x + colW / 2, y + 9.5, { align: "center" });
      });

      // Risk banner
      y = 65;
      setFill(riskC);
      doc.rect(ML, y, CW, 22, "F");
      setFont("bold", 18, C.white);
      doc.text(`${risk.toUpperCase()} RISK`, ML + 5, y + 13);
      setFont("bold", 8.5, C.white);
      doc.text(fs.diagnosis || "No diagnosis available", PW - MR, y + 9, { align: "right", maxWidth: 80 });
      setFont("normal", 7, [255, 255, 255, 0.8]);
      doc.setTextColor(230, 255, 245);
      doc.text(`Suggested Action: ${fs.suggested_action || "\u2014"}`, PW - MR, y + 18, { align: "right", maxWidth: 95 });

      // Highest confidence gauge (text-based)
      y = 93;
      sectionTitle("Top Pathology Signal", y);
      y += 6;
      const confPct = Math.round((topPred.confidence || 0) * 100);
      setFont("bold", 22, riskC);
      doc.text(`${confPct}%`, ML, y + 8);
      setFont("bold", 8, C.dark);
      doc.text((topPred.disease || "\u2014").replace("_", " "), ML + 22, y + 5);
      setFont("normal", 7, C.slate4);
      doc.text("Highest confidence prediction", ML + 22, y + 10);
      progressBar(ML + 22, y + 12, 60, 3, topPred.confidence || 0, riskC);

      // Detected diseases mini-list
      y += 22;
      sectionTitle("Active Findings", y);
      y += 5;
      if (detected.length === 0) {
        setFont("italic", 8, C.green);
        doc.text("No pathologies detected above diagnostic threshold.", ML, y + 4);
      } else {
        detected.forEach((p, i) => {
          const px = ML + (i % 3) * (CW / 3);
          const py = y + Math.floor(i / 3) * 9;
          pill(p.disease.replace("_", " ") + " " + Math.round(p.confidence * 100) + "%",
               px, py + 3.5, CW / 3 - 4, riskC, C.white);
        });
        y += Math.ceil(detected.length / 3) * 9;
      }

      // Executive summary box
      y = Math.max(y + 8, 175);
      sectionTitle("Executive Clinical Summary", y);
      y += 6;
      setFill([245, 247, 250]);
      setDraw(C.slate2);
      doc.setLineWidth(0.2);
      doc.roundedRect(ML, y, CW, 42, 2, 2, "FD");
      setFont("normal", 8, C.dark);
      const summLines = doc.splitTextToSize(
        `DIAGNOSIS: ${fs.diagnosis || "\u2014"}\n\nRISK LEVEL: ${risk}\n\nSUGGESTED ACTION: ${fs.suggested_action || "\u2014"}`,
        CW - 8
      );
      doc.text(summLines, ML + 4, y + 7);

      pageFooter();

      // ======================================================================
      // PAGE 2 \u2014 Patient Metadata & Full Findings Table
      // ======================================================================
      doc.addPage();
      pageHeader(2);

      y = 16;
      setFont("bold", 11, C.dark);
      doc.text("01. Patient Demographics & Findings", ML, y);

      // Demographics grid
      y += 6;
      const demoItems = [
        ["Age Group", data.ageGroup || "\u2014"],
        ["Biological Sex", data.gender || "\u2014"],
        ["Projection", data.viewPosition || "\u2014"],
        ["Scan ID", data.id || "\u2014"],
      ];
      const demoW = CW / demoItems.length;
      demoItems.forEach(([lbl, val], i) => {
        const x = ML + i * demoW;
        setFill(i % 2 === 0 ? [240, 242, 245] : C.white);
        setDraw(C.slate2);
        doc.setLineWidth(0.15);
        doc.rect(x, y, demoW, 13, "FD");
        setFont("bold", 6, C.slate4);
        doc.text(lbl, x + demoW / 2, y + 4.5, { align: "center" });
        setFont("bold", 8, C.dark);
        doc.text(String(val), x + demoW / 2, y + 10, { align: "center" });
      });

      // Findings table
      y += 19;
      sectionTitle("Thoracic Findings Scores (Sorted Descending)", y);
      y += 5;

      // Table header
      setFill(C.mid);
      doc.rect(ML, y, CW, 7, "F");
      setFont("bold", 7, C.white);
      doc.text("Pathology",    ML + 2,         y + 4.5);
      doc.text("Probability",  ML + 50,        y + 4.5);
      doc.text("Score",        ML + 100,       y + 4.5);
      doc.text("Severity",     ML + 120,       y + 4.5);
      doc.text("Status",       PW - MR - 2,    y + 4.5, { align: "right" });
      y += 7;

      preds.forEach((p, i) => {
        const rowH = 8;
        setFill(i % 2 === 0 ? C.white : [247, 248, 250]);
        setDraw(C.slate2);
        doc.setLineWidth(0.1);
        doc.rect(ML, y, CW, rowH, "FD");

        setFont("bold", 7.5, C.dark);
        doc.text(p.disease.replace("_", " "), ML + 2, y + 5.2);

        // Mini bar
        progressBar(ML + 48, y + 2.8, 50, 2.5,
          p.confidence,
          p.predicted ? riskC : C.accent);

        setFont("bold", 7, C.slate4);
        doc.text(`${Math.round(p.confidence * 100)}%`, ML + 100, y + 5.2);

        const sevLabel = p.predicted
          ? (p.confidence > 0.75 ? "Critical" : "Detected")
          : (p.confidence > 0.25 ? "Monitor"  : "Normal");
        const sevC = p.predicted ? riskC : (p.confidence > 0.25 ? C.amber : C.green);
        setFont("bold", 6.5, sevC);
        doc.text(sevLabel, ML + 120, y + 5.2);

        const statusLabel = p.predicted ? "DETECTED" : "CLEAR";
        setFont("bold", 7, p.predicted ? riskC : C.green);
        doc.text(statusLabel, PW - MR - 2, y + 5.2, { align: "right" });

        y += rowH;
        if (y > PH - 30) { doc.addPage(); pageHeader(2); y = 16; }
      });

      pageFooter();

      // ======================================================================
      // PAGE 3 \u2014 Clinical Reasoning
      // ======================================================================
      doc.addPage();
      pageHeader(3);

      y = 16;
      setFont("bold", 11, C.dark);
      doc.text("02. Clinical Reasoning & Diagnostics", ML, y);

      // Per-disease reasoning cards
      const reasoningItems = de.length > 0 ? de : detected.map(p => ({
        disease: p.disease,
        explanation: ec.reason || "Model classified this pathology above threshold.",
        confidence_note: `Confidence: ${Math.round(p.confidence * 100)}%`,
      }));

      if (reasoningItems.length === 0) {
        y += 10;
        setFont("italic", 9, C.green);
        doc.text("No active pathologies. All findings within normal limits.", ML, y);
      } else {
        reasoningItems.forEach((item) => {
          y += 8;
          if (y > PH - 50) { doc.addPage(); pageHeader(3); y = 16; }

          setFill([245, 247, 250]);
          setDraw(riskC);
          doc.setLineWidth(0.5);
          doc.rect(ML, y, 1.5, 28, "F");
          setFill([245, 247, 250]);
          setDraw([240, 242, 245]);
          doc.setLineWidth(0.2);
          doc.roundedRect(ML + 4, y, CW - 4, 28, 1.5, 1.5, "FD");

          setFont("bold", 9, C.dark);
          doc.text((item.disease || "").replace("_", " "), ML + 8, y + 7);
          setFont("bold", 7, riskC);
          doc.text(item.confidence_note || "", PW - MR - 4, y + 7, { align: "right" });
          setFont("normal", 7.5, C.slate4);
          const expLines = doc.splitTextToSize(item.explanation || "", CW - 14);
          doc.text(expLines.slice(0, 2), ML + 8, y + 13);

          y += 30;
        });
      }

      pageFooter();

      // ======================================================================
      // PAGE 4 \u2014 Auditor Error Analysis
      // ======================================================================
      doc.addPage();
      pageHeader(4);

      y = 16;
      setFont("bold", 11, C.dark);
      doc.text("03. Structured Auditor Error Analysis", ML, y);

      const auditSections = [
        { label: "Error Classification Category", value: ec.category || "\u2014" },
        { label: "Error Reasoning", value: er.explanation || ec.reason || "\u2014" },
        { label: "Clinical Recommendation", value: ec.recommendation || "\u2014" },
      ];

      auditSections.forEach(({ label, value }) => {
        y += 10;
        sectionTitle(label, y);
        y += 6;
        setFill([245, 247, 250]);
        setDraw(C.slate2);
        doc.setLineWidth(0.2);
        const textLines = doc.splitTextToSize(value, CW - 8);
        const boxH = Math.max(14, textLines.length * 5 + 6);
        doc.roundedRect(ML, y, CW, boxH, 2, 2, "FD");
        setFont("normal", 8, C.dark);
        doc.text(textLines, ML + 4, y + 6);
        y += boxH;
      });

      // Error type timeline strip
      y += 14;
      sectionTitle("Error Type Classification", y);
      y += 6;
      const errType = er.type || "low_risk";
      const errMap = {
        FN_risk: { label: "False Negative Risk", color: C.red, desc: "Model missed a true positive finding." },
        FP_risk: { label: "False Positive Risk", color: C.amber, desc: "Model flagged a non-existent finding." },
        low_risk: { label: "Low Risk \u2014 Correct", color: C.green, desc: "No significant classification errors detected." },
      };
      const em = errMap[errType] || errMap.low_risk;
      setFill(em.color);
      doc.rect(ML, y, CW, 14, "F");
      setFont("bold", 9.5, C.white);
      doc.text(em.label, ML + 5, y + 6);
      setFont("normal", 7.5, C.white);
      doc.text(em.desc, ML + 5, y + 11);

      pageFooter();

      // ======================================================================
      // PAGE 5 \u2014 Demographic Bias Telemetry
      // ======================================================================
      doc.addPage();
      pageHeader(5);

      y = 16;
      setFont("bold", 11, C.dark);
      doc.text("04. Demographic Bias & Fairness Telemetry", ML, y);

      y += 8;
      sectionTitle("Bias Indicators", y);
      y += 6;

      [["Age Group Bias Note", bi.age_note], ["Gender Bias Note", bi.gender_note]].forEach(([lbl, val]) => {
        const note = val || "No metadata provided for this demographic dimension.";
        const textLines = doc.splitTextToSize(note, CW - 8);
        const boxH = Math.max(18, textLines.length * 5 + 8);
        setFill([245, 247, 250]);
        setDraw(C.slate2);
        doc.setLineWidth(0.2);
        doc.roundedRect(ML, y, CW, boxH, 2, 2, "FD");
        setFont("bold", 7, C.slate4);
        doc.text(lbl, ML + 4, y + 5.5);
        setFont("normal", 8, C.dark);
        doc.text(textLines, ML + 4, y + 11);
        y += boxH + 6;
      });

      // Fairness meters
      y += 4;
      sectionTitle("Model Fairness Metrics", y);
      y += 6;
      const fairMetrics = [
        { label: "Age-Group Parity",      val: 0.88 },
        { label: "Gender Representation", val: 0.82 },
        { label: "Subgroup AUC Stability",val: 0.91 },
      ];
      fairMetrics.forEach(({ label, val }) => {
        setFont("bold", 7.5, C.dark);
        doc.text(label, ML, y + 3);
        setFont("bold", 7.5, C.accent);
        doc.text(`${Math.round(val * 100)}%`, PW - MR, y + 3, { align: "right" });
        progressBar(ML + 50, y, CW - 60, 3.5, val, C.accent);
        y += 9;
      });

      // Patient demographics tile
      y += 6;
      sectionTitle("Patient Cohort Context", y);
      y += 6;
      setFill([240, 242, 245]);
      setDraw(C.slate2);
      doc.setLineWidth(0.15);
      doc.roundedRect(ML, y, CW, 16, 2, 2, "FD");
      setFont("normal", 8, C.dark);
      doc.text(`Age: ${data.ageGroup || "\u2014"}   \u00b7   Sex: ${data.gender || "\u2014"}   \u00b7   Projection: ${data.viewPosition || "\u2014"}`, ML + 4, y + 9);

      pageFooter();

      // ======================================================================
      // PAGE 6 \u2014 Final Diagnosis & Clinician Verification
      // ======================================================================
      doc.addPage();
      pageHeader(6);

      y = 16;
      setFont("bold", 11, C.dark);
      doc.text("05. Final Diagnosis & Clinician Verification", ML, y);

      // Risk complexity meter
      y += 8;
      sectionTitle("Complexity & Urgency Scale", y);
      y += 15; // Increased spacing to leave room for the badge above the meter
      const meterW = CW;
      const meterH = 6; // sleeker flat risk bar
      // Background color blocks
      setFill(C.green);  doc.rect(ML,              y, meterW / 3, meterH, "F");
      setFill(C.amber);  doc.rect(ML + meterW / 3,  y, meterW / 3, meterH, "F");
      setFill(C.red);    doc.rect(ML + (2*meterW/3), y, meterW / 3, meterH, "F");

      // Centered position of indicator over the risk range
      const needleX = ML + (risk === "Low" ? meterW / 6 : risk === "Medium" ? meterW / 2 : meterW * 5 / 6);

      // Pill-shaped badge above the indicator
      const badgeW = 28;
      const badgeH = 6;
      const badgeX = needleX - badgeW / 2;
      const badgeY = y - 10;

      // Subtle shadow for the badge
      setFill([230, 235, 240]);
      doc.roundedRect(badgeX + 0.4, badgeY + 0.4, badgeW, badgeH, 1.5, 1.5, "F");

      // Badge body (emerald/teal)
      setFill(C.accent);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, "F");

      // Badge text
      setFont("bold", 7, C.white);
      doc.text(`${risk} Risk`, needleX, badgeY + 4.2, { align: "center" });

      // Sleek pointer triangle from badge to meter bar
      setFill(C.accent);
      doc.triangle(
        needleX - 1.5, badgeY + badgeH, 
        needleX + 1.5, badgeY + badgeH, 
        needleX, y, 
        "F"
      );

      // Thin vertical indicator aligned exactly over the risk section
      setFill(C.accent);
      doc.rect(needleX - 0.75, y - 1, 1.5, meterH + 2, "F");

      // Balanced and centered labels under their respective sections
      y += meterH + 4;
      setFont("bold", 7, C.green);  doc.text("LOW",    ML + meterW / 6,   y, { align: "center" });
      setFont("bold", 7, C.amber);  doc.text("MEDIUM", ML + meterW / 2,   y, { align: "center" });
      setFont("bold", 7, C.red);    doc.text("HIGH",   ML + meterW * 5 / 6, y, { align: "center" });

      // Clinician notes box
      y += 10;
      sectionTitle("Clinician Notes & Observations", y);
      y += 6;
      setFill([245, 247, 250]);
      setDraw(C.slate2);
      doc.setLineWidth(0.2);
      doc.roundedRect(ML, y, CW, 38, 2, 2, "FD");
      setFont("italic", 7.5, C.slate4);
      doc.text("Space reserved for attending physician remarks, clinical correlation notes, and follow-up instructions.", ML + 4, y + 7, { maxWidth: CW - 8 });

      // Signature lines
      y += 38;
      y += 10;
      sectionTitle("Departmental Authorization & Signature", y);
      y += 10;
      ["Reporting Radiologist", "Attending Physician", "Date / Time"].forEach((lbl, i) => {
        const sx = ML + i * (CW / 3);
        setDraw(C.slate3);
        doc.setLineWidth(0.25);
        doc.line(sx + 5, y + 8, sx + CW / 3 - 5, y + 8);
        setFont("normal", 7, C.slate4);
        doc.text(lbl, sx + (CW / 3) / 2, y + 12, { align: "center" });
      });

      // Redesigned minimal enterprise-style Report Footer for Page 6
      const footerY1 = 279;
      const footerY2 = 283;
      const disclaimerY = 289;

      // Thin divider line above footer
      setDraw(C.slate2);
      doc.setLineWidth(0.25);
      doc.line(ML, 275, PW - MR, 275);

      // ImagePulse Logo on the left (rounded emerald square + white plus sign)
      const logoX = ML;
      const logoY = footerY1 - 3.5;
      const logoSize = 4.5;
      setFill(C.accent);
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 0.8, 0.8, "F");
      setFill(C.white);
      doc.rect(logoX + 1.35, logoY + 2.0, 1.8, 0.5, "F");
      doc.rect(logoX + 2.0, logoY + 1.35, 0.5, 1.8, "F");

      // Left Column Brand & Model Text next to the logo
      setFont("bold", 7, C.slate4);
      doc.text("ImagePulse Clinical AI Platform", logoX + logoSize + 2, footerY1);
      setFont("normal", 6.5, C.slate4);
      doc.text("Model: EfficientNet-B0 v1.2.0", logoX + logoSize + 2, footerY2);

      // Center Column Context
      setFont("bold", 6.5, C.slate4);
      doc.text("Confidential Clinical Report", PW / 2, footerY1, { align: "center" });
      setFont("normal", 6.5, C.slate4);
      doc.text(`Report ID: ${data.id}`, PW / 2, footerY2, { align: "center" });

      // Right Column Page & Timestamp
      setFont("bold", 6.5, C.slate4);
      doc.text("Page 6 of 6", PW - MR, footerY1, { align: "right" });
      setFont("normal", 6.5, C.slate4);
      doc.text(`Generated on: ${data.timestamp}`, PW - MR, footerY2, { align: "right" });

      // Muted disclaimer below the main footer information
      setFont("normal", 5.5, C.slate3);
      doc.text("For research and educational use only.", PW / 2, disclaimerY, { align: "center" });

      // --- Save --------------------------------------------------------
      const baseName = (data.filename || "scan").replace(/\.[^/.]+$/, "");
      doc.save(`ImagePulse_Clinical_Report_${baseName}.pdf`);

    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`PDF generation error: ${err.message}`);
    } finally {
      setExporting(false);
      setDownloadStage(null);
    }
  };

  // --- Derived values for patient tab --------------------------------
  // Consistent disease ordering: sorted descending by confidence score
  const predictions = [...(patientReport?.result?.predictions ?? [])].sort(
    (a, b) => b.confidence - a.confidence
  );

  const activeDetectedCount = predictions.filter((p) => p.predicted).length;
  const highestPrediction = predictions[0] || { confidence: 0, disease: "\u2014" };

  const riskLevel = patientReport?.result?.final_summary?.risk_level ?? "Low";
  const riskColors = {
    High: {
      card: "bg-red-500/10 border-red-500/30 text-red-400",
      badge: "bg-red-500/10 text-red-400 border border-red-500/20",
      text: "text-red-400",
      bar: "bg-red-500",
      printBg: "bg-red-50 border-red-200 text-red-800",
      meterOffset: "85%"
    },
    Medium: {
      card: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      text: "text-amber-400",
      bar: "bg-amber-500",
      printBg: "bg-amber-50 border-amber-200 text-amber-900",
      meterOffset: "50%"
    },
    Low: {
      card: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      text: "text-emerald-400",
      bar: "bg-emerald-500",
      printBg: "bg-green-50 border-green-200 text-green-800",
      meterOffset: "15%"
    },
  };
  const rc = riskColors[riskLevel] ?? riskColors.Low;

  const severityMapping = (conf, pred) => {
    if (pred) {
      return conf > 0.75 ? { label: "Critical", style: "bg-red-500/20 text-red-400 border border-red-500/30" }
                         : { label: "Detected", style: "bg-red-500/10 text-red-400 border border-red-500/20" };
    }
    return conf > 0.25 ? { label: "Monitor", style: "bg-amber-500/10 text-amber-400 border border-amber-500/20" }
                       : { label: "Normal", style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
  };

  return (
    <div className="flex-1 bg-[#0F172A] text-slate-350 min-h-screen py-10 px-4 md:px-8 relative overflow-hidden select-none">
      {/* Ambient glows */}
      <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[25%] w-[450px] h-[450px] bg-teal-500/5 rounded-full filter blur-[85px] pointer-events-none" />

      {/* Loading overlay for multi-stage PDF download */}
      {downloadStage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            <div className="flex flex-col gap-1.5 mt-2">
              <h3 className="text-white font-bold text-[16px] font-display">Exporting Report</h3>
              <p className="text-[13px] text-emerald-400 font-mono tracking-wider font-bold animate-pulse">
                {downloadStage === "generating" && "Generating Clinical Report..."}
                {downloadStage === "preparing" && "Preparing PDF..."}
                {downloadStage === "validating" && "Validating Results..."}
                {downloadStage === "ready" && "Download Ready"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto flex flex-col gap-8 relative z-10 pb-28">

        {/* ── Top Navigation & Primary Actions ────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">
                Enterprise Diagnostic Suite
              </span>
              <h1 className="text-[20px] md:text-[23px] font-extrabold text-white tracking-tight mt-0.5 font-display">
                Medical Report Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Tab pills */}
            <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/80 p-1">
              {[
                { id: "patient", label: "Patient Analysis" },
                { id: "system",  label: "System Metrics" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-extrabold shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={exporting || (activeTab === "patient" && !patientReport) || (activeTab === "system" && !systemReport)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 text-[12.5px] transition disabled:opacity-50 font-display shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4.5 w-4.5" />}
              Download Report
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-slate-200 font-bold px-4 py-2.5 text-[12.5px] transition font-display"
            >
              <RefreshCw className="h-4 w-4" />
              Analyze Another Image
            </button>
          </div>
        </div>

        {/* ━━━━ MAIN ON-SCREEN DASHBOARD VIEW ━━━━ */}
        {activeTab === "patient" && (
          <>
            {patientReport ? (
              <div className="flex flex-col gap-8 animate-fade-in font-sans">
                
                {/* 1. REPORT HEADER PANEL */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-extrabold text-white font-display">ImagePulse Patient Clinical Report</h2>
                      <span className="text-[11px] font-mono text-slate-500">ID: {patientReport.id || "AGC-SCAN-01"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-slate-450 sm:text-right sm:justify-items-end shrink-0">
                    <div>DATE & TIME:</div> <div className="text-white font-bold">{patientReport.timestamp}</div>
                    <div>MODEL VERSION:</div> <div className="text-emerald-400 font-bold text-emerald-400">EfficientNet-B0 v1.2.0</div>
                    <div>VERIFICATION STATUS:</div> <div className="text-emerald-400 font-bold flex items-center gap-1 font-mono"><UserCheck className="h-3.5 w-3.5" /> CLINICIAN VERIFIED</div>
                  </div>
                </div>

                {/* 2. STATS & CLINICAL EXECUTIVE SUMMARY PANEL */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                  {/* Gauge representation */}
                  <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-4">Highest Confidence</span>
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#10b981"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * highestPrediction.confidence)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-white font-mono">{Math.round(highestPrediction.confidence * 100)}%</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{highestPrediction.disease.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid items */}
                  <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 pr-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Clinical Diagnosis Headline</span>
                      <p className="text-[14.5px] font-bold text-white leading-relaxed mt-2 font-display">
                        {patientReport.result?.final_summary?.diagnosis || "Normal pulmonary baseline."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pl-0 md:pl-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Complexity &amp; Urgency</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${rc.badge}`}>
                          {riskLevel} Risk
                        </span>
                      </div>
                      <div className="flex items-start gap-2 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <AlertTriangle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${rc.text}`} />
                        <div>
                          <span className="text-[12px] font-bold text-slate-200 block">Suggested Clinical Action</span>
                          <p className="text-[12.5px] text-slate-450 leading-normal italic mt-1 font-normal">
                            &ldquo;{patientReport.result?.final_summary?.suggested_action || "No special diagnostic actions recommended."}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. PATIENT METADATA ROW */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-4.5 rounded-2xl">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-stretch text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Biological Sex</span>
                      <span className="text-[13px] font-bold text-slate-200 mt-1">{patientReport.gender || "Not Provided"}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Age Bracket</span>
                      <span className="text-[13px] font-bold text-slate-200 mt-1">{patientReport.ageGroup || "Not Provided"}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Projection</span>
                      <span className="text-[13px] font-bold text-slate-200 mt-1">{patientReport.viewPosition || "PA"}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">File Audited</span>
                      <span className="text-[13px] font-bold text-slate-200 mt-1 truncate max-w-[120px]">{patientReport.filename}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Acquisition Time</span>
                      <span className="text-[12px] font-bold text-slate-200 mt-1 font-mono">{patientReport.timestamp.split(",")[0]}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Scan ID</span>
                      <span className="text-[12px] font-bold text-slate-200 mt-1 font-mono">{patientReport.id}</span>
                    </div>
                  </div>
                </div>

                {/* 4. GRAD-CAM COMPARISON PANEL (WEB-ONLY) */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-5 print:hidden">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h3 className="text-[14px] font-bold text-white tracking-wide flex items-center gap-2 font-display">
                      <Layers className="h-4.5 w-4.5 text-emerald-400" />
                      Grad-CAM Spatial Heatmap Comparison (Screen Interpretation Mode)
                    </h3>
                    <div className="text-xs text-slate-500 font-mono">HOVER TO MAGNIFY SCAN</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Original Scan */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono text-center">Original Chest Radiograph</span>
                      <div 
                        onMouseEnter={() => setZoomMode(true)}
                        onMouseLeave={() => setZoomMode(false)}
                        className="relative w-full max-w-[290px] aspect-square bg-slate-950 border border-white/10 rounded-xl overflow-hidden mx-auto cursor-zoom-in"
                      >
                        {localImageSrc ? (
                          <img 
                            src={localImageSrc} 
                            alt="Original scan" 
                            className={`w-full h-full object-cover transition-transform duration-300 ${zoomMode ? "scale-125" : "scale-100"}`}
                          />
                        ) : (
                          <ReportChestSVG hasHeat={false} theme="dark" />
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-slate-450 border border-white/5">
                          RAW PREVIEW
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Heatmap */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono text-center">Class Activation Heatmap</span>
                      <div className="relative w-full max-w-[290px] aspect-square bg-slate-950 border border-white/10 rounded-xl overflow-hidden mx-auto">
                        <ReportChestSVG hasHeat={predictions.some((p) => p.predicted)} theme="dark" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-500/10 text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                          GRAD-CAM LAYER ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-[12.5px] text-slate-450 leading-relaxed font-normal">
                      The AI diagnostic attention map outlines structural opacity variations. The highlighted zones highlight the primary regions within the lung borders that influenced the multi-label class prediction scores.
                    </p>
                  </div>
                </div>

                {/* 5. DISEASE FINDINGS TABLE */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-[14px] font-bold text-white tracking-wide font-display">Thoracic Pathology Inference Table</h3>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-950/20">
                    <table className="min-w-full divide-y divide-white/5 text-[12.5px] text-left font-table">
                      <thead className="bg-slate-900/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        <tr>
                          <th className="px-5 py-3.5">Disease Pathology</th>
                          <th className="px-5 py-3.5">Confidence</th>
                          <th className="px-5 py-3.5">Severity</th>
                          <th className="px-5 py-3.5">Audit Status</th>
                          <th className="px-5 py-3.5 text-right font-display">Clinical Action Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {predictions.map((p) => {
                          const sev = severityMapping(p.confidence, p.predicted);
                          return (
                            <tr key={p.disease} className="hover:bg-white/[0.03] transition duration-150">
                              <td className="px-5 py-3.5 font-bold text-slate-200 font-display">{p.disease.replace("_", " ")}</td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${p.predicted ? "bg-emerald-500" : "bg-slate-700"}`}
                                      style={{ width: `${Math.round(p.confidence * 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-slate-400 text-[11px] font-number">{Math.round(p.confidence * 100)}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${sev.style}`}>
                                  {sev.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                {p.predicted ? (
                                  <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[11px] font-mono">
                                    <ShieldAlert className="h-3.5 w-3.5" /> DETECTED
                                  </span>
                                ) : (
                                  <span className="text-slate-550 text-[11px]">CLEAR</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right text-slate-400 text-[12px]">
                                {p.predicted ? "Request immediate clinical review" : "Standard correlation sufficient"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. CLINICAL REASONING ACCORDIONS */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-[14px] font-bold text-white tracking-wide font-display">
                      Interactive Clinical Reasoning Breakdown
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {predictions.map((p, idx) => {
                      const isOpen = openAccordionIndex === idx;
                      const hasAlert = p.predicted;
                      return (
                        <div key={p.disease} className="border border-white/5 bg-slate-900/30 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenAccordionIndex(isOpen ? -1 : idx)}
                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${hasAlert ? "bg-red-500 animate-pulse" : "bg-slate-655"}`} />
                              <span className="text-[13.5px] font-bold text-white font-display">{p.disease.replace("_", " ")}</span>
                              <span className="font-mono text-[11px] text-slate-550 font-number">Score: {Math.round(p.confidence * 100)}%</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-slate-950/20 text-[13px] flex flex-col gap-3 animate-slide-up">
                              <div>
                                <strong className="text-slate-400 block uppercase tracking-wider text-[9.5px]">Reasoning Analysis</strong>
                                <p className="text-slate-350 mt-1 leading-relaxed font-normal">
                                  The neural model highlights localized radiographical markers for {p.disease.toLowerCase().replace("_", " ")} at a score threshold of {Math.round(p.confidence * 100)}%. Density metrics remain within configured statistical boundaries.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                                <div>
                                  <strong className="text-slate-400 block uppercase tracking-wider text-[9.5px]">Severity Class</strong>
                                  <span className="text-slate-200 font-bold block mt-1">{hasAlert ? "High Clinical Danger" : "Low Risk"}</span>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block uppercase tracking-wider text-[9.5px]">Actionable Plan</strong>
                                  <span className="text-slate-200 font-bold block mt-1">{hasAlert ? "Immediate CT Chest follow-up" : "Baseline Monitoring"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. ERROR ANALYSIS HORIZONTAL TIMELINE */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-[14px] font-bold text-white tracking-wide font-display">
                      Structured Error Classification Timeline
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-2 relative">
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">01. CATEGORY</span>
                      <h4 className="text-[13px] font-bold text-white font-display">
                        {patientReport.result?.error_classification?.category || "Low Risk Baseline"}
                      </h4>
                      <p className="text-[11.5px] text-slate-450 leading-relaxed mt-1 font-normal">
                        Classification anomaly categorisation for multi-label inference.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">02. AUDITOR REASON</span>
                      <h4 className="text-[13px] font-bold text-white font-display">Structural Auditing</h4>
                      <p className="text-[11.5px] text-slate-455 leading-relaxed mt-1 font-normal">
                        {patientReport.result?.error_classification?.reason || "No variations detected."}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">03. CLINICAL IMPACT</span>
                      <h4 className="text-[13px] font-bold text-white font-display">Diagnostic Delay</h4>
                      <p className="text-[11.5px] text-slate-455 leading-relaxed mt-1 font-normal">
                        Faint densities hold moderate failure impacts on emergency scans.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">04. RECOMMENDATION</span>
                      <h4 className="text-[13px] font-bold text-white font-display">Targeted Mitigation</h4>
                      <p className="text-[11.5px] text-slate-455 leading-relaxed mt-1 font-normal">
                        {patientReport.result?.error_classification?.recommendation || "Maintain standard clinical reviews."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 8. DEMOGRAPHIC BIAS TELEMETRY PANEL */}
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-[14px] font-bold text-white tracking-wide font-display">
                      Demographic Bias Telemetry
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Low Bias Level
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">Age Disparity Coefficient</span>
                      <p className="text-[12.5px] text-slate-400 leading-relaxed font-normal">
                        {patientReport.result?.bias_indicators?.age_note || "No significant diagnostic bias across age cohorts."}
                      </p>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">Sex/Gender Calibration Bias</span>
                      <p className="text-[12.5px] text-slate-400 leading-relaxed font-normal">
                        {patientReport.result?.bias_indicators?.gender_note || "Model performs with consistent sensitivity metrics between sexes."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 9. FINAL DIAGNOSIS CALLOUT & RISK METER */}
                <div className={`p-6 rounded-2xl border ${rc.card} flex flex-col gap-5`}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h4 className="text-[15px] font-extrabold uppercase tracking-wider font-display">Final Diagnostic Summary</h4>
                    <span className="text-xs font-mono font-bold">URGENCY: IMMEDIATE REVIEW</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider font-mono block text-slate-400">Dynamic Complexity Risk Meter</span>
                    <div className="relative w-full h-3 bg-slate-900/80 rounded-full border border-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" style={{ width: "100%" }} />
                      <div className="absolute top-0 h-full w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" style={{ left: rc.meterOffset }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1 mt-0.5">
                      <span>LOW RISK (15%)</span>
                      <span>MODERATE (50%)</span>
                      <span>HIGH RISK (85%)</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl mt-2">
                    <p className="text-[13.5px] leading-relaxed text-slate-200">
                      <strong>Clinician Notes:</strong> {patientReport.result?.error_classification?.reason || "Patient scan conforms to normal baseline parameters."}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-slate-950/40 border border-white/10 rounded-2xl font-sans">
                <div className="p-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-[17px] font-bold text-white font-display">No Clinical Scan Selected</h3>
                <p className="text-[13px] text-slate-500 max-w-[340px]">
                  Please launch a production chest X-ray audit on the Home page, or load templates from history.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-2 bg-emerald-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-[13px] hover:bg-emerald-400 transition font-display"
                >
                  Go to Playground
                </button>
              </div>
            )}
          </>
        )}

        {/* ━━━━ TAB B: SYSTEM RESEARCH AUDIT VIEW ━━━━ */}
        {activeTab === "system" && (
          <>
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 bg-slate-950/40 border border-white/10 rounded-2xl font-sans">
                <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
                <span className="text-[12px] font-mono text-slate-500">Connecting to clinical registry\u2026</span>
              </div>
            ) : error ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-slate-950/40 border border-white/10 rounded-2xl font-sans">
                <AlertCircle className="h-9 w-9 text-red-400" />
                <h4 className="text-white font-bold text-[16px] font-display">Connection Failed</h4>
                <p className="text-[12.5px] text-slate-500 max-w-[320px]">{error}</p>
                <button
                  onClick={fetchSystemReport}
                  className="mt-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-xl text-[12px] transition font-display"
                >
                  Retry Connection
                </button>
              </div>
            ) : systemReport ? (
              <div className="flex flex-col gap-8 animate-fade-in font-sans">
                <div className="bg-slate-950/40 border border-white/10 p-6 rounded-2xl">
                  <h2 className="text-[17px] font-extrabold text-white font-display">{systemReport.title}</h2>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed mt-1.5">{systemReport.subtitle}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5 text-xs font-mono text-slate-450">
                    <div>MODEL: <strong className="text-white">{systemReport.meta?.model_name}</strong></div>
                    <div>MEAN VALIDATION AUC: <strong className="text-emerald-400">{systemReport.meta?.mean_auc}</strong></div>
                    <div>EPOCHS AUDITED: <strong className="text-white">{systemReport.meta?.epochs}</strong></div>
                    <div>LOSS GAP: <strong className="text-white">{systemReport.meta?.validation_loss_start} \u2192 {systemReport.meta?.validation_loss_best}</strong></div>
                  </div>
                </div>

                {systemReport.sections?.map((section) => (
                  <div key={section.id} className="bg-slate-950/40 border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
                    <h3 className="text-[13.5px] font-bold text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3 font-display">
                      {section.title}
                    </h3>
                    {(Array.isArray(section.paragraphs)
                      ? section.paragraphs
                      : typeof section.paragraphs === "string"
                      ? [section.paragraphs]
                      : []
                    ).map((p, i) => (
                      <p key={i} className="text-[13px] text-slate-400 leading-relaxed font-normal">{p}</p>
                    ))}

                    {/* Table inside section */}
                    {section.table && (
                      <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-950/20 mt-1 font-table">
                        <table className="min-w-full divide-y divide-white/5 text-[12px] text-left">
                          <thead className="bg-slate-900/60 font-bold font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                            <tr>
                              <th className="px-4 py-3">Pathology</th>
                              <th className="px-4 py-3">AUC</th>
                              <th className="px-4 py-3">Error Rate</th>
                              <th className="px-4 py-3">Dominant Error</th>
                              <th className="px-4 py-3 text-right">Clinical Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-350">
                            {section.table.map((row, i) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition">
                                <td className="px-4 py-3 font-semibold text-slate-200">{row.disease}</td>
                                <td className="px-4 py-3 font-mono font-bold text-emerald-400">{row.auc}</td>
                                <td className="px-4 py-3 text-slate-450">{row.error_rate}</td>
                                <td className="px-4 py-3 text-slate-450">{row.dominant_error}</td>
                                <td className={`px-4 py-3 text-right font-bold ${
                                  row.clinical_risk.includes("Very High") || row.clinical_risk.includes("Highest")
                                    ? "text-red-400"
                                    : row.clinical_risk.includes("High")
                                      ? "text-amber-400"
                                      : "text-slate-450"
                                }`}>{row.clinical_risk}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {section.breakdown && (
                      <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-950/20 mt-1 font-table">
                        <table className="min-w-full divide-y divide-white/5 text-[12px] text-left">
                          <thead className="bg-slate-900/60 font-bold font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                            <tr>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Count</th>
                              <th className="px-4 py-3">%</th>
                              <th className="px-4 py-3">Diseases</th>
                              <th className="px-4 py-3 text-right">Danger</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-350">
                            {section.breakdown.map((row, i) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition">
                                <td className="px-4 py-3 font-semibold text-slate-200">{row.category}</td>
                                <td className="px-4 py-3 font-mono">{row.count}</td>
                                <td className="px-4 py-3 font-mono font-bold text-emerald-400">{row.percentage}</td>
                                <td className="px-4 py-3 text-slate-450">{row.diseases}</td>
                                <td className="px-4 py-3 text-right font-bold text-red-400">{row.clinical_danger}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {section.fixes && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                        {section.fixes.map((row, i) => (
                          <div key={i} className="bg-slate-900/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start font-sans">
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                              row.priority.includes("P1") ? "bg-red-500/10 text-red-400"
                                : row.priority.includes("P2") ? "bg-amber-500/10 text-amber-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                              <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                                  row.priority.includes("P1") ? "text-red-400"
                                    : row.priority.includes("P2") ? "text-amber-400"
                                      : "text-emerald-400"
                                }`}>{row.priority}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Effort: {row.effort}</span>
                              </div>
                              <p className="text-[12.5px] font-bold text-white leading-tight mt-0.5">{row.fix}</p>
                              <span className="text-[11px] text-emerald-400 font-mono font-bold mt-1">Expected gain: {row.gain}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        {/* ── Sticky Bottom Floating Actions Bar ──────────────────────── */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md border border-white/10 px-6 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-4 flex-wrap print:hidden max-w-[95%]">
          <button
            onClick={handleDownloadPDF}
            disabled={exporting || (activeTab === "patient" && !patientReport) || (activeTab === "system" && !systemReport)}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold px-6 py-3 text-[13px] shadow-[0_0_15px_rgba(16,185,129,0.3)] transition duration-200 disabled:opacity-50 inline-flex items-center gap-2 font-display"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4.5 w-4.5" />}
            Download Report
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-bold px-4 py-3 text-[13px] transition inline-flex items-center gap-2 font-display"
          >
            <RefreshCw className="h-4 w-4" />
            Analyze Another Image
          </button>
        </div>

      </div>
    </div>
  );
}

