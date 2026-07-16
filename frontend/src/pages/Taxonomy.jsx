import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { AlertCircle, Filter, X, ChevronRight } from "lucide-react";

const TAXONOMY_CASES = [
  {
    id: 1,
    category: "False Negative",
    disease: "Pneumothorax",
    severity: "High",
    reasoning: "Apical pleural line is extremely faint and obscured by the first rib overlap. The model placed a low attention score (0.02) over the right lung apex.",
    recommendation: "Increase training cases containing apical lines and implement edge-enhancement filters.",
    demographics: "Age 58 · Female · Image ID: 00008432_002.png"
  },
  {
    id: 2,
    category: "False Positive",
    disease: "Cardiomegaly",
    severity: "Low",
    reasoning: "Patient positioning during portable AP view created artificial cardiac silhouette enlargement, which the model falsely flagged as cardiomegaly.",
    recommendation: "Apply AP-to-PA projection normalizations and integrate patient orientation metadata.",
    demographics: "Age 34 · Male · Image ID: 00010452_001.png"
  },
  {
    id: 3,
    category: "Subtle Pathology",
    disease: "Nodule",
    severity: "Medium",
    reasoning: "A tiny 6mm soft-tissue nodule is located in the left middle lobe, overlaying the anterior rib segment, causing it to fall below the model's detection threshold.",
    recommendation: "Deploy high-resolution patch-based local training focus on nodules < 10mm.",
    demographics: "Age 62 · Female · Image ID: 00003290_045.png"
  },
  {
    id: 4,
    category: "Overlap",
    disease: "Atelectasis ↔ Infiltration",
    severity: "Medium",
    reasoning: "Linear subsegmental opacities are present at the left lung base. Visually similar to linear atelectasis and focal infiltration; model outputted overlapping high confidence scores.",
    recommendation: "Incorporate lateral view projections and clinical history annotations.",
    demographics: "Age 47 · Male · Image ID: 00005523_012.png"
  },
  {
    id: 5,
    category: "False Negative",
    disease: "Mass",
    severity: "High",
    reasoning: "A large, dense mass in the right hilum is heavily obscured by hilar vascular congestion and pleural effusion, causing the model to miss the primary mass signature.",
    recommendation: "Train with dual-energy subtraction images or 3D CT cross-referencing.",
    demographics: "Age 67 · Female · Image ID: 00009122_003.png"
  },
  {
    id: 6,
    category: "False Positive",
    disease: "Hernia",
    severity: "Low",
    reasoning: "Gastric bubble extension above the diaphragm boundary was misclassified as hiatal hernia due to overlapping intestinal gas shadows.",
    recommendation: "Utilize segmentation masks to restrict abdominal borders.",
    demographics: "Age 41 · Female · Image ID: 00002139_007.png"
  },
  {
    id: 7,
    category: "Subtle Pathology",
    disease: "Fibrosis",
    severity: "Medium",
    reasoning: "Fine reticular markings in the lower lung zones indicate early-stage interstitial fibrosis. The contrast is too low compared to healthy vascular patterns.",
    recommendation: "Optimize contrast normalization via adaptive CLAHE preprocessing.",
    demographics: "Age 71 · Male · Image ID: 00012920_000.png"
  },
  {
    id: 8,
    category: "Overlap",
    disease: "Effusion ↔ Cardiomegaly",
    severity: "High",
    reasoning: "Massive pleural fluid blunting the left costophrenic angle overlaps the left cardiac border, causing false positive enlargement score.",
    recommendation: "Optimize bounding box constraints and multi-label loss weights.",
    demographics: "Age 59 · Female · Image ID: 00008432_002.png"
  }
];

// Recharts data processing
const PIE_DATA = [
  { name: "False Negative", value: 3, color: "#c0392b" },
  { name: "False Positive", value: 2, color: "#2471a3" },
  { name: "Subtle Pathology", value: 2, color: "#b7770d" },
  { name: "Overlap", value: 2, color: "#8e44ad" }
];

