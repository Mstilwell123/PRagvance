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
  "group panel gold-glow flex h-full w-full cursor-pointer flex-col items-center p-3 text-center motion-safe:transition motion-safe:duration-200 hover:border-[color:var(--gold-bright)] hover:bg-[rgba(208,162,86,0.12)] motion-safe:hover:-translate-y-0.5 focus-visible:border-[color:var(--gold-bright)] focus-visible:bg-[rgba(208,162,86,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--focus)] motion-safe:focus-visible:-translate-y-0.5";
const logoMotion =
  "motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105";

function AppCard({ app, className = "" }: { app: ShowcaseApp; className?: string }) {
  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className={`${appCard} ${className}`.trim()}>
      {app.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={app.logo}
          alt={app.name}
          width={56}
          height={56}
          className={`h-14 w-14 rounded-xl object-contain ${logoMotion}`}
        />
      ) : (
        <span
          role="img"
          aria-label={app.name}
          className={`flex h-14 w-14 items-center justify-center rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] text-2xl font-semibold text-[color:var(--gold-bright)] ${logoMotion}`}
        >
          {app.name.charAt(0)}
        </span>
      )}
      {app.tag ? (
        <span className="mt-2 rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gold-bright)]">
          {app.tag}
        </span>
      ) : null}
      <h3 className="mt-2 text-sm font-semibold text-[color:var(--gold-bright)]">{app.name}</h3>
      <p className="mt-1 text-xs text-[color:var(--text-muted)]">{app.description}</p>
      <span className="mt-2 block text-center text-xs text-[color:var(--electric-bright)] hover:underline">
        Start Here
      </span>
    </a>
  );
}

/** Same five tracks as the B2B row, so these three cards stay the same size: left, middle, right. */
const B2C_DESKTOP_COLUMN = ["", "lg:col-start-3", "lg:col-start-5"];

export default function AppsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Apps / SaaS", path: "/apps" },
        ]}
      />
      <section className="section-pad mx-auto max-w-7xl py-16 md:py-24">
        <h1 className="text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Apps / SaaS
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          We design + ship AI products for founders, ops, and L&D. We turn a locked PRD into a
          shipped app — web or store — with an AI Guide in the loop so founders aren’t blocked
          waiting on a traditional PM.
        </p>

        <section className="mt-10" aria-labelledby="b2b-heading">
          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-2 lg:grid-cols-5">
            <AppCard app={B2B_APPS[0]} />
            <div className="px-2 text-center">
              <h2 id="b2b-heading" className="text-4xl font-bold tracking-tight text-[color:var(--text)] md:text-5xl">
                B2B
              </h2>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">Business to business</p>
            </div>
            {B2B_APPS.slice(1).map((app) => (
              <AppCard key={app.name} app={app} />
            ))}
          </div>
        </section>

        <hr className="my-12 border-0 border-t border-[color:var(--line)]" />

        <section aria-labelledby="b2c-heading">
          <h2 id="b2c-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
            B2C
          </h2>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">Business to consumer</p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {B2C_APPS.map((app, index) => (
              <AppCard key={app.name} app={app} className={B2C_DESKTOP_COLUMN[index] ?? ""} />
            ))}
          </div>
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
