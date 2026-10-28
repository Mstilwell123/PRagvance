"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export type Slide = { src: string; alt: string };

export default function FirstAgentCarousel({ slides, label }: { slides: Slide[]; label: string }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => Math.min(n - 1, Math.max(0, v + d))), [n]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${label} slides`}
      tabIndex={0}
      className="mx-auto w-full max-w-xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--electric-bright)] rounded-2xl"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      }}
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        startX.current = null;
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[color:var(--line)]">
        {slides.map((s, k) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} of ${n}`}
            aria-hidden={k !== i}
            className={k === i ? "absolute inset-0" : "hidden"}
          >
            <Image src={s.src} alt={s.alt} fill sizes="(max-width: 640px) 100vw, 576px" priority={k === 0} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous slide"
          className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--text)] disabled:opacity-40">← Prev</button>
        <p className="text-sm text-[color:var(--text-muted)]" aria-live="polite">Slide {i + 1} of {n}</p>
        <button type="button" onClick={() => go(1)} disabled={i === n - 1} aria-label="Next slide"
          className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--text)] disabled:opacity-40">Next →</button>
      </div>
    </div>
  );
}
