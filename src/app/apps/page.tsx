import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

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
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="panel gold-glow p-6">
            <h2 className="text-xl font-semibold text-[color:var(--gold-bright)]">
              MinutesIntel.ai
            </h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Public product on its own domain. Feature matrices and pricing stay there.
            </p>
            <a
              href="https://minutesintel.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-[color:var(--electric-bright)] hover:underline"
            >
              minutesintel.ai →
            </a>
          </article>
          <article className="panel p-6">
            <h2 className="text-xl font-semibold text-[color:var(--text)]">Custom build</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Need a product, not only agents? Start a build conversation.
            </p>
            <Link
              href="/contact#contact"
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
