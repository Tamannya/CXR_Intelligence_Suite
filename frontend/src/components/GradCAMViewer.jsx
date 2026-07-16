import React, { useState } from "react";

export function GradCAMViewer({ originalSrc, heatmapBase64 }) {
  const [viewMode, setViewMode] = useState("heatmap"); // 'original', 'heatmap', or 'overlay'

  if (!heatmapBase64) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 border border-dashed border-white/10 rounded-xl text-slate-500 select-none">
        <p className="text-[13.5px] font-mono">Heatmap not available for this image.</p>
      </div>
    );
  }

  const heatmapSrc = `data:image/png;base64,${heatmapBase64}`;

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Original X-Ray */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Original X-Ray
          </span>
          <div className="w-full h-[320px] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-white/10">
            <img
              src={originalSrc}
              alt="Original Chest X-Ray"
              className="max-h-[320px] w-full h-full object-contain filter brightness-[0.88]"
            />
          </div>
        </div>

        {/* Right Side: Visualizer with Toggle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Grad-CAM Visualizer
            </span>
            {/* View Mode Toggle Buttons */}
            <div className="inline-flex rounded-lg border border-white/10 bg-slate-950/80 p-0.5">
              {["original", "heatmap", "overlay"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all uppercase font-mono ${
                    viewMode === mode
                      ? "bg-emerald-500 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[320px] relative flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-white/10">
            {viewMode === "original" && (
              <img
                src={originalSrc}
                alt="Original"
                className="max-h-[320px] w-full h-full object-contain filter brightness-[0.88]"
              />
            )}
            {viewMode === "heatmap" && (
              <img
                src={heatmapSrc}
                alt="Grad-CAM Heatmap"
                className="max-h-[320px] w-full h-full object-contain"
              />
            )}
            {viewMode === "overlay" && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={originalSrc}
                  alt="Original background"
                  className="absolute max-h-[320px] w-full h-full object-contain filter brightness-[0.88]"
                />
                <img
                  src={heatmapSrc}
                  alt="Grad-CAM overlay"
                  className="absolute max-h-[320px] w-full h-full object-contain mix-blend-screen opacity-65"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[12px] text-slate-400 leading-normal border-t border-white/5 pt-3">
        Highlighted regions show where the model focused to make predictions.{" "}
        <span className="font-semibold text-red-400">Red = high attention</span>,{" "}
        <span className="font-semibold text-emerald-400">Emerald = low attention</span>.
      </p>
    </div>
  );
}
