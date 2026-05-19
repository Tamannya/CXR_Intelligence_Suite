import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { ModulePage } from "./pages/ModulePage";
import { ReportsPage } from "./pages/ReportsPage";
import { api } from "./services/api";
import { usePolling } from "./hooks/usePolling";
import { TopNav } from "./components/TopNav";
import { StatusToast } from "./components/StatusToast";
import { LoadingOverlay } from "./components/LoadingOverlay";

const TOOL_MEMORY_KEY = "toolFormMemoryMedicalV1";
const UI_MEMORY_KEY = "workflowUiMemoryMedicalV1";

const featurePages = [
  {
    id: "disease-prediction",
    path: "/disease-prediction",
    title: "Disease Prediction",
    subtitle: "Prepare the metadata, validate dataset compatibility, preview samples, and run Chest X-ray prediction.",
    description: "This workspace handles dataset readiness and the core 14-label disease inference pathway using the integrated pretrained model.",
    toolIds: ["prepare_dataset_metadata", "validate_dataset_match", "sample_image_preview", "run_inference_analysis"],
    resultHighlights: ["summary", "preview", "artifacts"],
  },
  {
    id: "misclassification-analysis",
    path: "/misclassification-analysis",
    title: "Misclassification Analysis",
    subtitle: "Inspect false positives, false negatives, structured error records, and reasoning traces.",
    description: "Use this module to convert inference output into structured error narratives and reasoning-ready audit records.",
    toolIds: ["run_inference_analysis", "generate_structured_error_data", "run_llm_reasoning", "label_inconsistency_detection"],
    resultHighlights: ["preview", "error_distribution", "summary"],
  },
  {
    id: "bias-analysis",
    path: "/bias-analysis",
    title: "Bias Analysis",
    subtitle: "Evaluate demographic skew and severity distribution across age and gender groups.",
    description: "This section surfaces possible dataset bias and clinical-risk concentration using the current inference outputs.",
    toolIds: ["analyze_bias", "run_llm_reasoning", "label_inconsistency_detection"],
    resultHighlights: ["statistics", "preview", "artifacts"],
  },
  {
    id: "confusion-matrix",
    path: "/confusion-matrix",
    title: "Confusion Matrix",
    subtitle: "Review class confusion, dataset-level error patterns, and pairwise disease overlap.",
    description: "Explore confusion trends and misclassification structure without changing the model or backend analysis flow.",
    toolIds: ["dataset_error_pattern_analysis", "run_inference_analysis"],
    resultHighlights: ["matrix", "top_confused_pairs", "summary"],
  },
  {
    id: "error-taxonomy",
    path: "/error-taxonomy",
    title: "Error Taxonomy",
    subtitle: "Organize model errors by severity, category, and disease-level impact.",
    description: "A research-grade view of how errors cluster across the structured taxonomy pipeline and downstream summaries.",
    toolIds: ["build_error_taxonomy", "generate_structured_error_data", "run_llm_reasoning", "gradcam_visualization"],
    resultHighlights: ["taxonomy", "disease_breakdown", "artifacts"],
  },
];

