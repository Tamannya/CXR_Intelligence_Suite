import { useState, useEffect } from "react";
import { 
  Download, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Trash2, 
  Database, 
  Eye, 
  CornerDownRight, 
  TrendingUp,
  Activity
} from "lucide-react";

// Mock data structures to populate demo history cases
const DEMO_CASES = [
  {
    id: "DEMO-NORMAL-001",
    filename: "NIH_CXR_Normal_002891.png",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleString(), // 15 mins ago
    ageGroup: "Under 40",
    gender: "Male",
    viewPosition: "PA",
    result: {
      predictions: [
        { disease: "Atelectasis", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Cardiomegaly", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Effusion", confidence: 0.03, predicted: false, ground_truth: false },
        { disease: "Infiltration", confidence: 0.04, predicted: false, ground_truth: false },
        { disease: "Mass", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Nodule", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Pneumonia", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Pneumothorax", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Consolidation", confidence: 0.03, predicted: false, ground_truth: false },
        { disease: "Edema", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Emphysema", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Fibrosis", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Pleural_Thickening", confidence: 0.03, predicted: false, ground_truth: false },
        { disease: "Hernia", confidence: 0.01, predicted: false, ground_truth: false }
      ],
      error_classification: {
        category: "Low Risk",
        reason: "No significant visual anomalies or density variations identified in lung borders.",
        recommendation: "Routine outpatient observation; no radiological anomalies detected."
      },
      error_reasoning: {
        type: "low_risk",
        explanation: "The classification model has zero confidence markers above the 50% detection threshold. The anatomical structures appear completely clear."
      },
      final_summary: {
        diagnosis: "No active disease process identified.",
        risk_level: "Low",
        suggested_action: "Routine clinical correlation is sufficient."
      },
      disease_explanations: [],
      bias_indicators: {
        age_note: "No age-related diagnostic bias detected for this young patient cohort.",
        gender_note: "Model performance matches standard validation baseline specificity metrics."
      },
      gradcam_base64: null
    }
  },
  {
    id: "DEMO-PNEUMO-002",
    filename: "NIH_CXR_Pneumothorax_08849.png",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleString(), // 2 hours ago
    ageGroup: "Age 40 to 60",
    gender: "Female",
    viewPosition: "AP",
    result: {
      predictions: [
        { disease: "Atelectasis", confidence: 0.12, predicted: false, ground_truth: false },
        { disease: "Cardiomegaly", confidence: 0.08, predicted: false, ground_truth: false },
        { disease: "Effusion", confidence: 0.15, predicted: false, ground_truth: false },
        { disease: "Infiltration", confidence: 0.22, predicted: false, ground_truth: false },
        { disease: "Mass", confidence: 0.11, predicted: false, ground_truth: false },
        { disease: "Nodule", confidence: 0.05, predicted: false, ground_truth: false },
        { disease: "Pneumonia", confidence: 0.08, predicted: false, ground_truth: false },
        { disease: "Pneumothorax", confidence: 0.89, predicted: true, ground_truth: true },
        { disease: "Consolidation", confidence: 0.04, predicted: false, ground_truth: false },
        { disease: "Edema", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Emphysema", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Fibrosis", confidence: 0.03, predicted: false, ground_truth: false },
        { disease: "Pleural_Thickening", confidence: 0.06, predicted: false, ground_truth: false },
        { disease: "Hernia", confidence: 0.01, predicted: false, ground_truth: false }
      ],
      error_classification: {
        category: "Critical Pathology Alert",
        reason: "Right-sided apical pleural separation line observed with matching low-density parenchyma.",
        recommendation: "Immediate chest tube decompression consult advised."
      },
      error_reasoning: {
        type: "FN_risk",
        explanation: "A distinct pneumothorax edge is highlighted on the right lateral side. Highly critical finding that requires emergency clinical intervention."
      },
      final_summary: {
        diagnosis: "Large Right apical Pneumothorax.",
        risk_level: "High",
        suggested_action: "Urgent thoracic surgery review for chest tube insertion."
      },
      disease_explanations: [
        {
          disease: "Pneumothorax",
          explanation: "Subtle separation of the visceral and parietal pleura is identified with absent pulmonary markings in the right apical field.",
          confidence_note: "Model confidence is 89%, well above critical diagnostic threshold limits."
        }
      ],
      bias_indicators: {
        age_note: "Slight specificity variations exist in middle-aged cohorts. Cross-evaluate with physical symptoms.",
        gender_note: "High confidence baseline; female demographic is well-represented in the validation database."
      },
      gradcam_base64: null
    }
  },
  {
    id: "DEMO-CARDIO-003",
    filename: "NIH_CXR_Cardiomegaly_039281.png",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleString(), // 1 day ago
    ageGroup: "Over 60",
    gender: "Female",
    viewPosition: "PA",
    result: {
      predictions: [
        { disease: "Atelectasis", confidence: 0.38, predicted: false, ground_truth: false },
        { disease: "Cardiomegaly", confidence: 0.92, predicted: true, ground_truth: true },
        { disease: "Effusion", confidence: 0.68, predicted: true, ground_truth: false }, // FP error
        { disease: "Infiltration", confidence: 0.14, predicted: false, ground_truth: false },
        { disease: "Mass", confidence: 0.05, predicted: false, ground_truth: false },
        { disease: "Nodule", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Pneumonia", confidence: 0.15, predicted: false, ground_truth: false },
        { disease: "Pneumothorax", confidence: 0.02, predicted: false, ground_truth: false },
        { disease: "Consolidation", confidence: 0.08, predicted: false, ground_truth: false },
        { disease: "Edema", confidence: 0.25, predicted: false, ground_truth: false },
        { disease: "Emphysema", confidence: 0.01, predicted: false, ground_truth: false },
        { disease: "Fibrosis", confidence: 0.03, predicted: false, ground_truth: false },
        { disease: "Pleural_Thickening", confidence: 0.12, predicted: false, ground_truth: false },
        { disease: "Hernia", confidence: 0.01, predicted: false, ground_truth: false }
      ],
      error_classification: {
        category: "Subtle Pathology / Shadow Confusion",
        reason: "Cardiac silhouette shadow enlargement masks adjacent costophrenic angle.",
        recommendation: "Order lateral chest views to audit secondary pleural fluid levels."
      },
      error_reasoning: {
        type: "FP_risk",
        explanation: "Model has flagged Effusion. However, clinical report indicates simple cardiomegaly boundary shadows. This represents a false positive risk."
      },
      final_summary: {
        diagnosis: "Cardiomegaly with false positive pleural effusion indication.",
        risk_level: "Medium",
        suggested_action: "Audit with lateral views and clinical echocardiogram correlation."
      },
      disease_explanations: [
        {
          disease: "Cardiomegaly",
          explanation: "Cardiac-to-thoracic diameter ratio exceeds 0.55 on the posteroanterior view projection.",
          confidence_note: "Model is 92% confident. High shape distinctiveness ensures strong calibration."
        }
      ],
      bias_indicators: {
        age_note: "Patients over 60 show elevated shadow masking. Specificity drops by 12% in this group.",
        gender_note: "No significant variations detected across female validation statistics."
      },
      gradcam_base64: null
    }
  }
];

function ChestXraySVG({ hasHeat }) {
  return (
    <div className="relative w-full aspect-square max-h-[340px] bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center p-4">
      <svg
        className="h-full w-full text-slate-600"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(16, 185, 129, 0.08)" strokeDasharray="2 2" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(16, 185, 129, 0.08)" strokeDasharray="2 2" />
        {/* Spine */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Clavicles */}
        <path d="M12,22 Q35,26 50,24 Q65,26 88,22" stroke="rgba(255,255,255,0.22)" />
        {/* Rib cage */}
        <path d="M22,30 Q50,33 78,30" stroke="rgba(255,255,255,0.12)" />
        <path d="M20,40 Q50,44 80,40" stroke="rgba(255,255,255,0.12)" />
        <path d="M19,50 Q50,54 81,50" stroke="rgba(255,255,255,0.12)" />
        <path d="M20,60 Q50,64 80,60" stroke="rgba(255,255,255,0.12)" />
        <path d="M23,70 Q50,74 77,70" stroke="rgba(255,255,255,0.10)" />
        <path d="M28,80 Q50,83 72,80" stroke="rgba(255,255,255,0.08)" />
        {/* Lungs */}
        <path d="M26,24 Q46,21 46,65 Q46,80 24,75 Z" fill="#1e293b" fillOpacity="0.5" stroke="rgba(255,255,255,0.15)" />
        <path d="M74,24 Q54,21 54,65 Q54,80 76,75 Z" fill="#1e293b" fillOpacity="0.5" stroke="rgba(255,255,255,0.15)" />
        {/* Heart outline */}
        <path d="M41,49 Q50,67 63,58 Q54,46 41,49 Z" stroke="rgba(255,255,255,0.2)" fill="rgba(16, 185, 129, 0.06)" />
      </svg>
      {hasHeat && (
        <div className="absolute top-[35%] left-[20%] h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.7)_0%,_rgba(245,158,11,0.4)_40%,_rgba(16,185,129,0.15)_70%,_transparent_100%)] mix-blend-screen pointer-events-none animate-pulse" />
      )}
    </div>
  );
}

export function Results() {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("overlay"); // overlay, original, side-by-side
  const [openExplanationIndex, setOpenExplanationIndex] = useState(0);

  // Sync state with local storage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("cxr_history") || "[]");
      setHistory(stored);
      if (stored.length > 0) {
        setSelectedItem(stored[0]);
        localStorage.setItem("cxr_active_analysis", JSON.stringify(stored[0]));
      } else {
        setSelectedItem(null);
        localStorage.removeItem("cxr_active_analysis");
      }
    } catch (e) {
      console.error("Failed loading cxr history", e);
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedItem(record);
    localStorage.setItem("cxr_active_analysis", JSON.stringify(record));
    setOpenExplanationIndex(0);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your clinical audit search history?")) {
      localStorage.removeItem("cxr_history");
      localStorage.removeItem("cxr_active_analysis");
      setHistory([]);
      setSelectedItem(null);
    }
  };

  const handleLoadDemos = () => {
    localStorage.setItem("cxr_history", JSON.stringify(DEMO_CASES));
    localStorage.setItem("cxr_active_analysis", JSON.stringify(DEMO_CASES[0]));
    setHistory(DEMO_CASES);
    setSelectedItem(DEMO_CASES[0]);
    setOpenExplanationIndex(0);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Filter list by search criteria
  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Empty state rendering
  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F172A] px-4 py-20 relative overflow-hidden select-none">
        
        {/* Abstract Blur Glows */}
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-teal-500/5 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="w-full max-w-[500px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center gap-6 relative z-10">
          <div className="rounded-full bg-emerald-500/10 p-5 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-white tracking-wide font-display">No Clinical History Found</h2>
            <p className="text-[13.5px] text-slate-400 mt-2.5 leading-relaxed max-w-[340px]">
              You have not analyzed any chest X-ray scans yet. Run a prediction audit on the Home tab, or pre-populate case templates below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              onClick={handleLoadDemos}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold py-3 text-[13px] shadow-[0_0_15px_rgba(16,185,129,0.2)] transition duration-200"
            >
              Load Demo Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Destructure active items
  const { filename, timestamp, ageGroup, gender, viewPosition, result } = selectedItem || {};
  const { predictions = [], error_classification = {}, error_reasoning = {}, final_summary = {}, disease_explanations = [], bias_indicators = {}, gradcam_base64 = null } = result || {};

  const activeDetectedCount = predictions.filter(p => p.predicted).length;
  const highestPrediction = predictions.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current, { confidence: 0 });

  return (
    <div className="flex-1 bg-[#0F172A] text-slate-300 min-h-screen flex flex-col lg:grid lg:grid-cols-[340px_1fr] relative overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Search History Storing Panel */}
      <aside className="border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-950/40 backdrop-blur-md flex flex-col h-full max-h-screen relative z-10 print:hidden select-none">
        
        {/* Search header widget */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registry Logs</span>
            <button
              onClick={handleClearHistory}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 transition flex items-center gap-1 font-mono uppercase"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          
          {/* Search box input */}
          <div className="relative flex items-center bg-slate-950/80 border border-white/10 rounded-xl focus-within:border-emerald-500 transition px-3 py-2">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-[13px] text-white focus:outline-none focus:ring-0 ml-2 placeholder-slate-600"
            />
          </div>
        </div>

        {/* List of history logs */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-slate-600 text-[12px] font-mono mt-8">
              No matching records
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isActive = selectedItem && selectedItem.id === item.id;
              const hasCritical = item.result?.final_summary?.risk_level === "High";
              const hasModerate = item.result?.final_summary?.risk_level === "Medium";
              const topAnomalies = item.result?.predictions?.filter(p => p.predicted).map(p => p.disease).join(", ");

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectRecord(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                    isActive
                      ? "bg-white/[0.04] border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      : "bg-slate-950/20 border-white/5 hover:border-white/10 text-slate-400"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[13px] font-semibold truncate max-w-[190px] block text-slate-200">
                      {item.filename}
                    </span>
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                      hasCritical
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : hasModerate
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {item.result?.final_summary?.risk_level || "Low"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center w-full text-[10.5px]">
                    <span className="truncate max-w-[160px] text-slate-500 italic font-medium">
                      {topAnomalies || "Clear / No Finding"}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono font-bold">
                      {item.timestamp.split(",")[0]}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. RIGHT MAIN PANEL: Scan Diagnostics Viewer */}
      <main className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen relative z-10 print:p-0">
        
        {/* Top Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/15 pb-5 gap-4 print:border-none print:pb-2 select-none">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest font-mono">
              Diagnostic Audit Report
            </span>
            <h1 className="text-[20px] md:text-[23px] font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2 mt-0.5 font-display">
              {filename}
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 rounded-full px-2.5 py-0.5 font-mono">
                EfficientNet-B0
              </span>
            </h1>
            <span className="text-[11.5px] text-slate-500 font-mono font-semibold">{timestamp}</span>
          </div>

          <div className="flex items-center gap-3 print:hidden shrink-0">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold px-4.5 py-2.5 text-[13px] shadow-[0_0_12px_rgba(16,185,129,0.15)] transition"
            >
              <Download className="h-4.5 w-4.5" />
              Download Audit PDF
            </button>
          </div>
        </div>

        {/* Main interactive diagnostics grids */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          
          {/* Column A: X-ray Visualizer View */}
          <div className="flex flex-col gap-4">
            
            {/* View selectors */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 print:hidden select-none">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-mono">Layer Option:</span>
              <div className="flex rounded-lg border border-white/10 bg-slate-950/60 p-0.5">
                {[
                  { id: "original", label: "Original" },
                  { id: "overlay", label: "Grad-CAM Map" },
                  { id: "side-by-side", label: "Split" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold transition-all uppercase font-mono ${
                      viewMode === mode.id
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen viz frame */}
            <div className="flex-1 min-h-[380px] flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-inner">
              {viewMode === "side-by-side" ? (
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                  {gradcam_base64 ? (
                    <>
                      <img src={`data:image/png;base64,${gradcam_base64}`} alt="Grad-CAM" className="w-full h-auto object-contain border border-white/5 rounded-xl filter brightness-[0.88]" />
                      <img src={`data:image/png;base64,${gradcam_base64}`} alt="Grad-CAM overlay" className="w-full h-auto object-contain border border-white/5 rounded-xl mix-blend-color-burn" />
                    </>
                  ) : (
                    <>
                      <ChestXraySVG hasHeat={false} />
                      <ChestXraySVG hasHeat={true} />
                    </>
                  )}
                </div>
              ) : viewMode === "overlay" ? (
                gradcam_base64 ? (
                  <img src={`data:image/png;base64,${gradcam_base64}`} alt="Grad-CAM Overlay" className="max-h-[360px] w-auto object-contain rounded-xl" />
                ) : (
                  <ChestXraySVG hasHeat={true} />
                )
              ) : (
                gradcam_base64 ? (
                  <img src={`data:image/png;base64,${gradcam_base64}`} alt="Original View" className="max-h-[360px] w-auto object-contain rounded-xl filter brightness-[0.8]" />
                ) : (
                  <ChestXraySVG hasHeat={false} />
                )
              )}
            </div>

          </div>

          {/* Column B: LLM Clinical Reasoning Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3 select-none">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-mono">Reasoning Output</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-widest border ${
                final_summary.risk_level === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                final_summary.risk_level === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {final_summary.risk_level || "Low"} Risk
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] leading-relaxed text-slate-200 font-medium">
                {final_summary.diagnosis || "No anomalies flagged in diagnosis fields."}
              </p>
              <div className="font-mono text-[12.5px] text-slate-350 bg-slate-950/60 border border-white/5 rounded-xl p-4.5 max-h-[160px] overflow-y-auto leading-relaxed mt-2 select-text">
                {error_reasoning.explanation || "No risk analysis generated for this case template."}
              </div>
            </div>

            {/* Demographics audit inside card */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-[12.5px] text-slate-400 select-none">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Patient cohorts</span>
                <span className="font-bold text-slate-300 mt-1 block">Age {ageGroup} · Sex {gender}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Inconsistency Type</span>
                <span className="font-bold text-slate-300 mt-1 block">{error_classification.category}</span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. MULTI-LABEL AUDIT DETAILS TABLE */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 select-none">
            <h2 className="text-[14px] font-bold text-white tracking-wide uppercase font-mono">Multi-Label Classification Audit</h2>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">14 Disease Classes Evaluation</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-950/80 text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono select-none">
                <tr>
                  <th className="px-5 py-3.5">Disease Label</th>
                  <th className="px-5 py-3.5">Confidence</th>
                  <th className="px-5 py-3.5 text-center">Model Prediction</th>
                  <th className="px-5 py-3.5 text-center">Ground Truth</th>
                  <th className="px-5 py-3.5 text-right">Audit Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13.5px] text-slate-300 select-none">
                {predictions.map((pred) => {
                  let errorStatus = "";
                  let badgeClass = "";
                  
                  if (pred.ground_truth && !pred.predicted) {
                    errorStatus = "FN (Missed)";
                    badgeClass = "bg-red-500/10 text-red-400 border border-red-500/20";
                  } else if (!pred.ground_truth && pred.predicted) {
                    errorStatus = "FP (False Alarm)";
                    badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                  } else {
                    errorStatus = "Correct";
                    badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  }
                  
                  return (
                    <tr key={pred.disease} className="hover:bg-white/[0.02] transition duration-150">
                      <td className="px-5 py-3.5 font-bold text-slate-100">{pred.disease.replace("_", " ")}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-400 font-semibold">{(pred.confidence * 100).toFixed(1)}%</td>
                      <td className="px-5 py-3.5 text-center">
                        {pred.predicted ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2.5 py-0.5">
                            Positive
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Negative</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {pred.ground_truth ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-0.5">
                            Positive
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Negative</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex rounded px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-widest ${badgeClass}`}>
                          {errorStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}
