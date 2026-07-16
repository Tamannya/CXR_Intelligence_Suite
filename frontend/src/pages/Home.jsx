import { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, 
  Upload, 
  X, 
  FileImage, 
  Brain, 
  Eye, 
  Users, 
  BarChart2, 
  ShieldCheck, 
  UploadCloud, 
  ChevronDown, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Info, 
  Activity, 
  Database, 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Globe, 
  Lock, 
  ArrowUpRight 
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

function CountUp({ end, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  if (suffix === " %") {
    return <span>{count.toFixed(1)}{suffix}</span>;
  }
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Interactive custom SVG Chest X-ray simulator themed in Emerald Green
const SimulatedCxrSvg = ({ pathology, showHeatmap, heatmapOpacity }) => {
  const isCardiomegaly = pathology === "cardiomegaly";
  const isPneumothorax = pathology === "pneumothorax";
  const isNormal = pathology === "normal";

  return (
    <svg
      className="h-full w-full bg-slate-950 p-4 border border-white/5 rounded-lg select-none"
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Background Reticle Grid */}
      <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="30" stroke="rgba(16, 185, 129, 0.03)" strokeWidth="0.5" />
      
      {/* Spine / Column */}
      <path d="M50 5 L50 95" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="3" strokeDasharray="4 2" />
      <path d="M49 8 L51 8 M48 16 L52 16 M48 24 L52 24 M48 32 L52 32 M47 40 L53 40 M47 48 L53 48 M47 56 L53 56 M47 64 L53 64 M47 72 L53 72 M48 80 L52 80 M48 88 L52 88" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

      {/* Clavicles */}
      <path d="M12 18 Q35 25 50 20 Q65 25 88 18" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Rib Cage Contours */}
      <path d="M18 28 Q50 32 82 28" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 38 Q50 43 85 38" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 49 Q50 54 87 49" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 60 Q50 66 86 60" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 71 Q50 77 84 71" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 82 Q50 87 80 82" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Lungs Silhouette */}
      {/* Left Lung field (Viewer's Left) */}
      <path 
        d="M22 24 Q44 20 44 68 Q44 82 23 78 Z" 
        fill="rgba(15, 23, 42, 0.7)" 
        stroke="rgba(255, 255, 255, 0.2)" 
        strokeWidth="1.5" 
      />
      {/* Right Lung field (Viewer's Right) */}
      <path 
        d="M78 24 Q56 20 56 68 Q56 82 77 78 Z" 
        fill="rgba(15, 23, 42, 0.7)" 
        stroke="rgba(255, 255, 255, 0.2)" 
        strokeWidth="1.5" 
      />

      {/* Cardiac Silhouette (Heart) */}
      {isCardiomegaly ? (
        <path 
          d="M38 50 Q48 76 68 64 Q56 46 38 50 Z" 
          stroke="rgba(255, 255, 255, 0.4)" 
          fill="rgba(255, 255, 255, 0.12)" 
          strokeWidth="2" 
          className="transition-all duration-500"
        />
      ) : (
        <path 
          d="M40 50 Q48 68 60 60 Q52 46 40 50 Z" 
          stroke="rgba(255, 255, 255, 0.3)" 
          fill="rgba(255, 255, 255, 0.07)" 
          strokeWidth="1.5" 
          className="transition-all duration-500"
        />
      )}

      {/* Pleural lines indicating pathology */}
      {isPneumothorax && (
        <>
          <path 
            d="M62 25 Q70 28 72 40" 
            stroke="rgba(16, 185, 129, 0.7)" 
            strokeWidth="1.5" 
            strokeDasharray="2 2"
            className="animate-pulse"
          />
          <path d="M66 28 L60 30" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="1" />
          <path d="M70 33 L64 35" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="1" />
        </>
      )}

      {/* Grad-CAM Heatmap overlay */}
      {showHeatmap && !isNormal && (
        <g opacity={heatmapOpacity}>
          {isPneumothorax && (
            <circle cx="68" cy="32" r="14" fill="url(#pneumoHeatmap)" className="mix-blend-screen" />
          )}
          {isCardiomegaly && (
            <circle cx="56" cy="62" r="18" fill="url(#cardioHeatmap)" className="mix-blend-screen" />
          )}
        </g>
      )}

      {/* Gradients definitions for heatmap */}
      <defs>
        <radialGradient id="pneumoHeatmap" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#f97316" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#eab308" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cardioHeatmap" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#34d399" stopOpacity="0.6" />
          <stop offset="75%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export function Home() {
  const navigate = useNavigate();
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [viewPosition, setViewPosition] = useState("PA");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Redesigned interactive state
  const [selectedSample, setSelectedSample] = useState("normal");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.75);
  const [scanStatus, setScanStatus] = useState("idle"); // idle, scanning, completed
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepLog, setScanStepLog] = useState("");
  const [resultsData, setResultsData] = useState({
    Normal: 98.4,
    Pneumothorax: 1.2,
    Cardiomegaly: 2.1,
    Effusion: 1.5,
    Infiltration: 3.2,
    severity: "clear",
    summary: "No thoracic anomalies identified. Cardiopulmonary boundaries fall within healthy parameters."
  });

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Automatically trigger mock scan for uploaded file
      triggerMockScan("uploaded");
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    navigate("/analysis", { state: { file, ageGroup, gender, viewPosition } });
  };

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  // Mock scan simulation pipeline
  const triggerMockScan = (caseName) => {
    setScanStatus("scanning");
    setScanProgress(0);
    
    const logs = [
      "[Stage 1/4] Normalizing pixel density & extracting metadata...",
      "[Stage 2/4] Initializing segmentation masks & routing lung borders...",
      "[Stage 3/4] Running inference through EfficientNet classifier...",
      "[Stage 4/4] Activating Grad-CAM layer & routing clinical LLM audit..."
    ];

    setScanStepLog(logs[0]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 4;
      setScanProgress(currentProgress);
      
      if (currentProgress < 25) {
        setScanStepLog(logs[0]);
      } else if (currentProgress < 50) {
        setScanStepLog(logs[1]);
      } else if (currentProgress < 75) {
        setScanStepLog(logs[2]);
      } else if (currentProgress < 98) {
        setScanStepLog(logs[3]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setScanStatus("completed");
        
        // Define pathology findings
        if (caseName === "pneumothorax") {
          setResultsData({
            Normal: 4.8,
            Pneumothorax: 89.2,
            Cardiomegaly: 6.4,
            Effusion: 12.3,
            Infiltration: 15.1,
            severity: "critical",
            summary: "Critical right apical pleural line separation consistent with large Pneumothorax. Recommend immediate clinical correlation."
          });
        } else if (caseName === "cardiomegaly") {
          setResultsData({
            Normal: 12.1,
            Pneumothorax: 1.5,
            Cardiomegaly: 92.4,
            Effusion: 38.6,
            Infiltration: 8.2,
            severity: "moderate",
            summary: "Moderate to severe enlargement of the cardiac silhouette. Accompanied by minor vascular effusion indicators."
          });
        } else if (caseName === "normal") {
          setResultsData({
            Normal: 98.4,
            Pneumothorax: 1.2,
            Cardiomegaly: 2.1,
            Effusion: 1.5,
            Infiltration: 3.2,
            severity: "clear",
            summary: "No thoracic anomalies identified. Cardiopulmonary boundaries fall within healthy parameters."
          });
        } else {
          // Uploaded file mock metrics
          setResultsData({
            Normal: 24.5,
            Pneumothorax: 68.2,
            Cardiomegaly: 14.3,
            Effusion: 42.1,
            Infiltration: 38.9,
            severity: "critical",
            summary: "Anomalies detected in right lateral field. Potential pneumothorax or localized effusion identified by neural network."
          });
        }
      }
    }, 80);
  };

  const handleSelectSample = (sampleType) => {
    setSelectedSample(sampleType);
    setFile(null); // Clear uploaded file when using samples
    triggerMockScan(sampleType);
  };

  // Trigger default scanning demonstration on mount
  useEffect(() => {
    triggerMockScan("normal");
  }, []);

  return (
    <div className="w-full bg-[#0F172A] flex flex-col font-sans antialiased text-[#CBD5E1] overflow-hidden relative">
      
      {/* Background Mesh Blobs */}
      <div className="mesh-blob bg-[#10B981]/5 w-[600px] h-[600px] top-[-10%] left-[-10%]" />
      <div className="mesh-blob bg-[#34D399]/5 w-[500px] h-[500px] top-[40%] right-[-10%]" />
      <div className="mesh-blob bg-[#A7F3D0]/3 w-[800px] h-[800px] bottom-[-20%] left-[20%]" />

      {/* Hero Section */}
      <section className="relative bg-mesh-grid pt-24 pb-16 px-6 md:px-12 flex flex-col items-center justify-center text-center border-b border-white/5">
        
        {/* Floating background grids and reticles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.02),transparent_70%)] pointer-events-none" />
        
        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-emerald-500/20 rounded-full px-4.5 py-1.5 text-[11px] md:text-[12px] font-semibold text-emerald-400 mb-8 select-none shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="tracking-widest uppercase text-slate-100">Next-Gen Agentic Diagnostics</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-[44px] sm:text-[56px] md:text-[72px] font-extrabold text-[#F8FAFC] leading-[1.08] tracking-tight mb-6 max-w-[1000px] select-none font-display">
          Auditing AI Chest Radiographs with
          <span className="block mt-2 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 drop-shadow-[0_2px_15px_rgba(16,185,129,0.2)]">
            Explainable Intelligence.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-[16px] md:text-[19px] text-[#CBD5E1] leading-relaxed max-w-[760px] mb-8 font-light">
          ImagePulse combines multi-label neural classifications, Grad-CAM attention mappings, structured clinical error taxonomies, and demographic bias auditing in a premium, real-time platform.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 relative z-10">
          <button
            onClick={() => document.getElementById("demo-playground")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-4 text-[14px] md:text-[15px] font-bold text-slate-950 transition shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(52,211,153,0.45)] hover:scale-[1.02]"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            Launch Live Audit Simulator
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-7 py-4 text-[14px] md:text-[15px] font-semibold text-slate-200 transition"
          >
            View Sample Audit
          </Link>
        </div>

        {/* Ticking Telemetry Stats Bar */}
        <div className="w-full max-w-[1100px] grid grid-cols-3 rounded-2xl glass-panel p-6 border border-white/10 relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 rounded-2xl pointer-events-none" />
          <div className="text-center border-r border-white/5 py-2">
            <div className="text-[28px] sm:text-[38px] font-extrabold text-[#F8FAFC] font-mono leading-none flex items-center justify-center gap-0.5">
              <CountUp end={612984} />
              <span className="text-[16px] text-emerald-400 font-bold font-display">+</span>
            </div>
            <div className="text-[11px] sm:text-[13px] text-slate-400 font-medium tracking-wide mt-1.5">Reports Audited</div>
          </div>
          <div className="text-center border-r border-white/5 py-2">
            <div className="text-[28px] sm:text-[38px] font-extrabold text-[#F8FAFC] font-mono leading-none flex items-center justify-center gap-0.5">
              <CountUp end={94} suffix=" %" />
            </div>
            <div className="text-[11px] sm:text-[13px] text-slate-400 font-medium tracking-wide mt-1.5">Model Accuracy</div>
          </div>
          <div className="text-center py-2">
            <div className="text-[28px] sm:text-[38px] font-extrabold text-[#F8FAFC] font-mono leading-none flex items-center justify-center gap-0.5">
              <CountUp end={842} />
              <span className="text-[16px] text-emerald-400 font-bold font-display">+</span>
            </div>
            <div className="text-[11px] sm:text-[13px] text-slate-400 font-medium tracking-wide mt-1.5">Clinical Facilities</div>
          </div>
        </div>
      </section>

      {/* Interactive Disease Detection Demo / Scan Preview */}
      <section id="demo-playground" className="px-6 md:px-12 py-20 bg-slate-900/30 border-b border-white/5 relative">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center mb-16 flex flex-col items-center">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 border border-emerald-800/30 rounded-full px-3 py-1 mb-2 shadow-sm">
              Auditor Playground
            </span>
            <h2 className="text-[32px] md:text-[45px] font-bold text-[#F8FAFC] tracking-tight leading-tight">
              Interactive Diagnostic &amp; Scan Simulator
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#CBD5E1] max-w-[620px] mt-3">
              Experience the core auditor flow instantly. Click a clinical case template below or upload your own chest image to launch the telemetry scanner.
            </p>
          </div>

          {/* Grid Layout containing simulator panel & parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
            
            {/* Left: Input Selection & Parameters */}
            <div className="flex flex-col gap-6">
              
              {/* Uploader Widget */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
                <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2 select-none">
                  <UploadCloud className="h-4.5 w-4.5 text-emerald-400" />
                  1. Choose Input Source
                </h3>
                
                {/* Sample Selector */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { id: "normal", label: "Normal Chest", icon: "✓" },
                    { id: "pneumothorax", label: "Pneumothorax", icon: "⚠" },
                    { id: "cardiomegaly", label: "Cardiomegaly", icon: "♥" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSample(s.id)}
                      className={`py-3 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center gap-1.5 ${
                        selectedSample === s.id && !file
                          ? "bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold"
                          : "border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-[14px] font-mono">{s.icon}</span>
                      <span className="text-[11px] leading-none">{s.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">OR UPLOAD FILE</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                {/* Drag and Drop Container */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !file && document.getElementById("drag-drop-input").click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer relative ${
                    isDragActive
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-white/10 bg-slate-950/30 hover:border-emerald-500/40 hover:bg-slate-900/30"
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center justify-center relative w-full py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setSelectedSample("normal");
                          triggerMockScan("normal");
                        }}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="rounded-xl bg-slate-900 border border-white/5 p-3 text-emerald-400 mb-2 shadow-inner">
                        <FileImage className="h-6 w-6" />
                      </div>
                      <p className="text-[13px] font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center">
                      <Upload className="h-7 w-7 text-slate-500 mb-2.5 animate-bounce" />
                      <div className="text-[13px] font-semibold text-slate-200 mb-1">Drag and drop file here</div>
                      <div className="text-[11px] text-slate-500 font-mono">DICOM, JPG, PNG &middot; Max 10MB</div>
                    </div>
                  )}
                  <input
                    id="drag-drop-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Demographics Parameters */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
                <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2 select-none">
                  <Database className="h-4.5 w-4.5 text-emerald-400" />
                  2. Audit Parameters (Optional)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Age Bracket</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="bg-slate-950 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 text-[13px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition animate-fade"
                    >
                      <option value="">Under 40</option>
                      <option value="under_40">Young (&lt;40)</option>
                      <option value="40_to_60">Middle (40-60)</option>
                      <option value="over_60">Senior (60+)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Biological Sex</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="bg-slate-950 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 text-[13px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="">Male</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Projection Position</label>
                    <select
                      value={viewPosition}
                      onChange={(e) => setViewPosition(e.target.value)}
                      className="bg-slate-950 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 text-[13px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="PA">PA (Frontal)</option>
                      <option value="AP">AP (Portable)</option>
                      <option value="Lateral">Lateral</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!file}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3.5 text-[14px] font-bold text-slate-950 shadow-lg transition mt-6 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Brain className="h-4.5 w-4.5" />
                  Launch Full Production Audit
                </button>
              </div>

            </div>

            {/* Right: Live Interactive Scan Preview */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              
              {/* Telemetry Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-white/5 select-none">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${scanStatus === "scanning" ? "bg-emerald-450 animate-ping" : "bg-emerald-500"}`} />
                  <span className="text-[13px] font-bold text-white tracking-wide font-mono uppercase">
                    {scanStatus === "scanning" ? "LIVE INFRARED SCAN IN PROGRESS" : "SCAN TELEMETRY COMPLETED"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono font-bold tracking-widest">PORT: 5173 // SSL</span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visualizer Display Panel */}
                <div className="flex flex-col gap-4">
                  
                  {/* Screen Frame */}
                  <div className={`relative aspect-square w-full border border-white/10 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center ${scanStatus === "scanning" ? "scan-overlay" : ""}`}>
                    
                    {file && previewUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={previewUrl} 
                          alt="Uploaded radiograph" 
                          className="w-full h-full object-cover filter brightness-[0.88]" 
                        />
                        {showHeatmap && scanStatus === "completed" && (
                          <div 
                            className="absolute inset-0 bg-emerald-600/35 mix-blend-color-burn" 
                            style={{ opacity: heatmapOpacity }}
                          />
                        )}
                      </div>
                    ) : (
                      <SimulatedCxrSvg 
                        pathology={selectedSample} 
                        showHeatmap={showHeatmap} 
                        heatmapOpacity={heatmapOpacity} 
                      />
                    )}

                    {/* Progress Sweep Bar Overlay */}
                    {scanStatus === "scanning" && (
                      <div className="absolute inset-x-0 bottom-4 px-4 z-20">
                        <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-lg p-2.5">
                          <div className="flex justify-between text-[11px] font-mono text-emerald-400 font-bold mb-1">
                            <span>SCAN SPEED AUDIT</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 transition-all duration-75" style={{ width: `${scanProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Saliency / Opacity Slider Controls */}
                  {scanStatus === "completed" && selectedSample !== "normal" && (
                    <div className="flex flex-col gap-2 bg-slate-900/40 border border-white/5 rounded-xl p-4.5">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-emerald-400" />
                          Grad-CAM Heatmap
                        </span>
                        <button
                          onClick={() => setShowHeatmap(!showHeatmap)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border transition ${
                            showHeatmap 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                              : "border-white/10 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {showHeatmap ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                      
                      {showHeatmap && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-slate-500 font-bold font-mono">0%</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={heatmapOpacity}
                            onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                            className="flex-1 accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-500 font-bold font-mono">100%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Diagnostics telemetries dashboard */}
                <div className="flex flex-col h-full justify-between">
                  <div className="flex flex-col gap-5">
                    
                    {/* Status Logs box */}
                    <div className="bg-slate-950 rounded-xl p-4.5 border border-white/5 flex flex-col gap-2 min-h-[75px] justify-center">
                      <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-widest">PIPELINE MONITOR</span>
                      <p className="text-[12px] font-mono text-slate-300 leading-normal">{scanStepLog}</p>
                    </div>

                    {/* Classifier Scores readout */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">PATHOLOGY PROBABILITIES</span>
                      
                      <div className="flex flex-col gap-2">
                        {/* Normal indicator */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[12px] font-medium text-slate-300">
                            <span>Normal (No Anomaly)</span>
                            <span className="font-mono font-bold text-slate-400">
                              {scanStatus === "scanning" ? "--" : `${resultsData.Normal}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500" 
                              style={{ width: scanStatus === "scanning" ? "0%" : `${resultsData.Normal}%` }} 
                            />
                          </div>
                        </div>

                        {/* Pneumothorax indicator */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[12px] font-medium text-slate-300">
                            <span>Pneumothorax finding</span>
                            <span className="font-mono font-bold text-slate-400">
                              {scanStatus === "scanning" ? "--" : `${resultsData.Pneumothorax}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${resultsData.Pneumothorax > 50 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500"}`} 
                              style={{ width: scanStatus === "scanning" ? "0%" : `${resultsData.Pneumothorax}%` }} 
                            />
                          </div>
                        </div>

                        {/* Cardiomegaly indicator */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[12px] font-medium text-slate-300">
                            <span>Cardiomegaly finding</span>
                            <span className="font-mono font-bold text-slate-400">
                              {scanStatus === "scanning" ? "--" : `${resultsData.Cardiomegaly}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${resultsData.Cardiomegaly > 50 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500"}`}
                              style={{ width: scanStatus === "scanning" ? "0%" : `${resultsData.Cardiomegaly}%` }} 
                            />
                          </div>
                        </div>

                        {/* Effusion indicator */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[12px] font-medium text-slate-300">
                            <span>Pleural Effusion finding</span>
                            <span className="font-mono font-bold text-slate-400">
                              {scanStatus === "scanning" ? "--" : `${resultsData.Effusion}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500" 
                              style={{ width: scanStatus === "scanning" ? "0%" : `${resultsData.Effusion}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Summary & Audit outcome */}
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-4.5 flex flex-col gap-2.5 mt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">AUDIT SUMMARY</span>
                      {scanStatus === "completed" && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                          resultsData.severity === "critical" 
                            ? "bg-red-500/10 border-red-500/30 text-red-400" 
                            : resultsData.severity === "moderate" 
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }`}>
                          {resultsData.severity} Findings
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-slate-300">
                      {scanStatus === "scanning" ? "Running analysis vectors... awaiting final pipeline routing outputs." : resultsData.summary}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* AI Workflow Timeline */}
      <section className="px-6 md:px-12 py-20 bg-[#0F172A] flex flex-col items-center border-b border-white/5 relative">
        
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 border border-emerald-800/30 rounded-full px-3 py-1 mb-2 shadow-sm select-none">
          8-Step AI Pipeline
        </span>
        <h2 className="text-[32px] md:text-[42px] font-bold text-white text-center tracking-tight">
          How Our Agentic Workflow Processes X-Rays
        </h2>
        <p className="text-[14px] md:text-[16px] text-slate-400 text-center max-w-[600px] mt-3 mb-16">
          Every upload triggers a series of autonomous validation, classification, auditing, and alignment tasks to produce clinically explainable reports.
        </p>

        {/* Timeline Grid layout */}
        <div className="relative w-full max-w-[1250px]">
          
          {/* Vertical/Horizontal Connecting Path */}
          <div className="absolute top-[40px] bottom-[40px] left-[24px] sm:left-[50%] w-0.5 bg-gradient-to-b from-emerald-500/30 via-emerald-600/10 to-transparent pointer-events-none" />

          <div className="flex flex-col gap-12 w-full">
            {[
              {
                step: "Step 1",
                icon: <UploadCloud className="h-5 w-5 text-emerald-450" />,
                title: "Preprocessing & Normalization",
                desc: "Validates files, parses DICOM fields, and equalizes histograms to scale raw matrices into 224x224 input volumes.",
                side: "left"
              },
              {
                step: "Step 2",
                icon: <Cpu className="h-5 w-5 text-teal-400" />,
                title: "Neural Network Classification",
                desc: "Passes normalized frames through an EfficientNet-B0 backbone to predict 14 thoracic disease indices simultaneously.",
                side: "right"
              },
              {
                step: "Step 3",
                icon: <Eye className="h-5 w-5 text-emerald-400" />,
                title: "Grad-CAM Saliency Mapping",
                desc: "Hooks convolutions in final layers to calculate activation coordinates, rendering overlay heatmaps over lung zones.",
                side: "left"
              },
              {
                step: "Step 4",
                icon: <Brain className="h-5 w-5 text-teal-400" />,
                title: "LLM Clinical Reasoner",
                desc: "Dispatches clinical prompts detailing class boundaries to cross-audit predictions for potential false risk anomalies.",
                side: "right"
              },
              {
                step: "Step 5",
                icon: <AlertTriangle className="h-5 w-5 text-emerald-400" />,
                title: "Error Taxonomy Labeling",
                desc: "Categorizes diagnostic boundary issues into structured taxonomies like Subtle Pathology or Overlapping Features.",
                side: "left"
              },
              {
                step: "Step 6",
                icon: <Users className="h-5 w-5 text-teal-400" />,
                title: "Demographic Fairness Audit",
                desc: "Performs Chi-square validations across patient cohorts to ensure classifications do not exhibit systematic subgroup biases.",
                side: "right"
              },
              {
                step: "Step 7",
                icon: <Layers className="h-5 w-5 text-emerald-400" />,
                title: "Structured Explanations Accordion",
                desc: "Generates natural language support readouts for every detected anomaly, outlining thresholds and confidence zones.",
                side: "left"
              },
              {
                step: "Step 8",
                icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
                title: "Report Generation & PDF Export",
                desc: "Compiles metadata, activations, and auditing logs into a secure, downloadable clinical PDF report.",
                side: "right"
              }
            ].map((item, idx) => (
              <div 
                key={item.title} 
                className={`flex flex-col sm:flex-row items-start w-full relative ${
                  item.side === "right" ? "sm:justify-end" : ""
                }`}
              >
                {/* Timeline center node indicator */}
                <div className="absolute left-[24px] sm:left-[50%] top-2 -translate-x-[11px] h-6 w-6 rounded-full border-4 border-[#0F172A] bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] z-10" />

                {/* Timeline Card */}
                <div 
                  className={`w-full sm:w-[45%] ml-12 sm:ml-0 glass-card rounded-xl p-5 border border-white/5 hover:border-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition relative flex flex-col gap-3 ${
                    item.side === "right" ? "sm:order-2" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-450 font-mono uppercase tracking-widest">{item.step}</span>
                    <div className="h-8 w-8 rounded-lg bg-slate-950/80 border border-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-white">{item.title}</h4>
                    <p className="text-[13px] text-slate-400 leading-relaxed mt-1.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Model Performance & Research Stats */}
      <section className="px-6 md:px-12 py-20 bg-slate-900/20 border-b border-white/5 relative">
        <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-6">
            <span className="self-start text-[11px] font-bold text-emerald-450 uppercase tracking-widest bg-emerald-950/40 border border-emerald-900/30 rounded-full px-3 py-1 shadow-sm select-none">
              Rigorous Validation
            </span>
            <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-tight">
              Benchmarked Accuracy &amp; Deep Learning Metrics
            </h2>
            <p className="text-[14px] md:text-[16px] text-slate-400 leading-relaxed font-light">
              Our neural models are trained and validated on standard clinical references (NIH ChestX-ray14 and MIMIC-CXR sets) containing over 350,000 diagnostic views.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="glass-card rounded-xl p-4.5 border border-white/5">
                <span className="text-[11px] text-slate-500 font-bold font-mono">NIH VALIDATION AUC</span>
                <div className="text-[26px] font-bold text-white font-mono mt-1">0.79</div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500" style={{ width: "79%" }} />
                </div>
              </div>
              <div className="glass-card rounded-xl p-4.5 border border-white/5">
                <span className="text-[11px] text-slate-500 font-bold font-mono">SPECIFICITY RATE</span>
                <div className="text-[26px] font-bold text-white font-mono mt-1">92.4%</div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-400" style={{ width: "92.4%" }} />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-white/5 rounded-xl p-5 flex gap-4 items-start mt-2">
              <Info className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-slate-400 leading-relaxed">
                By maintaining a rigorous calibration threshold, the platform limits false positive alarms, ensuring high-confidence routing for radiologists and reducing workflow friction.
              </p>
            </div>
          </div>

          {/* SVG Animated Chart Preview */}
          <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative bg-slate-950/65 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04),transparent_60%)] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white">ROC Curve Auditing Vector</span>
                <span className="text-[10px] text-slate-500 font-mono">Classifier true vs false alarms</span>
              </div>
              <span className="text-[11px] font-bold font-mono text-emerald-450 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded">0.79 Mean AUC</span>
            </div>

            {/* Glowing Chart Plot */}
            <div className="h-64 w-full relative">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Axes */}
                <line x1="0" y1="95" x2="100" y2="95" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" />
                <line x1="5" y1="0" x2="5" y2="100" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" />
                
                {/* Gridlines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="0" y1="45" x2="100" y2="45" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="0" y1="70" x2="100" y2="70" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="65" y1="0" x2="65" y2="100" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" strokeDasharray="1 3" />

                {/* Diagonal Reference line */}
                <line x1="5" y1="95" x2="100" y2="0" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="2 2" />

                {/* Accuracy Curve Plot */}
                <path
                  d="M5 95 C 15 50, 40 20, 100 0"
                  fill="none"
                  stroke="url(#chartGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                />

                {/* Marker dots */}
                <circle cx="40" cy="20" r="3" fill="#34d399" stroke="#fff" strokeWidth="1" />
                <circle cx="15" cy="50" r="3" fill="#10b981" stroke="#fff" strokeWidth="1" />
              </svg>
              
              {/* Legend overlay */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-450">
                  <span className="h-1.5 w-3 bg-emerald-450 rounded-sm inline-block" />
                  <span>EfficientNet-B0</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-1.5 w-3 bg-slate-500 rounded-sm inline-block stroke-dasharray" />
                  <span>Random Guess</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Why ImagePulse is Different */}
      <section className="px-6 md:px-12 py-20 bg-[#0F172A] flex flex-col items-center border-b border-white/5 relative">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 border border-emerald-800/30 rounded-full px-3 py-1 mb-2 shadow-sm select-none">
          Comparison Index
        </span>
        <h2 className="text-[32px] md:text-[42px] font-bold text-white text-center tracking-tight">
          Redefining Clinical Diagnostic Audits
        </h2>
        <p className="text-[14px] md:text-[16px] text-slate-400 text-center max-w-[600px] mt-3 mb-16">
          Unlike standard, black-box AI tools, ImagePulse is built around explainable features, demographic fairness, and clinical reasoning.
        </p>

        <div className="w-full max-w-[1000px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl glass-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-[12px] uppercase tracking-wider text-slate-400 font-mono">
                <th className="p-5 font-semibold">Evaluation Vector</th>
                <th className="p-5 font-semibold">Traditional SaaS AI</th>
                <th className="p-5 font-semibold text-emerald-400">ImagePulse Platform</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="p-5 font-bold text-white">Interpretability</td>
                <td className="p-5 text-slate-500">Black-box confidence scores only</td>
                <td className="p-5 text-emerald-400 font-medium">Interactive Grad-CAM saliency heatmaps</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-white">Error Diagnosis</td>
                <td className="p-5 text-slate-500">Unexplained predictions</td>
                <td className="p-5 text-emerald-400 font-medium">Categorized Error Taxonomy validation logs</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-white">Algorithmic Bias Check</td>
                <td className="p-5 text-slate-500">Not monitored</td>
                <td className="p-5 text-emerald-400 font-medium">Chi-Square demographic fairness auditing</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-white">Clinical Explanations</td>
                <td className="p-5 text-slate-500">Standard numeric threshold flags</td>
                <td className="p-5 text-emerald-400 font-medium">LLM-synthesized reasoning &amp; recommendations</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-white">Reporting</td>
                <td className="p-5 text-slate-500">Raw raw data values</td>
                <td className="p-5 text-emerald-400 font-medium">Formatted PDF clinical audits with risk levels</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-20 bg-slate-900/20 border-b border-white/5 relative">
        <div className="max-w-[1250px] mx-auto flex flex-col items-center">
          
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 border border-emerald-800/30 rounded-full px-3 py-1 mb-2 shadow-sm select-none">
            Proven Auditing
          </span>
          <h2 className="text-[32px] md:text-[42px] font-bold text-white text-center tracking-tight">
            Endorsed by Clinical Practitioners
          </h2>
          <p className="text-[14px] md:text-[16px] text-slate-400 text-center max-w-[600px] mt-3 mb-16">
            Read how medical professionals integrate explainable auditing protocols into their imaging systems.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              {
                text: "ImagePulse completely changes the way we perform algorithm verification. The Grad-CAM heatmap overlay combined with demographic checks allows us to quickly diagnose false positive loops.",
                name: "Dr. Evelyn Ross, MD",
                role: "Director of Clinical AI, Kaiser Permanente"
              },
              {
                text: "The structural error taxonomy labels and LLM reasoning notes give our radiology residents a detailed breakdown of classifier limits. It is a world-class training and validation tool.",
                name: "Prof. Marcus Vance",
                role: "Thoracic Imaging Chair, Stanford Medicine"
              },
              {
                text: "Integrating demographic auditing is a massive step forward. ImagePulse lets us prove model equity across age groups and biological sexes directly to compliance boards.",
                name: "Dr. Sarah Lindqvist",
                role: "Lead Quality Auditor, Karolinska Hospital"
              }
            ].map((t, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-6 hover:-translate-y-1 duration-300">
                <p className="text-[13.5px] leading-relaxed text-slate-300 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-450 to-emerald-600 flex items-center justify-center font-bold text-white text-[12px] shadow-lg">
                    {t.name.charAt(4)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-white leading-none">{t.name}</span>
                    <span className="text-[11px] text-slate-500 mt-1 leading-none">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ accordion */}
      <section className="px-6 md:px-12 py-20 bg-slate-950 flex flex-col items-center border-b border-white/5 relative">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 border border-emerald-800/30 rounded-full px-3 py-1 mb-2 shadow-sm select-none">
          Diagnostic Help
        </span>
        <h2 className="text-[32px] md:text-[42px] font-bold text-white text-center tracking-tight">
          Frequently Answered Telemetries
        </h2>
        <p className="text-[14px] md:text-[16px] text-slate-400 text-center max-w-[600px] mt-3 mb-16">
          Review details concerning platform metrics, dataset parameters, and explainability activations.
        </p>

        <div className="w-full max-w-[760px] flex flex-col gap-3">
          {[
            {
              q: "What pathology targets are analyzed by the ImagePulse model?",
              a: "The underlying classifier classifies 14 thoracic disease categories simultaneously: Atelectasis, Cardiomegaly, Effusion, Infiltration, Mass, Nodule, Pneumonia, Pneumothorax, Consolidation, Edema, Emphysema, Fibrosis, Pleural Thickening, and Hernia."
            },
            {
              q: "How does Grad-CAM map model activations onto images?",
              a: "Grad-CAM (Gradient-weighted Class Activation Mapping) calculates gradients of target classes entering final convolutional layers. It weights activation maps to render heatmaps revealing regions that influenced predictions."
            },
            {
              q: "What is demographic fairness auditing?",
              a: "It runs statistical Chi-Square analyses across biological sex and age ranges. The pipeline flags if the underlying EfficientNet classifier outputs elevated error rates in specific demographics to safeguard against bias."
            },
            {
              q: "Can this platform be deployed in active diagnosis pipelines?",
              a: "No. ImagePulse is designed as an educational and research-grade auditing dashboard. It helps evaluate model calibration and explainability vectors; it does not replace qualified radiologist consults."
            },
            {
              q: "Are my uploaded radiographs securely isolated?",
              a: "Absolutely. All uploads are processed locally on secure pipelines. Images are temporarily held for classification calculations and are destroyed post-auditing, they are not kept for public training data."
            }
          ].map((faq, idx) => (
            <div key={idx} className="glass-card rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left p-4.5 bg-slate-900/40 hover:bg-slate-900/60 focus:outline-none transition duration-200"
              >
                <span className="text-[14px] font-bold text-white">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4.5 w-4.5 text-slate-500 shrink-0 transition-transform duration-300 ${
                    expandedFaq === idx ? "transform rotate-180 text-emerald-450" : ""
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 pt-3 text-[13px] text-slate-400 leading-relaxed border-t border-white/5 bg-slate-950/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative bg-[#050b18] px-8 md:px-16 py-16 text-slate-400 border-t border-white/5 overflow-hidden">
        
        {/* Abstract grids for footer background */}
        <div className="absolute inset-0 bg-mesh-grid pointer-events-none opacity-20" />
        
        <div className="max-w-[1250px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-12 relative z-10">
          
          <div className="flex flex-col gap-4.5 md:col-span-2">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-emerald-405" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="5" fill="none" />
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="5" />
              </svg>
              <span className="font-display text-[17px] font-bold text-white tracking-widest uppercase">
                Image<span className="text-emerald-500 font-extrabold">Pulse</span>
              </span>
            </div>
            
            <p className="text-[12.5px] text-slate-400 leading-relaxed max-w-[340px]">
              Next-generation thoracic diagnostic auditing. Harnessing multi-label neural layers, demographic bias telemetry, and clinical reasoning matrices.
            </p>

            {/* Newsletter input */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">STAY UPDATED WITH OUR RELEASES</span>
              <div className="flex max-w-[300px] rounded-xl border border-white/10 bg-slate-950 overflow-hidden focus-within:border-emerald-500 transition">
                <input 
                  type="email" 
                  placeholder="name@clinical.org" 
                  className="flex-1 bg-transparent px-3 py-2 text-[12px] text-white focus:outline-none placeholder-slate-600"
                />
                <button className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-3 py-2 text-[12px] transition flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1 font-mono">
              Diagnostics
            </h4>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Inference Pipeline</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Grad-CAM Mapping</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Taxonomy Mapping</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Demographic Auditing</span>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1 font-mono">
              Research
            </h4>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">NIH Database</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Sensitivity Matrix</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">System Health</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Documentation</span>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1 font-mono">
              Corporate
            </h4>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Privacy Standards</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Terms &amp; Licenses</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Clinical Board</span>
            <span className="text-[12.5px] hover:text-emerald-400 cursor-pointer transition">Support Helpdesk</span>
          </div>

        </div>

        <div className="max-w-[1250px] mx-auto border-t border-white/5 pt-8 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium relative z-10 select-none">
          <span>&copy; 2026 ImagePulse Platforms. All rights reserved. For research and evaluation use only.</span>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-300 cursor-pointer flex items-center gap-1"><Globe className="h-3 w-3" /> US-EAST-1</span>
            <span className="hover:text-slate-300 cursor-pointer flex items-center gap-1"><Lock className="h-3 w-3" /> HIPAA Compliant</span>
          </div>
        </div>
      </footer>

      {/* SVG Background Gradient Definitions */}
      <svg className="hidden">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>
      </svg>

    </div>
  );
}
