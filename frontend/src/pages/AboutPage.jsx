export function AboutPage({ health, advancedTools }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(15,58,110,0.84))] px-6 py-8 shadow-[0_28px_80px_rgba(2,6,23,0.3)] lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/70">About Platform</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white lg:text-5xl">Research-grade Chest X-ray analysis workspace for disease prediction and error auditing.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-sky-50/88">
          The interface wraps an existing medical imaging backend and preserves every active API, inference route, and analysis function while presenting them in a clearer dashboard workflow.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 text-slate-100 backdrop-blur-xl">
          <h2 className="font-display text-2xl font-semibold text-white">System Overview</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-sky-100/70">Notebook Source</dt>
              <dd className="mt-1 break-all text-slate-200/80">{health?.source_file}</dd>
            </div>
            <div>
              <dt className="font-semibold text-sky-100/70">Artifacts Folder</dt>
              <dd className="mt-1 break-all text-slate-200/80">{health?.artifacts_dir}</dd>
            </div>
            <div>
              <dt className="font-semibold text-sky-100/70">PyTorch Availability</dt>
              <dd className="mt-1 text-slate-200/80">{health?.torch_available ? "Available" : "Not available"}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 text-slate-100 backdrop-blur-xl">
          <h2 className="font-display text-2xl font-semibold text-white">Advanced Utilities</h2>
          <div className="mt-5 grid gap-3">
            {advancedTools.map((tool) => (
              <div key={tool.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">{tool.name}</p>
                <p className="mt-1 text-sm text-slate-300/75">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
