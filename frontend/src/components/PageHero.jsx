export function PageHero({ eyebrow, title, subtitle, description }) {
  return (
    <section className="rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(15,58,110,0.84))] px-6 py-8 shadow-[0_28px_80px_rgba(2,6,23,0.3)] lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/70">{eyebrow}</p>
      <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-tight text-white lg:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-sky-50/88">{subtitle}</p>
      {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200/72">{description}</p> : null}
    </section>
  );
}

