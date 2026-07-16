import React from "react";

export function StepCard({ stepNumber, title, isLoading, children }) {
  if (isLoading) {
    return (
      <div className="relative flex flex-col p-6 bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] rounded-xl animate-pulse min-h-[128px]">
        {/* Step pill */}
        <div className="absolute top-6 left-6 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-slate-950 text-[12px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          {stepNumber}
        </div>
        <div className="pl-8 flex flex-col gap-4">
          <div className="h-4 bg-slate-850/80 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-850/80 rounded w-full"></div>
            <div className="h-3 bg-slate-850/80 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col p-6 bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] rounded-xl transition-all duration-300 ease-in-out opacity-100 hover:border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]">
      {/* Step pill */}
      <div className="absolute top-6 left-6 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-slate-950 text-[12px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
        {stepNumber}
      </div>
      <div className="pl-8 flex flex-col gap-3">
        <h3 className="text-[15.5px] font-bold text-white leading-tight">
          {title}
        </h3>
        <div className="text-[14px] text-slate-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
