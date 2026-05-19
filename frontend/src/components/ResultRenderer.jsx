import { ChevronDown, Download, FileJson, Image as ImageIcon, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../services/api";

function splitLabels(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item !== "None" && item !== "No Finding");
}

function LabelBadges({ title, value, tone = "sky" }) {
  const labels = splitLabels(value);
  const toneClass =
    tone === "rose"
      ? "border-rose-300/20 bg-rose-500/10 text-rose-100"
      : tone === "amber"
        ? "border-amber-300/20 bg-amber-500/10 text-amber-100"
        : tone === "emerald"
          ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100"
          : "border-sky-300/20 bg-sky-500/10 text-sky-100";

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/70">{title}</p>
      <div className="flex flex-wrap gap-2">
        {labels.length > 0 ? (
          labels.map((label) => (
            <span key={`${title}-${label}`} className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
              {label}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300/70">None</span>
        )}
      </div>
    </div>
  );
}

function SummaryCards({ summary }) {
  const entries = Object.entries(summary || {});
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-[1.5rem] border border-white/8 bg-slate-950/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300/60">{key.replace(/_/g, " ")}</p>
          <p className="mt-3 text-lg font-semibold text-white">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

function ConfidenceBarList({ confidence }) {
  const entries = Object.entries(confidence || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) return null;

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300/60">Confidence Scores</p>
      <div className="mt-4 space-y-3">
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-200/80">
              <span>{label}</span>
              <span>{Math.round(Number(value) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/8">
              <div className="h-2 rounded-full bg-[linear-gradient(90deg,#7dd3fc,#38bdf8,#2563eb)]" style={{ width: `${Math.max(4, Math.min(Number(value) * 100, 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableView({ rows }) {
  const columns = Object.keys(rows?.[0] || {});
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/8">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-white/8 text-sm">
          <thead className="bg-white/8">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">
                  {column.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 bg-slate-950/25">
            {rows.map((row, index) => (
              <tr key={`row-${index}`} className="align-top">
                {columns.map((column) => {
                  const value = row[column];
                  if (["true_labels", "pred_labels", "false_positives", "false_negatives"].includes(column)) {
                    return (
                      <td key={column} className="px-4 py-4">
                        <LabelBadges title="" value={value} tone={column === "false_negatives" ? "rose" : column === "false_positives" ? "amber" : column === "pred_labels" ? "emerald" : "sky"} />
                      </td>
                    );
                  }
                  if (column === "confidence" && typeof value === "object") {
                    return (
                      <td key={column} className="px-4 py-4">
                        <ConfidenceBarList confidence={value} />
                      </td>
                    );
                  }
                  return (
                    <td key={column} className="px-4 py-4 text-slate-200/82">
                      {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChartPanel({ title, data }) {
  const entries = Object.entries(data || {}).map(([name, value]) => ({ name, value: Number(value) || 0 }));
  if (!entries.length) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-[1.6rem] border border-white/8 bg-slate-950/30 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/65">{title} · Distribution</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} angle={-12} textAnchor="end" interval={0} height={60} />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {entries.map((entry, index) => (
                  <Cell key={entry.name} fill={["#7dd3fc", "#38bdf8", "#2563eb", "#1d4ed8", "#0ea5e9"][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-[1.6rem] border border-white/8 bg-slate-950/30 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/65">{title} · Proportions</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={entries} dataKey="value" nameKey="name" outerRadius={100} innerRadius={48} paddingAngle={3} label>
                {entries.map((entry, index) => (
                  <Cell key={entry.name} fill={["#7dd3fc", "#38bdf8", "#2563eb", "#1d4ed8", "#0ea5e9"][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ArtifactGrid({ artifacts }) {
  if (!artifacts?.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {artifacts.map((artifact) => {
        const Icon = artifact.kind === "image" ? ImageIcon : artifact.kind === "csv" ? Table2 : FileJson;
        return (
          <a
            key={artifact.path}
            href={api.downloadUrl(artifact.path)}
            className="group rounded-[1.5rem] border border-white/10 bg-white/6 p-4 transition hover:border-sky-300/20 hover:bg-white/8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-300/10 p-3 text-sky-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{artifact.label}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300/60">{artifact.kind}</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-300/70 transition group-hover:text-sky-100" />
            </div>
          </a>
        );
      })}
    </div>
  );
}

function ResultDetails({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-slate-950/30">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <span className="font-display text-lg font-semibold text-white">{title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-300 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </div>
  );
}

export function ResultRenderer({ result, contextLabel }) {
  const previewRows = useMemo(() => {
    if (!result?.preview) return [];
    if (Array.isArray(result.preview)) return result.preview;
    if (result.preview?.rows) return result.preview.rows;
    return [];
  }, [result]);

  if (!result) {
    return (
      <div className="rounded-[1.9rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300/74 backdrop-blur-xl">
        No results yet. Run a workflow in {contextLabel} to render predictions, audit summaries, charts, and export artifacts here.
      </div>
    );
  }

  const structuredPreview = previewRows.slice(0, 6);
  const artifacts = result.artifacts || [];

  return (
    <div className="space-y-4 rounded-[1.9rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.22)] backdrop-blur-xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">Formatted Output</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-white">Clinical Analysis Results</h3>
        <p className="mt-2 text-sm leading-7 text-slate-300/74">The backend response is preserved exactly, but the presentation is optimized for medical AI review and export.</p>
      </div>

      {result.summary && !Array.isArray(result.summary) ? <SummaryCards summary={result.summary} /> : null}
      {result.error_distribution ? <ChartPanel title="Error Taxonomy Signal" data={result.error_distribution} /> : null}
      {result.top_confused_pairs && !Array.isArray(result.top_confused_pairs) ? <ChartPanel title="Confusion Pair Frequency" data={result.top_confused_pairs} /> : null}

      {structuredPreview.length > 0 ? (
        <ResultDetails title="Structured Preview" defaultOpen>
          <TableView rows={structuredPreview} />
        </ResultDetails>
      ) : null}

      {artifacts.length > 0 ? (
        <ResultDetails title="Reports & Downloads" defaultOpen>
          <ArtifactGrid artifacts={artifacts} />
        </ResultDetails>
      ) : null}

      <ResultDetails title="Raw JSON Response">
        <pre className="overflow-auto whitespace-pre-wrap rounded-[1.4rem] border border-white/8 bg-slate-950/35 p-4 text-xs leading-6 text-slate-200/78">
          {JSON.stringify(result, null, 2)}
        </pre>
      </ResultDetails>
    </div>
  );
}