function useLocalStorageState(key, fallback) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function useToasts() {
  const [toasts, setToasts] = useState([]);

  const pushToast = (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  return { toasts, pushToast, dismissToast };
}

export default function App() {
  const location = useLocation();
  const [tools, setTools] = useState([]);
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useLocalStorageState(`${UI_MEMORY_KEY}-job`, null);
  const [latestResultByPage, setLatestResultByPage] = useLocalStorageState(`${UI_MEMORY_KEY}-results`, {});
  const [selectedToolByPage, setSelectedToolByPage] = useLocalStorageState(`${UI_MEMORY_KEY}-selectedTools`, {});
  const [toolFormMemory, setToolFormMemory] = useLocalStorageState(TOOL_MEMORY_KEY, {});
  const [searchByPage, setSearchByPage] = useLocalStorageState(`${UI_MEMORY_KEY}-search`, {});
  const { toasts, pushToast, dismissToast } = useToasts();

  const loadDashboard = async () => {
    const [toolsResponse, healthResponse, historyResponse] = await Promise.all([
      api.getTools(),
      api.getHealth(),
      api.getHistory(),
    ]);
    setTools(toolsResponse.tools);
    setHealth(healthResponse);
    setHistory(historyResponse.items || []);
  };

  useEffect(() => {
    loadDashboard().catch((error) => pushToast({ tone: "error", title: "Connection issue", description: error.message }));
  }, []);

  usePolling(
    async () => {
      try {
        if (!activeJob?.id) return;
        const job = await api.getJob(activeJob.id);
        setActiveJob(job);
        if (job.status === "completed") {
          setLatestResultByPage((current) => ({ ...current, [job.pageId || activeJob.pageId]: job.result }));
          setLoading(false);
          setActiveJob(null);
          pushToast({ tone: "success", title: "Analysis complete", description: `${job.name || "Background job"} finished successfully.` });
          loadDashboard().catch(() => {});
        }
        if (job.status === "failed") {
          setLoading(false);
          setActiveJob(null);
          pushToast({ tone: "error", title: "Job failed", description: job.error || "Background analysis failed." });
        }
      } catch (error) {
        setLoading(false);
        setActiveJob(null);
        pushToast({ tone: "error", title: "Status check failed", description: error.message || "Failed to fetch job status" });
      }
    },
    Boolean(activeJob?.id),
    3000,
  );

  const toolsById = useMemo(() => Object.fromEntries(tools.map((tool) => [tool.id, tool])), [tools]);

  const pageToolMap = useMemo(() => {
    const map = {};
    featurePages.forEach((page) => {
      map[page.id] = page.toolIds.map((toolId) => toolsById[toolId]).filter(Boolean);
    });
    return map;
  }, [toolsById]);

  const advancedTools = useMemo(() => tools.filter((tool) => tool.section === "advanced"), [tools]);

  const getSelectedTool = (pageId, availableTools) => {
    const savedId = selectedToolByPage[pageId];
    return availableTools.find((tool) => tool.id === savedId) || availableTools[0] || null;
  };

  const execute = async (pageId, tool, values) => {
    if (!tool?.id) return;
    setLoading(true);
    try {
      const response = await api.executeTool(tool.id, values);
      if (response.job_id) {
        setActiveJob({ id: response.job_id, status: response.status, progress: 0, pageId });
        pushToast({ tone: "info", title: "Analysis queued", description: `${tool.name} is running in the background.` });
        return;
      }
      setLatestResultByPage((current) => ({ ...current, [pageId]: response.result }));
      pushToast({ tone: "success", title: "Analysis updated", description: `${tool.name} completed successfully.` });
      await loadDashboard();
    } catch (error) {
      pushToast({ tone: "error", title: "Execution failed", description: error.message || "Tool execution failed" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateToolFormMemory = (toolId, values) => {
    if (!toolId) return;
    const serializable = Object.fromEntries(
      Object.entries(values || {}).filter(([, value]) => {
        if (value instanceof File) return false;
        if (Array.isArray(value) && value.some((item) => item instanceof File)) return false;
        return true;
      }),
    );
    setToolFormMemory((current) => ({ ...current, [toolId]: serializable }));
  };

  const layoutNav = [
    { to: "/", label: "Home" },
    { to: "/disease-prediction", label: "Disease Prediction" },
    { to: "/misclassification-analysis", label: "Misclassification Analysis" },
    { to: "/bias-analysis", label: "Bias Analysis" },
    { to: "/confusion-matrix", label: "Confusion Matrix" },
    { to: "/error-taxonomy", label: "Error Taxonomy" },
    { to: "/reports-exports", label: "Reports & Exports" },
    { to: "/about", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_22%),linear-gradient(160deg,_#04132d_0%,_#0b2550_45%,_#0f3c78_100%)] text-white">
      {/* Background image will be added later */}
      <TopNav items={layoutNav} activePath={location.pathname} />
      <LoadingOverlay show={loading} activeJob={activeJob} />
      <StatusToast toasts={toasts} onDismiss={dismissToast} />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[1550px] flex-col px-4 pb-10 pt-8 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage health={health} tools={tools} />} />
          {featurePages.map((page) => {
            const availableTools = pageToolMap[page.id] || [];
            const selectedTool = getSelectedTool(page.id, availableTools);
            const searchValue = searchByPage[page.id] || "";
            const filteredTools = availableTools.filter((tool) =>
              `${tool.name} ${tool.description}`.toLowerCase().includes(searchValue.toLowerCase()),
            );
            const activeTool = filteredTools.find((tool) => tool.id === selectedTool?.id) || filteredTools[0] || selectedTool;

            return (
              <Route
                key={page.path}
                path={page.path}
                element={
                  <ModulePage
                    page={page}
                    tools={filteredTools}
                    selectedTool={activeTool}
                    setSelectedTool={(tool) => setSelectedToolByPage((current) => ({ ...current, [page.id]: tool.id }))}
                    searchValue={searchValue}
                    setSearchValue={(value) => setSearchByPage((current) => ({ ...current, [page.id]: value }))}
                    rememberedValues={toolFormMemory[activeTool?.id] || {}}
                    onValuesChange={(values) => updateToolFormMemory(activeTool?.id, values)}
                    onSubmit={(values) => execute(page.id, activeTool, values)}
                    result={latestResultByPage[page.id] || null}
                    loading={loading}
                    activeJob={activeJob?.pageId === page.id ? activeJob : null}
                  />
                }
              />
            );
          })}
          <Route path="/reports-exports" element={<ReportsPage history={history} latestResults={latestResultByPage} />} />
          <Route path="/about" element={<AboutPage health={health} advancedTools={advancedTools} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
