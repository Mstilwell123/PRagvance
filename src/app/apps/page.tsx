import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { B2B_APPS, B2C_APPS, type ShowcaseApp } from "@/lib/apps";
import { PRODUCT_PAGES } from "@/lib/pricing";
import StartHereLink from "@/components/StartHereLink";

export const metadata: Metadata = {
  title: "Apps / SaaS Portfolio",
  description:
    "Thin portfolio of AI apps & SaaS from Pragvance — including MinutesIntel.ai. We turn a locked PRD into a shipped product.",
  alternates: { canonical: "/apps" },
  openGraph: {
    title: "Apps / SaaS | Pragvance",
    description: "MinutesIntel.ai and custom AI product builds.",
    url: "/apps",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const appCard =
  "group panel gold-glow flex h-full w-full cursor-pointer flex-col items-center p-6 text-center motion-safe:transition motion-safe:duration-200 hover:border-[color:var(--gold-bright)] hover:bg-[rgba(208,162,86,0.12)] motion-safe:hover:-translate-y-0.5 focus-visible:border-[color:var(--gold-bright)] focus-visible:bg-[rgba(208,162,86,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--focus)] motion-safe:focus-visible:-translate-y-0.5";
const logoMotion =
  "motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105";

function AppCard({ app }: { app: ShowcaseApp }) {
  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className={appCard}>
      {app.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={app.logo}
          alt={app.name}
          width={96}
          height={96}
          className={`h-24 w-24 rounded-2xl object-contain ${logoMotion}`}
        />
      ) : (
        <span
          role="img"
          aria-label={app.name}
          className={`flex h-24 w-24 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] text-4xl font-semibold text-[color:var(--gold-bright)] ${logoMotion}`}
        >
          {app.name.charAt(0)}
        </span>
      )}
      <h3 className="mt-4 text-xl font-semibold text-[color:var(--gold-bright)]">{app.name}</h3>
      <p className="mt-2 text-sm text-[color:var(--text-muted)]">{app.description}</p>
      <span className="mt-3 block text-center text-sm text-[color:var(--electric-bright)] hover:underline">
        Start Here
      </span>
    </a>
  );
}

function AppGrid({ apps }: { apps: ShowcaseApp[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.name} app={app} />
      ))}
    </div>
  );
}

export default function AppsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Apps / SaaS", path: "/apps" },
        ]}
      />
      <section className="section-pad mx-auto max-w-4xl py-16 md:py-24">
        <h1 className="text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Apps / SaaS
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          We design + ship AI products for founders, ops, and L&D. We turn a locked PRD into a
          shipped app — web or store — with an AI Guide in the loop so founders aren’t blocked
          waiting on a traditional PM.
        </p>

        <section className="mt-10" aria-labelledby="b2b-heading">
          <h2 id="b2b-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
            B2B
          </h2>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">Business to business</p>
          <AppGrid apps={B2B_APPS} />
        </section>

        <hr className="my-12 border-0 border-t border-[color:var(--line)]" />

        <section aria-labelledby="b2c-heading">
          <h2 id="b2c-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
            B2C
          </h2>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">Business to consumer</p>
          <AppGrid apps={B2C_APPS} />
        </section>

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
