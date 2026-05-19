import { ArrowRight, Microscope, ShieldCheck, Stethoscope } from "lucide-react";
import { NavLink } from "react-router-dom";

export function HomePage({ health, tools }) {
  return (
    <div className="space-y-8">
      <section id="hero" className="rounded-[2.3rem] border border-sky-300/10 bg-[linear-gradient(145deg,rgba(10,19,43,0.95),rgba(11,37,80,0.9),rgba(14,74,138,0.72))] px-6 py-10 shadow-[0_28px_100px_rgba(2,6,23,0.35)] lg:px-10 lg:py-14">
        {/* Background image will be added later */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-sky-200/75">AI Medical Imaging Platform</p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight text-white lg:text-6xl">
              Agentic AI Healthcare Prediction System for Chest X-ray disease classification and clinical error analysis.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-sky-50/88">
              This system turns a Chest X-ray AI research workflow into a polished medical dashboard where prediction, misclassification review,
              demographic bias checks, taxonomy generation, and explainability outputs can be explored through a single professional interface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <NavLink
                to="/disease-prediction"
                className="inline-flex items-center gap-2 rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-200"
              >
                Open Prediction Workflow
                <ArrowRight className="h-4 w-4" />
              </NavLink>
              <NavLink
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn More
              </NavLink>
            </div>
          </div>

          <div className="grid gap-4 self-end md:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
              <Microscope className="h-5 w-5 text-sky-200" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-sky-100/70">Integrated Modules</p>
              <p className="mt-2 text-3xl font-semibold text-white">{tools.length}</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
              <ShieldCheck className="h-5 w-5 text-sky-200" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-sky-100/70">Runtime Health</p>
              <p className="mt-2 text-lg font-semibold text-white">{health?.torch_available ? "PyTorch Ready" : "Dependency Check Needed"}</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
              <Stethoscope className="h-5 w-5 text-sky-200" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-sky-100/70">Research Focus</p>
              <p className="mt-2 text-lg font-semibold text-white">Prediction, auditing, explainability</p>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Disease Prediction",
            text: "Run 14-label Chest X-ray inference with structured outputs, thresholded predictions, and confidence summaries.",
          },
          {
            title: "Model Error Intelligence",
            text: "Track false positives, false negatives, misclassifications, and structured error reasoning in a readable format.",
          },
          {
            title: "Clinical Audit Views",
            text: "Explore bias patterns, error taxonomy, confusion structure, reports, and explainability artifacts for research review.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 text-white shadow-[0_18px_64px_rgba(2,6,23,0.22)] backdrop-blur-xl">
            <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200/78">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
