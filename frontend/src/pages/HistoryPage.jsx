import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Filter, ArrowUpDown, Download, Eye, FileText, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { api } from "../services/api";

// Stylized Chest X-Ray thumbnail component for report cards
const ChestThumbnailSVG = ({ risk }) => {
  let glowingColor = "rgba(16,185,129,0.2)"; // Low - emerald
  if (risk === "medium") glowingColor = "rgba(245,158,11,0.25)"; // Medium - amber
  if (risk === "high") glowingColor = "rgba(239,68,68,0.3)"; // High - rose

  return (
    <div className="relative w-16 h-16 shrink-0 bg-slate-950/60 border border-white/10 rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
      <svg className="h-full w-full text-slate-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        <path d="M26,24 Q46,21 46,65 Q46,80 24,75 Z" fill="currentColor" fillOpacity="0.1" stroke="rgba(255,255,255,0.15)" />
        <path d="M74,24 Q54,21 54,65 Q54,80 76,75 Z" fill="currentColor" fillOpacity="0.1" stroke="rgba(255,255,255,0.15)" />
        <path d="M41,49 Q50,67 63,58 Q54,46 41,49 Z" stroke="rgba(255,255,255,0.1)" />
      </svg>
      {/* Glow dot overlay */}
      <div 
        className="absolute inset-0 transition duration-300"
        style={{
          background: `radial-gradient(circle at center, ${glowingColor} 0%, transparent 80%)`
        }}
      />
    </div>
  );
};

export function HistoryPage({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getHistory();
      // Backend returns {"items": [...]}
      setItems(response.items || []);
    } catch (err) {
      setError(err.message || "Failed to load clinical history from node database.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: determine primary diagnosis
  const getPrimaryDiagnosis = (item) => {
    const detections = item.result?.disease_detections || [];
    if (detections.length === 0) return "Normal Lung Study";
    const max = detections.reduce(
      (prev, current) => (prev.probability > current.probability ? prev : current),
      { class: "Normal Lung Study", probability: 0 }
    );
    return max.probability > 0.4 
      ? `${max.class} (Confidence: ${(max.probability * 100).toFixed(0)}%)` 
      : "No Significant Pathology Detected";
  };

  // Helper: format risk badges
  const getRiskBadge = (risk) => {
    const r = (risk || "low").toLowerCase();
    if (r === "high") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          High Risk
        </span>
      );
    }
    if (r === "medium") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Activity className="h-3 w-3 shrink-0" />
          Medium Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <ShieldCheck className="h-3 w-3 shrink-0" />
        Low Risk
      </span>
    );
  };

  const handleViewReport = (item) => {
    localStorage.setItem("cxr_active_analysis", JSON.stringify(item));
    navigate("/report");
  };

  const handleDownloadReport = (item) => {
    localStorage.setItem("cxr_active_analysis", JSON.stringify(item));
    localStorage.setItem("cxr_auto_download", "true");
    navigate("/report");
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20 bg-[#0F172A]">
        <div className="max-w-[460px] w-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center gap-6 text-center shadow-xl">
          <div className="h-14 w-14 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-white font-display">Clinical Archive Locked</h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Institutional credentials authentication is required to access the clinical archive node. Please sign in to audit historical reports.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full mt-2">
            <Link to="/login" className="flex-1">
              <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition duration-150 text-xs shadow-md">
                Sign In Node
              </button>
            </Link>
            <Link to="/signup" className="flex-1">
              <button className="w-full border border-white/10 bg-white/5 py-3.5 rounded-xl text-slate-300 hover:text-white transition duration-150 text-xs">
                Request Credentials
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter and sorting operations in React memory
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.id ? item.id.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const itemRisk = (item.result?.risk_level || "low").toLowerCase();
    const matchesRisk = riskFilter === "all" ? true : itemRisk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateSort === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex-1 bg-[#0F172A] px-4 py-8 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-6 select-none font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Clinical Report History</h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Archive database for audited thoracic chest X-ray scans linked to your node.
        </p>
      </div>

      {/* Filter and search control bar */}
      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
        {/* Search by ID */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Report ID (e.g. CXR-...)"
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-white/[0.08] hover:border-white/12 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Filter Risk */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-40 px-3 py-2 bg-slate-950/60 border border-white/[0.08] hover:border-white/12 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="all">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        {/* Sort Date */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={dateSort}
            onChange={(e) => {
              setDateSort(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-40 px-3 py-2 bg-slate-950/60 border border-white/[0.08] hover:border-white/12 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex-1 py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-dashed border-emerald-500 animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Retrieving node records...</span>
        </div>
      ) : error ? (
        <div className="py-12 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-2">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <h3 className="text-sm font-bold text-white mt-1">Failed to connect to history database</h3>
          <p className="text-slate-400 text-xs">{error}</p>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="py-20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-3 bg-slate-900/[0.04]">
          <FileText className="h-8 w-8 text-slate-600" />
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white">No Audits Found</h3>
            <p className="text-slate-500 text-xs max-w-sm leading-normal">
              Either there are no scans stored for this user node, or they do not match your current search/filter settings.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedItems.map((item) => {
            const diagnosis = getPrimaryDiagnosis(item);
            const reportId = item.id || `CXR-${item.history_id || "SCAN"}`;
            const risk = (item.result?.risk_level || "low").toLowerCase();

            return (
              <div 
                key={item.id || item.timestamp}
                className="bg-slate-900/20 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center transition duration-200"
              >
                {/* SVG Thumbnail */}
                <ChestThumbnailSVG risk={risk} />

                {/* Report Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white bg-slate-900 border border-white/10 px-2 py-0.5 rounded">
                      Report #{reportId}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.timestamp}
                    </span>
                    {getRiskBadge(risk)}
                  </div>

                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <h3 className="text-[13.5px] font-semibold text-slate-200 truncate">
                      Primary Finding: <strong className="text-white">{diagnosis}</strong>
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      Parameters: <span className="font-mono text-[11px] bg-slate-950/40 px-1 py-0.5 rounded border border-white/5 text-slate-300">{item.gender || "PA"}</span> &bull; Age Group: <span className="font-mono text-[11px] bg-slate-950/40 px-1 py-0.5 rounded border border-white/5 text-slate-300">{item.ageGroup || "Adult"}</span> &bull; File: <span className="text-slate-500 font-mono text-[11px]">{item.filename}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 md:justify-end border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
                  <button
                    onClick={() => handleViewReport(item)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-150"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Report
                  </button>
                  <button
                    onClick={() => handleDownloadReport(item)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-500/25 hover:border-emerald-500/35 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-bold transition duration-150"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
              <span className="text-xs text-slate-500 font-mono">
                Showing page <strong className="text-slate-300">{currentPage}</strong> of <strong className="text-slate-300">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 border border-white/5 bg-slate-900/40 rounded-lg hover:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`h-8 w-8 rounded-lg text-xs font-mono font-bold transition ${
                      currentPage === idx + 1
                        ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950"
                        : "border border-white/5 bg-slate-900/40 text-slate-400 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 border border-white/5 bg-slate-900/40 rounded-lg hover:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-white transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