const SEVERITY_DATA = [
  { name: "High", value: 3, fill: "#c0392b" },
  { name: "Medium", value: 3, fill: "#b7770d" },
  { name: "Low", value: 2, fill: "#1e8449" }
];

export function Taxonomy() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedCase, setSelectedCase] = useState(null);

  const filteredCases = activeFilter === "All"
    ? TAXONOMY_CASES
    : TAXONOMY_CASES.filter((item) => item.category === activeFilter);

  const filterButtons = ["All", "False Negative", "False Positive", "Subtle Pathology", "Overlap"];

  return (
    <div className="mx-auto max-w-[1200px] w-full px-8 py-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <span className="text-[12px] uppercase font-semibold text-slate-400 tracking-wider">Classification Taxonomy</span>
        <h1 className="text-[20px] font-semibold text-[#1a3a5c] mt-1">Error Taxonomy Audit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Filter Bar + Card Grid (75% width) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Horizontal Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
            <span className="text-[13px] font-medium text-slate-500 mr-2 flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-400" />
              Filter Category:
            </span>
            {filterButtons.map((btn) => (
              <button
                key={btn}
                onClick={() => setActiveFilter(btn)}
                className={`rounded px-3 py-1.5 text-[12px] font-medium transition ${
                  activeFilter === btn
                    ? "bg-[#1a3a5c] text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a3a5c] hover:text-[#1a3a5c]"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedCase(item)}
                className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-5 hover:border-[#2471a3] hover:shadow-sm transition flex flex-col justify-between gap-4 h-full"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      item.category === "False Negative" ? "bg-red-50 text-red-700 border border-red-100" :
                      item.category === "False Positive" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      item.category === "Subtle Pathology" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-purple-50 text-purple-700 border border-purple-100"
                    }`}>
                      {item.category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.severity === "High" ? "text-red-600" :
                      item.severity === "Medium" ? "text-amber-600" :
                      "text-green-600"
                    }`}>
                      {item.severity} severity
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#1a3a5c] group-hover:text-[#2471a3] transition">
                    {item.disease}
                  </h3>
                  <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.reasoning}
                  </p>
                </div>
                <div className="flex items-center text-[12px] font-medium text-[#2471a3] gap-1 group-hover:underline self-end">
                  View details
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Recharts Charts (25% width) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Pie Chart Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-[12px] font-semibold text-[#1a3a5c] tracking-tight mb-4 uppercase">Taxonomy Distribution</h4>
            <div className="h-[140px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cases`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500">
              {PIE_DATA.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-[12px] font-semibold text-[#1a3a5c] tracking-tight mb-4 uppercase">Severity Distribution</h4>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SEVERITY_DATA} margin={{ left: -30, right: 10, top: 10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} cases`, "Count"]} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {SEVERITY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-[500px] rounded-lg border border-slate-200 bg-white p-6 shadow-lg flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  selectedCase.category === "False Negative" ? "bg-red-50 text-red-700 border border-red-100" :
                  selectedCase.category === "False Positive" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                  selectedCase.category === "Subtle Pathology" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                  "bg-purple-50 text-purple-700 border border-purple-100"
                }`}>
                  {selectedCase.category}
                </span>
                <span className="text-[13px] font-semibold text-[#1a3a5c]">{selectedCase.disease}</span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Demographics */}
            <span className="text-[11px] text-slate-400 font-medium">{selectedCase.demographics}</span>

            {/* Content */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Clinical Audit Reasoning</span>
                <div className="rounded bg-slate-50 border border-slate-100 p-3 text-[13px] text-slate-600 leading-relaxed font-mono">
                  {selectedCase.reasoning}
                </div>
              </div>
              
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Audit Recommendation</span>
                <div className="rounded bg-slate-50 border border-slate-100 p-3 text-[13px] text-[#1a3a5c] leading-relaxed">
                  {selectedCase.recommendation}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCase(null)}
                className="rounded bg-[#1a3a5c] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#2471a3] transition"
              >
                Dismiss Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
