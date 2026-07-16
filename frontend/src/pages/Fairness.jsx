import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AlertCircle, ShieldAlert } from "lucide-react";

const GENDER_DATA = [
  { name: "Male", error_rate: 47.2, fill: "#2471a3" },
  { name: "Female", error_rate: 52.8, fill: "#8e44ad" }
];

const AGE_DATA = [
  { name: "Age < 40", error_rate: 31.5, fill: "#27ae60" },
  { name: "Age 40-60", error_rate: 42.1, fill: "#b7770d" },
  { name: "Age > 60", error_rate: 26.4, fill: "#c0392b" }
];

const BIAS_FINDINGS = [
  {
    group: "Male patients",
    errorRate: "47.2%",
    fnHeavy: "Yes",
    pVal: "< 0.05",
    indicator: "Moderate gender disparity — likely dataset composition bias"
  },
  {
    group: "Female patients",
    errorRate: "52.8%",
    fnHeavy: "Yes",
    pVal: "< 0.05",
    indicator: "Higher FN concentration — anatomical feature variation"
  },
  {
    group: "Age < 40",
    errorRate: "31.5%",
    fnHeavy: "No (FP dominant)",
    pVal: "> 0.05 (not sig.)",
    indicator: "Lower severity; FP over-sensitivity pattern"
  },
  {
    group: "Age 40–60",
    errorRate: "42.1%",
    fnHeavy: "Yes",
    pVal: "< 0.05",
    indicator: "High FN rate; acquisition artifacts in older imaging"
  },
  {
    group: "Age > 60",
    errorRate: "26.4%",
    fnHeavy: "Yes",
    pVal: "< 0.01",
    indicator: "Concentrated high-severity FNs; underrepresented in training"
  }
];

export function Fairness() {
  return (
    <div className="mx-auto max-w-[1200px] w-full px-8 py-8 flex flex-col gap-6">
      {/* Title with Chi-Square Badge */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] uppercase font-semibold text-slate-400 tracking-wider">Demographic Audit</span>
          <h1 className="text-[20px] font-semibold text-[#1a3a5c] mt-1">Demographic Bias Analysis</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-500">Chi-Square Test Significance:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-100 px-3 py-1 text-[11px] font-semibold">
            <ShieldAlert className="h-3 w-3" />
            p &lt; 0.05 (Significant)
          </span>
        </div>
      </div>

      {/* Bar Charts (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Bar Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold text-[#1a3a5c] tracking-tight mb-4 uppercase">
            Gender Distribution of Errors (%)
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GENDER_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 60]} />
                <Tooltip formatter={(value) => [`${value}%`, "Error Share"]} />
                <Bar dataKey="error_rate" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Group Bar Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold text-[#1a3a5c] tracking-tight mb-4 uppercase">
            Age Group Distribution of Errors (%)
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={AGE_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 50]} />
                <Tooltip formatter={(value) => [`${value}%`, "Error Share"]} />
                <Bar dataKey="error_rate" radius={[4, 4, 0, 0]} barSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bias Findings Table */}
      <div className="flex flex-col gap-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-[14px] font-semibold text-[#1a3a5c]">Statistical Bias Metrics</h3>
        </div>
        <div className="overflow-x-auto rounded border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Audit Group</th>
                <th className="px-4 py-3">Error Rate</th>
                <th className="px-4 py-3">FN-Heavy Severity?</th>
                <th className="px-4 py-3">Chi-sq p-value</th>
                <th className="px-4 py-3">LLM Bias Indicator / Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px] text-slate-600">
              {BIAS_FINDINGS.map((row) => (
                <tr key={row.group} className="hover:bg-slate-50 transition duration-150">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.group}</td>
                  <td className="px-4 py-3 font-mono">{row.errorRate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      row.fnHeavy.startsWith("Yes") ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {row.fnHeavy}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{row.pVal}</td>
                  <td className="px-4 py-3 text-slate-500">{row.indicator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Callout box at bottom */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5 flex items-start gap-4">
        <div className="rounded-full bg-amber-100 p-2 text-amber-800">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-[13px] font-semibold text-[#b7770d] uppercase tracking-wide">Key Finding</h4>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            <strong>68.5%</strong> of high-severity false negatives occur in patients aged <strong>&ge;40</strong>. This indicates a high concentration of clinical risk in older cohorts, likely due to reduced anatomical image contrast and higher disease comorbidities.
          </p>
        </div>
      </div>
    </div>
  );
}
