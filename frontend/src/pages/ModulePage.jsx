import { SearchBar } from "../components/SearchBar";
import { ToolCard } from "../components/ToolCard";
import { ToolForm } from "../components/ToolForm";
import { ResultRenderer } from "../components/ResultRenderer";
import { PageHero } from "../components/PageHero";

export function ModulePage({
  page,
  tools,
  selectedTool,
  setSelectedTool,
  searchValue,
  setSearchValue,
  rememberedValues,
  onValuesChange,
  onSubmit,
  result,
  loading,
  activeJob,
}) {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Feature Module" title={page.title} subtitle={page.subtitle} description={page.description} />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="space-y-4">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/65">Module Tools</p>
            <p className="mt-2 text-sm text-slate-200/70">Run only the workflows relevant to this page.</p>
            <div className="mt-4">
              <SearchBar value={searchValue} onChange={setSearchValue} placeholder="Search module actions..." />
            </div>
          </div>
          <div className="space-y-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={setSelectedTool} active={selectedTool?.id === tool.id} />
            ))}
            {tools.length === 0 && (
              <div className="rounded-[1.8rem] border border-dashed border-white/15 bg-white/5 p-8 text-sm text-slate-300/72">
                No tools match this module filter right now.
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-4">
          <ToolForm
            tool={selectedTool}
            onSubmit={onSubmit}
            rememberedValues={rememberedValues}
            onValuesChange={onValuesChange}
            loading={loading}
            activeJob={activeJob}
          />
        </section>

        <section className="space-y-4">
          <ResultRenderer result={result} contextLabel={page.title} />
        </section>
      </div>
    </div>
  );
}

