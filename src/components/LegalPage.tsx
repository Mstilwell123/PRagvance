import type { ReactNode } from "react";

export type LegalSection = { h: string; body: ReactNode };

export default function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <section className="section-pad mx-auto max-w-3xl py-12 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-[color:var(--text-muted)]">Last updated: October 31, 2026</p>
      <div className="mt-6 text-[color:var(--text-muted)] md:text-lg">{intro}</div>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-xl font-semibold text-[color:var(--text)]">{s.h}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[color:var(--text-muted)]">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
