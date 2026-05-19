import { api } from "../services/api";

export function HistoryPage({ history }) {
  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={`${item.tool_id}-${index}`} className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 text-white backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">{item.tool_id}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{item.tool_name}</h3>
            </div>
            {(item.result?.artifacts || []).length > 0 && (
              <a
                href={api.downloadUrl(item.result.artifacts[0].path)}
                className="inline-flex items-center rounded-full bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-200"
              >
                Download first artifact
              </a>
            )}
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/30 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/65">Payload</p>
              <pre className="overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-200/78">{JSON.stringify(item.payload, null, 2)}</pre>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/30 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/65">Result Snapshot</p>
              <pre className="overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-200/78">{JSON.stringify(item.result, null, 2)}</pre>
            </div>
          </div>
        </div>
      ))}
      {history.length === 0 && (
        <div className="rounded-[1.8rem] border border-dashed border-white/15 bg-white/5 p-8 text-sm text-slate-300/74">
          No execution history yet. Run a module to begin collecting exports and result snapshots.
        </div>
      )}
    </div>
  );
}
