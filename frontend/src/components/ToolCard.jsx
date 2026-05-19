import { ArrowRight, Sparkles } from "lucide-react";

export function ToolCard({ tool, onSelect, active = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      className={`group w-full rounded-[1.7rem] border p-5 text-left transition duration-300 ${
        active
          ? "border-sky-300/30 bg-sky-300/10 shadow-[0_20px_70px_rgba(56,189,248,0.16)]"
          : "border-white/10 bg-white/6 hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-white/8"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/80">
          {tool.section === "advanced" ? "Advanced" : "Clinical Module"}
        </span>
        <Sparkles className={`h-4 w-4 transition ${active ? "text-sky-200" : "text-sky-200/50 group-hover:text-sky-200"}`} />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{tool.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300/76">{tool.description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/60">
        <span>{tool.params.length} Input{tool.params.length === 1 ? "" : "s"}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

