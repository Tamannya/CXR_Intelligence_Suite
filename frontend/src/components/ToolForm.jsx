import { useEffect, useMemo, useState } from "react";
import { ChevronRight, FileText, LoaderCircle, Play, UploadCloud } from "lucide-react";

const initialValueForParam = (param) => {
  if (param.default !== undefined) return param.default;
  if (param.type === "boolean") return false;
  return "";
};

export function ToolForm({ tool, onSubmit, rememberedValues, onValuesChange, loading, activeJob }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tool) return;
    const next = {};
    tool.params.forEach((param) => {
      next[param.name] = rememberedValues?.[param.name] !== undefined ? rememberedValues[param.name] : initialValueForParam(param);
    });
    setValues(next);
    setError("");
  }, [tool]);

  const submitLabel = useMemo(() => (tool?.async ? "Queue Analysis" : "Run Analysis"), [tool]);

  if (!tool) {
    return (
      <div className="rounded-[1.9rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300/74 backdrop-blur-xl">
        Select a clinical module to generate its input form.
      </div>
    );
  }

  const updateValue = (name, value) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      onValuesChange?.(next);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const missing = (tool?.params || [])
      .filter((param) => param.required)
      .filter((param) => {
        const value = values[param.name];
        if (param.type === "file") {
          return !(value instanceof File) && !(typeof value === "string" && value.trim());
        }
        return value === undefined || value === null || value === "";
      })
      .map((param) => param.name);
    if (missing.length) {
      setError(`Missing required parameter(s): ${missing.join(", ")}`);
      return;
    }

    try {
      await onSubmit(values);
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.9rem] border border-white/10 bg-white/6 p-6 text-white shadow-[0_20px_80px_rgba(2,6,23,0.22)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">{tool.section === "advanced" ? "Advanced utility" : "Execution panel"}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold">{tool.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/76">{tool.description}</p>
        </div>
        <div className="hidden rounded-2xl border border-white/10 bg-sky-300/10 p-3 text-sky-100 lg:block">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-4">
        {tool.params.map((param) => (
          <label key={param.name} className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-100">{param.name}</span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300/70">{param.type}</span>
            </div>

            {param.type === "textarea" && (
              <textarea
                rows={6}
                className="medical-input min-h-[132px]"
                value={values[param.name] ?? ""}
                onChange={(event) => updateValue(param.name, event.target.value)}
              />
            )}

            {param.type === "json" && (
              <textarea
                rows={8}
                className="medical-input font-mono text-[13px]"
                value={typeof values[param.name] === "string" ? values[param.name] : JSON.stringify(values[param.name] ?? {}, null, 2)}
                onChange={(event) => updateValue(param.name, event.target.value)}
              />
            )}

            {param.type === "dropdown" && (
              <select className="medical-input" value={values[param.name] ?? ""} onChange={(event) => updateValue(param.name, event.target.value)}>
                {param.options?.map((option) => (
                  <option key={option} value={option} className="bg-slate-950 text-white">
                    {option}
                  </option>
                ))}
              </select>
            )}

            {param.type === "file" && (
              <div className="rounded-[1.5rem] border border-dashed border-sky-200/20 bg-slate-950/30 px-4 py-6 text-center">
                <UploadCloud className="mx-auto mb-3 h-6 w-6 text-sky-200/70" />
                <input
                  type="file"
                  accept={param.accept}
                  onChange={(event) => updateValue(param.name, event.target.files?.[0] ?? null)}
                  className="mx-auto block text-sm text-slate-300"
                />
                <p className="mt-3 text-xs text-slate-300/72">
                  {values[param.name] instanceof File
                    ? `Selected: ${values[param.name].name}`
                    : typeof values[param.name] === "string" && values[param.name].trim()
                      ? `Using absolute file path: ${values[param.name]}`
                      : "No file selected"}
                </p>
                <input
                  type="text"
                  placeholder="Or provide an absolute file path available to the backend"
                  className="medical-input mt-4"
                  value={typeof values[param.name] === "string" ? values[param.name] : ""}
                  onChange={(event) => updateValue(param.name, event.target.value)}
                />
              </div>
            )}

            {["text", "directory", "number"].includes(param.type) && (
              <input
                type={param.type === "number" ? "number" : "text"}
                className="medical-input"
                value={values[param.name] ?? ""}
                onChange={(event) => updateValue(param.name, event.target.value)}
              />
            )}

            {param.type === "boolean" && (
              <label className="inline-flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-100">
                <input type="checkbox" checked={Boolean(values[param.name])} onChange={(event) => updateValue(param.name, event.target.checked)} />
                <span>{param.name}</span>
              </label>
            )}
          </label>
        ))}
      </div>

      {activeJob && (
        <div className="rounded-[1.5rem] border border-sky-300/15 bg-sky-300/10 px-4 py-4 text-sm text-sky-50">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">{activeJob.status}</span>
            <span>{activeJob.progress ?? 0}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-sky-300 transition-all duration-500" style={{ width: `${Math.min(activeJob.progress ?? 0, 100)}%` }} />
          </div>
          {activeJob.message ? <p className="mt-3 text-xs text-sky-100/78">{activeJob.message}</p> : null}
        </div>
      )}

      {error && <div className="rounded-[1.5rem] border border-rose-300/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-50">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {submitLabel}
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}

