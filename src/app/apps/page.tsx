import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { APPS } from "@/lib/apps";
import { PRODUCT_PAGES } from "@/lib/pricing";
import StartHereLink from "@/components/StartHereLink";

export const metadata: Metadata = {
  title: "Apps & SaaS Portfolio",
  description:
    "Thin portfolio of AI apps & SaaS from Pragvance — including MinutesIntel.ai. We turn a locked PRD into a shipped product.",
  alternates: { canonical: "/apps" },
  openGraph: {
    title: "Apps & SaaS | Pragvance",
    description: "MinutesIntel.ai and custom AI product builds.",
    url: "/apps",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

/** Easy to edit — the tool name “Enhance” may change. */
export const BUILT_BY_AI_AGENTS = {
  heading: "Built by AI agents",
  body: "Every app on this page was developed by Mark’s AI agents, not hand-coded by Mark, over six months using tools like Lovable, Enhance and Base44. It’s the same AI workforce we help you build.",
} as const;

/** Logos link only when the landing page and a Get Started (or equivalent) CTA were verified. */
const LOGO_LINKS_TO_LANDING = new Set<string>([
  "MinutesIntel.ai",
  "My Briefing",
  "App N SaaS Builder",
  "ShowPiece.Pro",
  "MinutePushPro",
  "AppDemo.live",
  "VoiceTalk.app",
  "ID-Clare",
]);

/** VoiceTalk links to pricing instead of the homepage. */
const LOGO_LINK_OVERRIDES: Record<string, { href: string; ariaLabel: string }> = {
  "VoiceTalk.app": {
    href: "https://voicetalk.app/pricing",
    ariaLabel: "Open VoiceTalk pricing",
  },
};

export default function AppsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Apps", path: "/apps" },
        ]}
      />
      <section className="section-pad mx-auto max-w-4xl py-16 md:py-24">
        <h1 className="text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Apps & SaaS
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          We design + ship AI products for founders, ops, and L&D. We turn a locked PRD into a
          shipped app — web or store — with an AI Guide in the loop so founders aren’t blocked
          waiting on a traditional PM.
        </p>
        <div className="mt-10 max-w-2xl">
          <h2 className="text-xl font-semibold text-[color:var(--text)]">
            {BUILT_BY_AI_AGENTS.heading}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            {BUILT_BY_AI_AGENTS.body}
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app) => (
            <article key={app.name} className="panel gold-glow flex flex-col items-center p-6 text-center">
              {(() => {
                const logo = app.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.logo}
                    alt={app.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-2xl object-contain"
                  />
                ) : (
                  <span
                    role="img"
                    aria-label={app.name}
                    className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] text-4xl font-semibold text-[color:var(--gold-bright)]"
                  >
                    {app.name.charAt(0)}
                  </span>
                );
                const logoLink = LOGO_LINK_OVERRIDES[app.name];
                return LOGO_LINKS_TO_LANDING.has(app.name) ? (
                  <a
                    href={logoLink?.href ?? app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl transition hover:scale-105"
                    aria-label={logoLink?.ariaLabel ?? `Open ${app.name} landing page`}
                  >
                    {logo}
                  </a>
                ) : (
                  <div className="rounded-2xl">{logo}</div>
                );
              })()}
              <h2 className="mt-4 text-xl font-semibold text-[color:var(--gold-bright)]">{app.name}</h2>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">{app.description}</p>
              <StartHereLink href={app.url} label={app.name} />
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          <article className="panel p-6">
            <h2 className="text-xl font-semibold text-[color:var(--text)]">Custom build</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Need a product, not only agents? Start a build conversation.
            </p>
            <Link
              href="/contact?interest=custom#contact"
              className="mt-4 inline-block text-sm text-[color:var(--electric-bright)] hover:underline"
            >
              Talk about your next app →
            </Link>
            <StartHereLink href={PRODUCT_PAGES.customApp} label="Custom App / SaaS" className="mt-3 block text-left" />
          </article>
        </div>
      </section>
    </>
  );
}
