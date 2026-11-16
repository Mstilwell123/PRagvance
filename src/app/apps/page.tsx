import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { APPS, SAAS_APPS, type ShowcaseApp } from "@/lib/apps";
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

function AppLogo({ app }: { app: ShowcaseApp }) {
  if (app.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={app.logo}
        alt={app.name}
        width={96}
        height={96}
        className="h-24 w-24 rounded-2xl object-contain"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={app.name}
      className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] text-4xl font-semibold text-[color:var(--gold-bright)]"
    >
      {app.name.charAt(0)}
    </span>
  );
}

function AppCard({ app }: { app: ShowcaseApp }) {
  const logo = <AppLogo app={app} />;

  return (
    <article className="panel gold-glow flex flex-col items-center p-6 text-center">
      {app.url ? (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl transition hover:scale-105"
        >
          {logo}
        </a>
      ) : (
        logo
      )}
      <h3 className="mt-4 text-xl font-semibold text-[color:var(--gold-bright)]">{app.name}</h3>
      {app.description ? (
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">{app.description}</p>
      ) : null}
      {app.url ? <StartHereLink href={app.url} label={app.name} /> : null}
    </article>
  );
}

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
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl">Apps</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APPS.map((app) => (
              <AppCard key={app.name} app={app} />
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <article className="panel p-6">
            <h3 className="text-xl font-semibold text-[color:var(--text)]">Custom build</h3>
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
        <div className="mt-16 border-t border-[color:var(--line)] pt-16">
          <h2 className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl">SaaS</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAAS_APPS.map((app) => (
              <AppCard key={app.name} app={app} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
