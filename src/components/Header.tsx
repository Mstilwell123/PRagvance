"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV, SITE } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:rgba(0,0,0,0.82)] backdrop-blur-md">
      <div className="section-pad mx-auto flex max-w-6xl items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Pragvance home">
          <span className="text-sm font-semibold tracking-[0.12em] text-[color:var(--text)] md:text-base">
            PRAGVANCE<span className="text-[color:var(--gold)]">.AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.filter((n) => n.href !== "/").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--electric-bright)]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={SITE.swarmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-full bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)] electric-ring"
          >
            Join Agent Swarm
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--text)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[color:var(--line)] bg-[color:var(--bg-space)] lg:hidden"
        >
          <nav className="section-pad flex flex-col gap-1 py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-[color:var(--text)] hover:bg-[color:var(--bg-panel)] hover:text-[color:var(--electric-bright)]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={SITE.swarmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-full bg-[color:var(--gold)] px-4 py-3 text-center font-semibold text-black"
              onClick={() => setOpen(false)}
            >
              Join Agent Swarm — {SITE.swarmPrice}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
