import { FileJson, History } from "lucide-react";
import { HistoryPage } from "./HistoryPage";

export function ReportsPage({ history, latestResults }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(15,58,110,0.84))] px-6 py-8 shadow-[0_28px_80px_rgba(2,6,23,0.3)] lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/70">Reports & Exports</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white lg:text-5xl">Review execution history and exported medical AI artifacts.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-sky-50/88">
          This section keeps every completed run accessible so you can revisit structured results, generated files, and export-ready analytics.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 text-white backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-sky-200" />
            <p className="font-display text-lg font-semibold">Stored Runs</p>
          </div>
          <p className="mt-3 text-3xl font-semibold">{history.length}</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 text-white backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <FileJson className="h-5 w-5 text-sky-200" />
            <p className="font-display text-lg font-semibold">Active Result Panels</p>
          </div>
          <p className="mt-3 text-3xl font-semibold">{Object.keys(latestResults || {}).length}</p>
        </div>
      </section>

      <HistoryPage history={history} />
    </div>
  );
}

