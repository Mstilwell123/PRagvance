import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import CrowPurchase from "@/components/crow/CrowPurchase";
import { CROW_CTA, CROW_SECTIONS, crowDraftSurfaceEnabled, crowPriceLabel, localPreviewAllowed } from "@/lib/crow/product";

export const metadata: Metadata = {
  title: { absolute: "CROW Template (draft) | Pragvance" },
  description:
    "Draft. A licensed operating-card template you adapt for your own AI revenue agent. Live checkout is disabled. Not a hosted agent, training service, or income promise.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  alternates: {},
  openGraph: {
    title: "CROW Template (draft)",
    description: "Draft page. Live checkout is disabled.",
    url: "/crow-template",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
  twitter: {
    card: "summary",
    title: "CROW Template (draft)",
    description: "Draft page. Live checkout is disabled.",
  },
};

const NOT_INCLUDED = [
  "A hosted AI agent that runs for you",
  "A training service",
  "A promise of revenue or income",
  "Hosted access or ongoing support",
];

export default async function CrowTemplatePage() {
  await connection();
  if (!crowDraftSurfaceEnabled()) notFound();
  const price = crowPriceLabel();

  return (
    <article className="section-pad mx-auto max-w-5xl py-12 md:py-20">
      <p className="rounded-xl border border-[color:var(--line)] bg-[#06111d] px-4 py-3 text-sm text-[color:var(--text)]" role="status">
        <strong className="font-semibold text-[color:var(--gold-bright)]">Draft / test.</strong> This page is not a live offer. LIVE CHECKOUT DISABLED until approval. No charge can be created here. This route is not in the site menu.
      </p>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">CROW Template · Draft</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">Give your AI revenue agent a clear job.</h1>
      <p className="mt-4 max-w-2xl text-[color:var(--text-muted)] md:text-lg">
        CROW Template is a licensed Chief Revenue Officer operating card. You download a Markdown file and adapt it for your own AI agent. It is a document you edit, not a hosted agent, a training service, or a promise of income.
      </p>

      <section className="mt-10 rounded-2xl border border-[#d6ac55]/40 bg-gradient-to-b from-[#071321] to-[#000d1a] p-6" aria-labelledby="crow-download-heading">
        <h2 id="crow-download-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
          The download
        </h2>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-4xl font-bold text-[#e8bd63]">{price}</span>
          <span className="text-sm text-[color:var(--text-muted)]">one time</span>
        </p>
        <p className="mt-2 max-w-xl text-sm text-[color:var(--text-muted)]">
          Price confirmed by Mark on November 8, 2026. The amount is fixed on the server. This page does not accept a price from the browser, and the button does not open checkout.
        </p>
        <CrowPurchase cta={CROW_CTA} preview={localPreviewAllowed()} />
      </section>

      <section className="mt-14" aria-labelledby="crow-scope-heading">
        <h2 id="crow-scope-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
          What you are buying
        </h2>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          One Markdown operating card with placeholders for the owner name, company, revenue target, and team-role titles. You replace those before use. The file is delivered only after a real paid result and a verified customer match. A success page or a browser flag is not enough.
        </p>
        <h3 className="mt-8 text-lg font-semibold text-[color:var(--text)]">Not included</h3>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--text)]">
          {NOT_INCLUDED.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="text-[#e8bd63]">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="crow-sections-heading">
        <h2 id="crow-sections-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
          Included sections
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-[color:var(--text-muted)]">All 10 sections are in the downloadable file.</p>
        <ol className="mt-6 grid list-decimal gap-4 pl-5 sm:grid-cols-2">
          {CROW_SECTIONS.map((section) => (
            <li key={section.name} className="rounded-xl border border-[color:var(--line)] bg-[#06111d] p-5 marker:font-semibold marker:text-[#e8bd63]">
              <p className="font-semibold text-[color:var(--text)]">{section.name}</p>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">{section.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel mt-14 p-6" aria-labelledby="crow-terms-heading">
        <h2 id="crow-terms-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
          Proposed terms — pending approval
        </h2>
        <p className="mt-4 text-sm text-[color:var(--text)]">
          These points are a draft for review. They are not a final license, refund policy, or support agreement. Showing them here is not permission to sell or charge.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
          <li>Single-business internal use. The licensee may adapt this operating card for their own AI agents.</li>
          <li>No resale or redistribution of the template.</li>
          <li>No hosted agent, hosted access, or support is included.</li>
          <li>How long a license lasts, whether later edits to the template are included, and the refund terms are still open.</li>
          <li>The price shown is {price} one time. Checkout on this page stays disabled until that draft is approved.</li>
        </ul>
      </section>
    </article>
  );
}
