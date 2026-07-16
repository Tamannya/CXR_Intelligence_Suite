import React from "react";

export function DiseaseTable({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return <div className="text-slate-500 text-sm">No predictions available.</div>;
  }

  // Filter out diseases with confidence <= 5%
  const filtered = predictions.filter((p) => p.confidence > 0.05);

  // Sort: Detected (predicted: true) at top (sorted by confidence descending),
  // then non-detected (predicted: false) sorted by confidence descending.
  const sorted = [...filtered].sort((a, b) => {
    if (a.predicted && !b.predicted) return -1;
    if (!a.predicted && b.predicted) return 1;
    return b.confidence - a.confidence;
  });

  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/3 font-mono">
              Disease Name
            </th>
            <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/3 font-mono">
              Confidence %
            </th>
            <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/3 text-right font-mono">
              Detected
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map((row) => {
            const confidencePercent = Math.round(row.confidence * 100);
            return (
              <tr
                key={row.disease}
                className={`transition-colors hover:bg-white/[0.02] ${
                  row.predicted
                    ? "font-semibold text-white"
                    : "text-slate-400 font-normal"
                }`}
              >
                <td className="py-3 text-[13.5px]">{row.disease}</td>
                <td className="py-3 text-[13.5px]">
                  <div className="flex items-center gap-3">
                    <span className="w-10 font-mono text-left">{confidencePercent}%</span>
                    <div className="flex-1 max-w-[160px] bg-slate-950/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          row.predicted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-slate-700"
                        }`}
                        style={{ width: `${confidencePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-[13.5px] text-right">
                  {row.predicted ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-950/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 border border-white/5">
                      No
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
