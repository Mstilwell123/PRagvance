import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { APPS } from "@/lib/apps";

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
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app) => (
            <article key={app.name} className="panel gold-glow flex flex-col items-center p-6 text-center">
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl transition hover:scale-105"
              >
                {app.logo ? (
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
                )}
              </a>
              <h2 className="mt-4 text-xl font-semibold text-[color:var(--gold-bright)]">{app.name}</h2>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">{app.description}</p>
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
          </article>
        </div>
      </section>
    </>
  );
}
