import { StatCard } from "../components/StatCard";

export function HomePage({ health, tools }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-ink px-8 py-10 text-white shadow-panel">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-200"> AI AGENT</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight">
         AGENTIC AI HEALTHCARE PREDICTION SYSTEM
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
          This system turns a chest X-ray AI research workflow into a very simple and user-friendly interface where users can run everything
          from dataset validation and metadata preparation to DenseNet121 training, inference, misclassification review,
          bias auditing, label inconsistency checks, and Grad-CAM explainability. This system make advanced healthcare model analysis practical, transparent, and easy to use from one dashboard.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Registered Tools" value={tools.length} tone="accent" />
        <StatCard label="Torch Available" value={health?.torch_available ? "Yes" : "No"} />
        <StatCard label="Loaded Runtime Keys" value={health?.state?.loaded_keys?.length ?? 0} tone="warn" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">What’s Included</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              "Dataset preparation and metadata cleaning",
              "DenseNet121 build and training pipeline",
              "Misclassification and confidence analysis",
              "Structured prompt generation for audit workflows",
              "LLM and rule-based error reasoning",
              "Bias detection and label inconsistency workflows",
              "Dataset-level error patterns and confusion analysis",
              "Grad-CAM explainability rendering",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Source Wiring</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Notebook Source</dt>
              <dd className="mt-1 break-all text-slate-700">{health?.source_file}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Artifacts Folder</dt>
              <dd className="mt-1 break-all text-slate-700">{health?.artifacts_dir}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
        <h2 className="font-display text-2xl font-semibold text-ink">Recommended Tool Order</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Validate Dataset Match (check CSV and image folder overlap first).</li>
          <li>Prepare Dataset Metadata (upload CSV, optional train/test lists).</li>
          <li>Sample Image Preview (verify image directory and labels).</li>
          <li>Build DenseNet121.</li>
          <li>Train Model.</li>
          <li>Inference And Misclassifications.</li>
          <li>Structured Error Data.</li>
          <li>LLM Error Reasoning.</li>
          <li>Error Taxonomy, Bias Detection, Label Inconsistency, and Grad-CAM.</li>
        </ol>
      </section>
    </div>
  );
}

