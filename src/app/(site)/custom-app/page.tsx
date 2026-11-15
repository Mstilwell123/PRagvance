import type { Metadata } from "next";
import Link from "next/link";
import { PRICING, PRODUCT_PAGES } from "@/lib/pricing";
import { SITE } from "@/lib/site";

const PATH = PRODUCT_PAGES.customApp;

export const metadata: Metadata = {
  title: "Custom App / SaaS (preview)",
  description:
    "Preview of Pragvance Custom App / SaaS: a custom quote for software built around your company's requirements. Pending approval. This page is not for indexing.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: { canonical: PATH },
  openGraph: {
    title: "Custom App / SaaS (preview)",
    description: "Draft preview, pending approval.",
    url: PATH,
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const cta =
  "mt-10 inline-flex rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)] gold-glow";
const textLink = "text-[color:var(--electric-bright)] hover:underline";

function Confirm({ tag }: { tag: string }) {
  return <strong className="font-semibold text-[color:var(--gold-hot)]">{tag}</strong>;
}

export default function CustomAppPage() {
  return (
    <>
      <p className="bg-[color:var(--gold)] px-4 py-3 text-center text-sm font-semibold text-black">
        DRAFT preview, pending approval
      </p>
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--gold)]">
          Need a company-specific app or SaaS?
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Custom App / SaaS
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[color:var(--gold-bright)]">{PRICING.custom.label}</p>

        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>
            Software built around your company&apos;s requirements. Scope and pricing are agreed
            before development.
          </p>
          <p>
            We design + ship AI products for founders, ops, and L&amp;D — when the work needs a
            product, not only agents. We turn a locked PRD into a shipped app — web or store — with
            an AI Guide in the loop so founders aren’t blocked waiting on a traditional PM.
          </p>
          <p>
            Scope, handover, and support terms are agreed in writing before work begins. Custom work
            is priced in its written agreement. See the{" "}
            <Link href="/terms" className={textLink}>
              terms
            </Link>{" "}
            and the{" "}
            <Link href="/pricing" className={textLink}>
              pricing page
            </Link>
            .
          </p>
          <p>
            Portfolio products such as{" "}
            <a href="https://www.minutesintel.ai/" className={textLink} target="_blank" rel="noopener noreferrer">
              MinutesIntel.ai
            </a>{" "}
            live on their own domains. The{" "}
            <Link href="/apps" className={textLink}>
              apps page
            </Link>{" "}
            lists them.{" "}
            <Confirm tag="[CONFIRM whether those portfolio apps are examples only, or part of this offer]" />
          </p>
          <p>
            Custom app development is not included in{" "}
            <Link href={PRODUCT_PAGES.doneForYou} className={textLink}>
              Done-for-You Complete Setup
            </Link>
            .
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-semibold text-[color:var(--gold-bright)]">How to start</h2>
        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          “Discuss a Custom Build” opens the{" "}
          <Link href="/contact?interest=custom#contact" className={textLink}>
            contact form
          </Link>{" "}
          with Custom app / SaaS selected. The same conversation is labeled “Talk about your next
          app” on the home page and the apps page.
        </p>
        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          Questions:{" "}
          <a href={`mailto:${SITE.email}`} className={textLink}>
            {SITE.email}
          </a>
          . {SITE.legal} · {SITE.location}.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-[color:var(--gold-bright)]">Still to confirm</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
          <li>
            <Confirm tag="[CONFIRM how long a build takes]" />
          </li>
          <li>
            <Confirm tag="[CONFIRM who writes the PRD, and who the AI Guide is]" />
          </li>
          <li>
            <Confirm tag='[CONFIRM which stores "web or store" includes]' />
          </li>
          <li>
            <Confirm tag="[CONFIRM deposit, payment schedule, and what the written agreement must contain beyond scope, handover, support terms, and price]" />
          </li>
          <li>
            <Confirm tag="[CONFIRM what support after launch includes]" />
          </li>
          <li>
            <Confirm tag="[CONFIRM standard deliverables beyond a shipped app from a locked PRD]" />
          </li>
        </ul>

        <Link href="/contact?interest=custom#contact" className={cta}>
          Discuss a Custom Build
        </Link>
      </section>
    </>
  );
}
