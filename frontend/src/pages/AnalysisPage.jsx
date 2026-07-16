import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  Upload,
  ArrowRight,
  RefreshCw,
  CornerDownRight,
  FileText,
  Loader2,
  Download
} from "lucide-react";
import { StepCard } from "../components/StepCard";
import { DiseaseTable } from "../components/DiseaseTable";
import { GradCAMViewer } from "../components/GradCAMViewer";
import { analyzeImage } from "../api/analyze";

export function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get uploaded file and optional parameters from router state
  const { file: initialFile, ageGroup, gender, viewPosition } = location.state || {};

  const [localFile, setLocalFile] = useState(null);
  const activeFile = initialFile || localFile;

  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  // Drag and drop states
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Recent analyses state
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Accordion state for Step 7
  const [openIndex, setOpenIndex] = useState(0);

  const [successAnimation, setSuccessAnimation] = useState(false);

  // Load recent analyses on mount and when loading state completes
  useEffect(() => {
    try {
      const historyVal = localStorage.getItem("cxr_history");
      const history = historyVal ? JSON.parse(historyVal) : [];
      if (Array.isArray(history)) {
        setRecentAnalyses(history.filter(Boolean).slice(0, 3));
      } else {
        setRecentAnalyses([]);
      }
    } catch (e) {
      console.error("Failed to load history list", e);
      setRecentAnalyses([]);
    }
  }, [loading]);

  // Set up object URL for local image preview
  useEffect(() => {
    if (activeFile) {
      const url = URL.createObjectURL(activeFile);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [activeFile]);

  // Execute API call on mount
  useEffect(() => {
    if (!activeFile) return;
    performAnalysis();
  }, [activeFile]);

  // Asymptotic progress bar growth during loading
  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + (90 - prev) * 0.1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (result) {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [loading, result]);

  const performAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccessAnimation(false);

    const formData = new FormData();
    formData.append("image", activeFile);
    if (ageGroup) {
      formData.append("age_group", ageGroup);
    }
    if (gender) {
      formData.append("gender", gender);
    }

    try {
      const data = await analyzeImage(formData);
      setResult(data);
      
      // Save this result to the local history list
      try {
        const history = JSON.parse(localStorage.getItem("cxr_history") || "[]");
        const newRecord = {
          id: data.history_id || Math.random().toString(36).substr(2, 9).toUpperCase(),
          filename: activeFile?.name || "Uploaded Image",
          timestamp: new Date().toLocaleString(),
          ageGroup: ageGroup || "Not Provided",
          gender: gender || "Not Provided",
          viewPosition: viewPosition || "PA",
          result: data
        };
        history.unshift(newRecord);
        localStorage.setItem("cxr_history", JSON.stringify(history));
        localStorage.setItem("cxr_active_analysis", JSON.stringify(newRecord));
        
        // Show success animation then navigate to report
        setSuccessAnimation(true);
        setTimeout(() => {
          navigate("/report", { state: { file: activeFile, fromScan: true } });
        }, 2200);
      } catch (e) {
        console.error("Failed to update history localstorage:", e);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Analysis failed. The backend may be offline or the image could not be processed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfReportRef = useRef(null);

  // Helper for downloading a styled PDF clinical report
  const downloadReport = async () => {
    if (!result) return;
    setPdfLoading(true);

    try {
      const element = pdfReportRef.current;
      if (!element) return;

      const html2pdf = window.html2pdf;
      if (!html2pdf) {
        throw new Error("html2pdf library not preloaded. Please refresh the page.");
      }

      const baseName = activeFile?.name ? activeFile.name.replace(/\.[^/.]+$/, "") : "report";
      
      const opt = {
        margin:       10, // 10mm top/bottom margins
        filename:     `CXR_Audit_Report_${baseName}.pdf`,
        image:        { type: 'png', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: 794 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback text report in case of blockers
      const detected = result.predictions
        .filter((p) => p.predicted)
        .map((p) => ` - ${p.disease} (${Math.round(p.confidence * 100)}%)`)
        .join("\n");

      const content = `CHEST X-RAY SYSTEMATIC AI AUDIT REPORT
=====================================
Image File: ${activeFile?.name || "Uploaded Image"}
Size: ${activeFile ? (activeFile.size / 1024).toFixed(1) + " KB" : "Unknown"}
Age Group: ${ageGroup || "Not Provided"}
Gender: ${gender || "Not Provided"}
-------------------------------------
1. DISEASE INFERENCE & CONSTRAINTS:
${detected || " - No pathologies detected above 50% threshold."}

2. AUDITOR RISK REASONING:
Category: ${result.error_classification?.category}
Reason: ${result.error_classification?.reason}
Recommendation: ${result.error_classification?.recommendation}

3. CLINICAL DECISION SUMMARY:
Diagnosis: ${result.final_summary?.diagnosis}
Risk Level: ${result.final_summary?.risk_level}
Suggested Action: ${result.final_summary?.suggested_action}
=====================================
Report generated by Agentic AI Healthcare Prediction System.
`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CXR_Audit_Report_${activeFile?.name || "report"}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setLocalFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLocalFile(e.target.files[0]);
    }
  };

  // Handle redirect if no image is uploaded (e.g. direct url access)
  if (!activeFile) {
    return (
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col items-center justify-center bg-[#0F172A] px-6 py-12 md:py-20 relative overflow-hidden transition-all duration-200 ${
          isDragActive ? "bg-slate-950/60" : ""
        }`}
      >
        {/* Decorative Blur Blobs */}
        <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full filter blur-[85px] pointer-events-none" />

        <div className="max-w-4xl w-full flex flex-col gap-10 relative z-10 font-sans select-none">
          {/* Main Hero Upload Box */}
          <div className={`w-full bg-white/[0.03] border rounded-2xl p-8 md:p-12 flex flex-col items-center gap-6 text-center transition ${
            isDragActive ? "border-emerald-500 bg-emerald-500/[0.02] shadow-[0_0_25px_rgba(16,185,129,0.15)]" : "border-white/[0.08] hover:border-white/12"
          }`}>
            <div className="relative h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
              <div className="h-16 w-16 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Upload className="h-6 w-6 text-emerald-400 animate-bounce" />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-lg">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
                Upload chest radiograph for AI clinical audit
              </h2>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Drag and drop your chest X-ray file here, or click to browse. Supports PA/AP view positions.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 px-8 py-3.5 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition duration-200"
            >
              Upload X-ray File
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/png, image/jpeg" 
            />
          </div>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase">01 / DIAGNOSIS</span>
              <h4 className="text-sm font-bold text-white">14 Pathology Classes</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Multi-label classifier covering Cardiomegaly, Effusion, Pneumonia, Consolidation, and more.
              </p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase">02 / EXPLANATION</span>
              <h4 className="text-sm font-bold text-white">AI Clinical Reasoning</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Audits pipeline warnings, identifies false negative risks, and generates clinical recommendations.
              </p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase">03 / REPORT</span>
              <h4 className="text-sm font-bold text-white">Clinical PDF Export</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Generates structured multi-page PDF diagnostics complete with clinician signature fields.
              </p>
            </div>
          </div>

          {/* Recent analyses section */}
          {Array.isArray(recentAnalyses) && recentAnalyses.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Recent Audits</h3>
              <div className="flex flex-col gap-2.5 bg-slate-900/20 border border-white/5 p-4 rounded-xl">
                {recentAnalyses.filter(Boolean).map((item) => (
                  <div key={item?.id || item?.timestamp || Math.random().toString()} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                        #{item?.id || `CXR-${item?.history_id || "SCAN"}`}
                      </span>
                      <span className="text-slate-300 truncate max-w-[200px]">{item?.filename || "Uploaded Image"}</span>
                      <span className="text-slate-500 text-[10px] hidden sm:inline">{item?.timestamp}</span>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem("cxr_active_analysis", JSON.stringify(item));
                        localStorage.setItem("cxr_auto_download", "true");
                        navigate("/report");
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-350 flex items-center gap-1 transition"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Define Step 4 styling properties based on error type
  const getStep4Colors = (type) => {
    switch (type) {
      case "FN_risk":
        return {
          cardBg: "bg-[#fdecea] border-[#b71c1c]/10",
          badgeBg: "bg-[#b71c1c] text-white",
          label: "False Negative Risk",
          textColor: "text-[#b71c1c]"
        };
      case "FP_risk":
        return {
          cardBg: "bg-[#fff8e1] border-[#a05c00]/10",
          badgeBg: "bg-[#a05c00] text-white",
          label: "False Positive Risk",
          textColor: "text-[#a05c00]"
        };
      case "low_risk":
      default:
        return {
          cardBg: "bg-[#e8f5e9] border-[#1a7a3c]/10",
          badgeBg: "bg-[#1a7a3c] text-white",
          label: "Low Risk",
          textColor: "text-[#1a7a3c]"
        };
    }
  };

  const step4Config = result ? getStep4Colors(result.error_reasoning?.type) : null;

  return (
    <div className="relative min-h-screen bg-[#0F172A] pb-24 flex flex-col">
      {/* Sticky Progress Bar at the top of the page */}
      <div className="sticky top-0 z-50 w-full bg-slate-950 border-b border-white/5 h-1">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {successAnimation ? (
        <div className="flex-1 min-h-[75vh] flex flex-col items-center justify-center text-center px-6 select-none animate-fade-in">
          <div className="relative flex items-center justify-center h-28 w-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border border-emerald-500/25 animate-ping opacity-60" />
            <div className="absolute inset-2 rounded-full border border-emerald-500/35 animate-pulse" style={{ animationDuration: "1.5s" }} />
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg
                className="h-8 w-8 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-white font-display">
            ✓ Analysis Complete
          </h2>
          <p className="text-[12px] text-slate-400 font-mono tracking-widest uppercase mt-2.5 animate-pulse">
            Generating Report...
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-[760px] w-full px-8 py-10 flex flex-col gap-6 font-sans select-none">
        {/* Header Title */}
        <div className="flex flex-col gap-2 border-b border-white/5 pb-5">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight font-display">
            Systematic AI Chest X-ray Pipeline
          </h1>
          <p className="text-[14px] text-slate-400">
            Real-time audit, diagnostic explanation, and demographic fairness constraints.
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex flex-col gap-4 p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-450 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="text-[15px] font-bold text-red-450 uppercase tracking-wide">Analysis Failed</h4>
                <p className="text-[13.5px] leading-relaxed text-red-300/90 font-mono mt-1">{error}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={performAnalysis}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-505 px-5 py-2.5 text-[13px] font-bold text-white transition"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Analysis
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[13px] font-semibold text-slate-300 hover:bg-white/10 hover:border-white/20 transition"
              >
                Cancel and Go Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Upload Image (Always displayed immediately) */}
        <StepCard stepNumber={1} title="Upload Image" isLoading={false}>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-[#e2e8f0] p-4 rounded-lg">
            {imageSrc && (
              <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 bg-black flex items-center justify-center shrink-0">
                <img
                  src={imageSrc}
                  alt="Thumbnail"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-slate-700 text-[14px]">
                {activeFile?.name || "Uploaded Image"}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {activeFile ? (activeFile.size / 1024).toFixed(1) : "0"} KB
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-[13px] text-[#2471a3] font-medium animate-pulse shrink-0">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running AI pipeline...
              </div>
            )}
          </div>
        </StepCard>

        {/* STEP 2: Disease Predictions & Confidence */}
        <StepCard
          stepNumber={2}
          title="Disease Predictions and Confidence Scores"
          isLoading={loading || !result}
        >
          {result && <DiseaseTable predictions={result.predictions} />}
        </StepCard>

        {/* STEP 3: Explainability - Grad-CAM */}
        <StepCard
          stepNumber={3}
          title="Explainability — Grad-CAM Heatmap"
          isLoading={loading || !result}
        >
          {result && (
            <GradCAMViewer originalSrc={imageSrc} heatmapBase64={result.gradcam_base64} />
          )}
        </StepCard>

        {/* STEP 4: Error Reasoning (Risk analysis card) */}
        <StepCard
          stepNumber={4}
          title="Error Reasoning — False Negative / False Positive Risk"
          isLoading={loading || !result}
        >
          {result && (
            <div className={`p-5 rounded-lg border ${step4Config.cardBg} flex flex-col gap-3`}>
              <div>
                <span
                  className={`inline-flex rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${step4Config.badgeBg}`}
                >
                  {step4Config.label}
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-slate-800 font-normal">
                {result.error_reasoning?.explanation}
              </p>
              <div className="border-t border-slate-200/50 pt-2 text-[12px] text-slate-400">
                FN Risk = the model may have missed a disease that is present. FP Risk = the
                model may have flagged a disease that is not present.
              </div>
            </div>
          )}
        </StepCard>

        {/* STEP 5: Error Classification, Reason, Recommendation */}
        <StepCard
          stepNumber={5}
          title="Error Classification, Reason and Recommendation"
          isLoading={loading || !result}
        >
          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${step4Config.textColor}`} />
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${step4Config.badgeBg}`}
                  >
                    {result.error_classification?.category}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2 text-[#2471a3]">
                  <Info className="h-4 w-4" />
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                    Reason
                  </span>
                </div>
                <p className="text-[14px] leading-normal text-slate-700 font-normal">
                  {result.error_classification?.reason}
                </p>
              </div>

              {/* Recommendation */}
              <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2 text-[#1a7a3c]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommendation
                  </span>
                </div>
                <p className="text-[14px] leading-normal text-slate-700 font-normal">
                  {result.error_classification?.recommendation}
                </p>
              </div>
            </div>
          )}
        </StepCard>

        {/* STEP 6: Bias Indicators */}
        <StepCard
          stepNumber={6}
          title="Bias Indicators — Age Group and Gender Risk Note"
          isLoading={loading || !result}
        >
          {result && (
            <div className="flex flex-col gap-3">
              {!ageGroup && !gender ? (
                <div className="flex items-center gap-2 p-4 bg-[#fff8e1]/40 border border-[#a05c00]/10 rounded-lg text-slate-600 text-[14px]">
                  <Info className="h-4 w-4 text-[#a05c00] shrink-0" />
                  <span>Provide age group or gender for personalized bias analysis.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age Group Bias Note */}
                  <div className="flex flex-col p-4 bg-[#fff8e1]/40 border-l-4 border-[#a05c00] border-t border-r border-b border-slate-100 rounded-r-lg">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Age Group Risk
                    </span>
                    <p className="text-[13px] leading-relaxed text-slate-700">
                      {result.bias_indicators?.age_note || (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </p>
                  </div>

                  {/* Gender Bias Note */}
                  <div className="flex flex-col p-4 bg-[#fff8e1]/40 border-l-4 border-[#a05c00] border-t border-r border-b border-slate-100 rounded-r-lg">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Gender Risk
                    </span>
                    <p className="text-[13px] leading-relaxed text-slate-700">
                      {result.bias_indicators?.gender_note || (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="text-[11px] text-slate-400 mt-1 italic">
                * Bias notes are generated by an LLM and are indicative, not clinically validated.
              </div>
            </div>
          )}
        </StepCard>

        {/* STEP 7: Disease Explanations Accordion */}
        <StepCard
          stepNumber={7}
          title="Disease Explanation and Model Confidence"
          isLoading={loading || !result}
        >
          {result && (
            <div className="flex flex-col gap-3">
              {result.disease_explanations.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[14px]">
                  No diseases detected with sufficient confidence. Model confidence remains below the
                  50% threshold for all 14 classes.
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden bg-white">
                  {result.disease_explanations.map((exp, index) => {
                    const isOpen = openIndex === index;
                    return (
                      <div key={exp.disease} className="flex flex-col">
                        {/* Header */}
                        <button
                          type="button"
                          onClick={() => setOpenIndex(isOpen ? -1 : index)}
                          className="flex items-center justify-between p-4 text-left w-full hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900 text-[14px]">
                              {exp.disease}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                              Active Prediction
                            </span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {/* Body */}
                        {isOpen && (
                          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-2">
                            <p className="text-[14px] leading-relaxed text-slate-700 font-normal">
                              {exp.explanation}
                            </p>
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mt-2 font-medium">
                              <CornerDownRight className="h-3.5 w-3.5" />
                              <span>{exp.confidence_note}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </StepCard>

        {/* STEP 8: Final Diagnosis Summary, Risk Level, Suggested Action */}
        <StepCard
          stepNumber={8}
          title="Final Diagnosis Summary, Risk Level and Suggested Action"
          isLoading={loading || !result}
        >
          {result && (
            <div className="flex flex-col gap-6">
              {/* Highlighted Main Card */}
              <div className="flex flex-col gap-4 p-6 bg-white border border-[#e2e8f0] border-l-4 border-l-[#1a3a5c] rounded-r-lg shadow-xs">
                {/* Row 1: Diagnosis */}
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Diagnosis
                  </span>
                  <p className="text-[16px] font-semibold text-[#1a3a5c]">
                    {result.final_summary?.diagnosis}
                  </p>
                </div>

                {/* Row 2: Risk Level */}
                <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Risk Level
                  </span>
                  <div>
                    {result.final_summary?.risk_level === "High" && (
                      <span className="inline-flex items-center rounded-full bg-[#fdecea] px-3 py-1 text-[12px] font-semibold text-[#b71c1c] border border-[#b71c1c]">
                        High Risk
                      </span>
                    )}
                    {result.final_summary?.risk_level === "Medium" && (
                      <span className="inline-flex items-center rounded-full bg-[#fff8e1] px-3 py-1 text-[12px] font-semibold text-[#a05c00] border border-[#a05c00]">
                        Medium Risk
                      </span>
                    )}
                    {result.final_summary?.risk_level === "Low" && (
                      <span className="inline-flex items-center rounded-full bg-[#e8f5e9] px-3 py-1 text-[12px] font-semibold text-[#1a7a3c] border border-[#1a7a3c]">
                        Low Risk
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 3: Suggested Action */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Suggested Action
                  </span>
                  <div className="flex items-start gap-2 mt-1">
                    <ArrowRight className="h-4 w-4 text-[#1a3a5c] shrink-0 mt-1" />
                    <p className="text-[14px] leading-relaxed text-slate-700">
                      {result.final_summary?.suggested_action}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons below card */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={downloadReport}
                  disabled={pdfLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-[#2471a3] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#1a3a5c] transition duration-150 disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {pdfLoading ? "Generating PDF..." : "Download Report (PDF)"}
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-[#2471a3] bg-white px-5 py-3 text-[14px] font-semibold text-[#2471a3] hover:bg-[#2471a3]/5 transition duration-150"
                >
                  Analyze Another Image
                </button>
              </div>
            </div>
          )}
        </StepCard>
      </div>
      )}

      {/* Hidden printable container for PDF generation */}
      {result && (
        <div style={{ position: "absolute", top: 0, left: 0, zIndex: -10, pointerEvents: "none" }}>
          <div
            ref={pdfReportRef}
            className="w-[794px] bg-white p-12 font-sans flex flex-col gap-8 mx-auto text-slate-800"
            style={{ boxSizing: "border-box", overflow: "visible", wordBreak: "break-word" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-6 w-full">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">ImagePulse Clinical Audit</h1>
                <p className="text-[12px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Patient Diagnostic Report</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-[13px] font-bold text-slate-700">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-3 gap-0 bg-slate-50 border border-slate-200 rounded-xl shadow-sm w-full overflow-hidden">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age Group</span>
                <p className="text-[14px] font-semibold text-slate-700 mt-2">{ageGroup ? ageGroup.replace("_", " ") : "Not Provided"}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 text-center border-l border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</span>
                <p className="text-[14px] font-semibold text-slate-700 mt-2">{gender || "Not Provided"}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">View Position</span>
                <p className="text-[14px] font-semibold text-slate-700 mt-2">{viewPosition || "PA"}</p>
              </div>
            </div>

            {/* Severity Banner */}
            <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between w-full ${
              result.final_summary?.risk_level === "High"
                ? "bg-red-50 border-red-200 text-red-800"
                : result.final_summary?.risk_level === "Medium"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-green-50 border-green-200 text-green-800"
            }`}>
              <div className="flex flex-col justify-center flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">Complexity / Risk Level</span>
                <span className="text-xl font-extrabold uppercase tracking-wide">{result.final_summary?.risk_level || "Low"} Risk</span>
              </div>
              <div className="flex flex-col items-end justify-center flex-1 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">Diagnosis</span>
                <span className="text-[14px] font-bold leading-snug block max-w-[300px]">{result.final_summary?.diagnosis}</span>
              </div>
            </div>

            {/* Findings Table */}
            <div className="w-full flex flex-col items-center">
              <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-widest mb-6 text-center w-full">Thoracic Findings</h3>
              <div className="w-full border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
                {result.predictions.map((p) => (
                  <div key={p.disease} className="flex items-center justify-between gap-6 px-6 py-4 text-[13px]" style={{ pageBreakInside: "avoid" }}>
                    <div className="w-36 font-semibold text-slate-800">{p.disease.replace("_", " ")}</div>
                    <div className="flex-1 flex items-center gap-6">
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p.predicted
                              ? result.final_summary?.risk_level === "High"
                                ? "bg-red-500"
                                : "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.round(p.confidence * 100)}%` }}
                        />
                      </div>
                      <div className="w-12 text-right font-bold text-slate-650 font-mono text-[11px]">{Math.round(p.confidence * 100)}%</div>
                    </div>
                    <div className="w-24 flex justify-end">
                      <span className={`w-full text-center text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
                        p.predicted
                          ? result.final_summary?.risk_level === "High"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}>
                        {p.predicted ? "Active" : "Clear"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning & Failures */}
            <div className="flex flex-col gap-8 w-full">
              {/* Auditor Risk Analysis */}
              <div className="border border-slate-200 p-6 rounded-xl shadow-sm w-full" style={{ overflow: "visible", pageBreakInside: "avoid" }}>
                <h4 className="text-[13px] font-bold text-[#1a3a5c] uppercase tracking-widest mb-6 text-center">Auditor Risk Analysis</h4>
                <div className="grid grid-cols-2 gap-8 h-full">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Error Classification</span>
                    <span className="text-[13px] font-bold text-slate-800" style={{ wordBreak: "break-word" }}>{result.error_classification?.category}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Reasoning</span>
                    <p className="text-[13px] text-slate-600 leading-relaxed" style={{ wordBreak: "break-word" }}>{result.error_classification?.reason}</p>
                  </div>
                </div>
              </div>
              {/* Clinical Guidance */}
              <div className="border border-slate-200 p-6 rounded-xl shadow-sm w-full" style={{ overflow: "visible", pageBreakInside: "avoid" }}>
                <h4 className="text-[13px] font-bold text-[#1a3a5c] uppercase tracking-widest mb-6 text-center">Clinical Guidance</h4>
                <div className="grid grid-cols-2 gap-8 h-full">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Suggested Action</span>
                    <p className="text-[13px] text-slate-700 font-semibold leading-relaxed" style={{ wordBreak: "break-word" }}>{result.final_summary?.suggested_action}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Recommendation Details</span>
                    <p className="text-[13px] text-slate-600 leading-relaxed" style={{ wordBreak: "break-word" }}>{result.error_classification?.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographic Bias Notes */}
            <div className="border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50 w-full" style={{ pageBreakInside: "avoid" }}>
              <h4 className="text-[13px] font-bold text-[#1a3a5c] uppercase tracking-widest mb-6 text-center">Demographic Bias Indicators</h4>
              <div className="grid grid-cols-2 gap-8 text-[13px]">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 block mb-2">Age Bias Note</span>
                  <p className="text-slate-500 leading-relaxed font-normal">{result.bias_indicators?.age_note || "No age metadata provided"}</p>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 block mb-2">Gender Bias Note</span>
                  <p className="text-slate-500 leading-relaxed font-normal">{result.bias_indicators?.gender_note || "No gender metadata provided"}</p>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="text-[11px] font-medium tracking-wide text-slate-400 text-center border-t border-slate-200 pt-6 mt-4 w-full">
              This analysis was generated by the ImagePulse pipeline. For research and educational use only.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
