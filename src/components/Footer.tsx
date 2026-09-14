import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--bg-void)]">
      <div className="section-pad mx-auto grid max-w-6xl gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-[color:var(--gold-bright)]">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm text-[color:var(--text-muted)]">{SITE.tagline}</p>
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">
            {SITE.legal} · {SITE.location}
          </p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${SITE.email}`}
              className="text-[color:var(--electric-bright)] hover:underline"
            >
              {SITE.email}
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--gold)]">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[color:var(--electric-bright)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--gold)]">
            Offers
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
            <li>
              <a
                href={SITE.swarmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[color:var(--electric-bright)]"
              >
                Agent Swarm — {SITE.swarmPrice}
              </a>
            </li>
            <li>
              <Link href="/shadow-lab" className="hover:text-[color:var(--electric-bright)]">
                Shadow Lab — {SITE.labSeat} / {SITE.labMonth}
              </Link>
            </li>
            <li>
              <Link href="/assessment" className="hover:text-[color:var(--electric-bright)]">
                AI Assessment
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--line)] py-4 text-center text-xs text-[color:var(--text-muted)]">
        © {new Date().getFullYear()} {SITE.legal}. Draft marketing site — not production publish.
      </div>
    </footer>
  );
}
