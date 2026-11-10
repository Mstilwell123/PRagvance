import type { Metadata } from "next";
import Link from "next/link";
import { PRICING, PRODUCT_PAGES } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import StartHereLink from "@/components/StartHereLink";
import CheckoutButton from "@/components/CheckoutButton";
import { checkoutEnabled, type ProductKey } from "@/lib/checkout/products";

const DESC = "A quick summary of Pragvance offerings: AI Workforce, Shadow Lab, consultation, and Done-for-You setup.";

export const metadata: Metadata = {
  title: { absolute: "Summary | Pragvance.ai" },
  description: DESC,
  alternates: { canonical: "/summary" },
};

const card =
  "flex flex-col rounded-2xl border border-[#d6ac55]/40 bg-gradient-to-b from-[#071321] to-[#000d1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]";
const btn =
  "mt-auto flex w-full items-center justify-center rounded-lg border border-[#d6ac55]/70 px-5 py-3 text-sm font-semibold text-[#e8bd63] hover:bg-[#d6ac55]/10";

const OFFERS: { name: string; price: string; text: string; href: string; cta: string; page: string; ext?: boolean; product?: ProductKey }[] = [
  { name: "AI Workforce", price: `${PRICING.aiWorkforce.amount}/month`, text: "Weekly training, practical resources, and a Skool community to help you build a Grok Bot agent team for your own business.", href: SITE.skoolUrl, cta: "Join AI Workforce", page: PRODUCT_PAGES.aiWorkforce, ext: true },
  { name: "Shadow Lab", price: "See pricing", text: "Live coaching for founders who want closer guidance than the AI Workforce classroom.", href: "/contact?interest=shadow-lab#contact", cta: "Discuss Shadow Lab", page: PRODUCT_PAGES.shadowLab, product: "shadow_lab_group" },
  { name: "One-on-One AI Consultation", price: `${PRICING.consultation.amount} / session`, text: "60 minutes, one-on-one by video. Focused on your business priorities and questions.", href: "/contact?interest=consultation#contact", cta: "Request a Consultation", page: PRODUCT_PAGES.consultation, product: "consulting_1hr" },
  { name: "Done-for-You Complete Setup", price: `${PRICING.doneForYou.setup} + ${PRICING.doneForYou.support}/month`, text: "A defined setup for your business, with the implementation scope, handover, and support terms agreed before work begins. The $2,500 deposit is non-refundable.", href: "https://buy.stripe.com/28E8wJ7D91iv3UlbJP9MY03", cta: "Pay $2,500 Deposit", page: PRODUCT_PAGES.doneForYou, ext: true },
];

export default function SummaryPage() {
  const live = checkoutEnabled();
  return (
    <section className="section-pad mx-auto max-w-7xl py-12 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Summary</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">Everything Pragvance offers</h1>
      <p className="mt-4 max-w-3xl text-[color:var(--text-muted)] md:text-lg">Choose the level of help that fits your needs. Full details are on the <Link href="/pricing" className="text-[#e8bd63] hover:underline">pricing page</Link>.</p>
      <div className="mt-10 grid grid-cols-1 gap-6 min-[801px]:grid-cols-2 min-[1121px]:grid-cols-4">
        {OFFERS.map((o) => (
          <article key={o.name} className={card}>
            <h2 className="text-xl font-semibold text-[color:var(--text)]">{o.name}</h2>
            <p className="mt-3 text-2xl font-bold text-[#e8bd63]">{o.price}</p>
            <p className="mb-6 mt-3 text-sm text-[color:var(--text-muted)]">{o.text}</p>
            {live && o.product ? (
              <CheckoutButton product={o.product} fallbackHref={o.href} className={btn}>{o.cta}</CheckoutButton>
            ) : o.ext ? (
              <a href={o.href} target="_blank" rel="noopener noreferrer" className={btn}>{o.cta}</a>
            ) : (
              <Link href={o.href} className={btn}>{o.cta}</Link>
            )}
            <StartHereLink href={o.page} label={o.name} />
          </article>
        ))}
      </div>
    </section>
  );
}
