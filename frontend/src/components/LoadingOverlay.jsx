import { LoaderCircle } from "lucide-react";

export function LoadingOverlay({ show, activeJob }) {
  if (!show && !activeJob) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center bg-slate-950/20 p-6 lg:items-start lg:justify-end">
      <div className="pointer-events-auto w-full max-w-sm rounded-[1.8rem] border border-sky-300/15 bg-slate-950/85 p-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-200">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{activeJob ? "Background Analysis Running" : "Preparing Workspace"}</p>
            <p className="text-sm text-slate-300/80">
              {activeJob ? `${activeJob.status || "running"} · ${activeJob.progress ?? 0}% complete` : "Submitting request to the backend"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

