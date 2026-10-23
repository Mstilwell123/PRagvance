import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ShadowLabSwitch from "@/components/pricing/ShadowLabSwitch";
import { PRICING, PRODUCTS } from "@/lib/pricing";
import { SITE } from "@/lib/site";

const DESC =
  "Compare AI Workforce training, Shadow Lab coaching, Done-for-You setup, and custom app development.";

export const metadata: Metadata = {
  title: { absolute: "Pricing | Pragvance.ai" },
  description: DESC,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Pragvance.ai",
    description: DESC,
    url: "/pricing",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const card =
  "flex flex-col rounded-2xl border border-[#d6ac55]/40 bg-gradient-to-b from-[#071321] to-[#000d1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]";
const primaryBtn =
  "mt-auto flex w-full items-center justify-center rounded-lg bg-[#e8bd63] px-5 py-3 text-sm font-bold text-[#08111d] hover:bg-[#f3cd7d]";
const secondaryBtn =
  "mt-auto flex w-full items-center justify-center rounded-lg border border-[#d6ac55]/70 px-5 py-3 text-sm font-semibold text-[#e8bd63] hover:bg-[#d6ac55]/10";
const group = "text-xs font-medium uppercase tracking-[0.18em] text-[#d0a256]";

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mb-6 mt-5 space-y-2 text-sm text-[color:var(--text)]">
      {items.map((p) => (
        <li key={p} className="flex gap-2">
          <span aria-hidden className="text-[#e8bd63]">✓</span>
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

const FAQ = [
  {
    q: "What is included in the AI Workforce?",
    a: "AI Workforce is $99/month on Skool: weekly training, practical resources, and a community to help you build a GrokBot agent team for your own business. It teaches you to build; it does not include private consulting or custom build work.",
  },
  {
    q: "How is Shadow Lab different?",
    a: "Shadow Lab is live coaching for founders who want closer guidance than the AI Workforce classroom. It is $497 for one two-hour session, or $997/month for four two-hour sessions (eight hours total).",
  },
  {
    q: "What does Done-for-You mean?",
    a: "Done-for-You is an agreed implementation of a defined setup for your business. The implementation scope, handover, and support terms are agreed before work begins.",
  },
  {
    q: "Is monthly support additional to setup?",
    a: "Yes. Done-for-You is $4,999 one-time setup plus $500/month support. Support terms are confirmed with you before purchase.",
  },
  {
    q: "Are software subscriptions included?",
    a: "Not unless confirmed in writing. Required third-party software and usage costs may be separate; we identify the actual inclusions and costs with you before purchase.",
  },
  {
    q: "Can you build a company-specific app?",
    a: "Yes. Custom apps and SaaS are quoted separately. Scope and pricing are agreed before development.",
  },
  {
    q: "Where do I find product subscription prices?",
    a: "Each product — MinutesIntel.ai, App N SaaS Builder, and My Briefing — lists its own plans on its own website. Product subscriptions are not included in the AI Workforce membership, setup fee, or support plan.",
  },
];

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <section className="section-pad mx-auto max-w-7xl py-12 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Pricing</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">
          Choose how you want to build with AI
        </h1>
        <p className="mt-4 max-w-3xl text-[color:var(--text-muted)] md:text-lg">
          Learn to build your AI workforce, get closer guidance, or discuss a complete setup for your
          business. Choose the level of help that fits your needs.
        </p>

        <h2 className="sr-only">Plans</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 min-[801px]:grid-cols-2 min-[1121px]:grid-cols-4">
          {/* 1. AI Workforce — primary emphasis */}
          <article className={`${card} border-[#e8bd63] ring-1 ring-[#e8bd63]/60`} aria-labelledby="p-aiw">
            <p className={group}>Learn and build</p>
            <span className="mt-2 w-fit rounded-full bg-[#e8bd63] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#08111d]">
              Start here
            </span>
            <h3 id="p-aiw" className="mt-3 text-xl font-semibold text-[color:var(--text)]">AI Workforce</h3>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#e8bd63]">{PRICING.aiWorkforce.amount}</span>
              <span className="text-sm text-[color:var(--text-muted)]">/month</span>
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Weekly training, practical resources, and a Skool community to help you build a GrokBot
              agent team for your own business.
            </p>
            <Points items={["Weekly training", "Practical resources", "Skool community"]} />
            <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
              Join AI Workforce
            </a>
          </article>

          {/* 2. Shadow Lab */}
          <article className={card} aria-labelledby="p-lab">
            <p className={group}>Get closer guidance</p>
            <h3 id="p-lab" className="mt-2 text-xl font-semibold text-[color:var(--text)]">Shadow Lab</h3>
            <p className="mb-4 mt-2 text-sm text-[color:var(--text-muted)]">
              Live coaching for founders who want closer guidance than the AI Workforce classroom.
            </p>
            <ShadowLabSwitch />
            <div className="mt-6 flex flex-1 flex-col">
              <Link href="/contact" className={secondaryBtn}>Discuss Shadow Lab</Link>
            </div>
          </article>

          {/* 3. Done-for-You */}
          <article className={card} aria-labelledby="p-dfy">
            <p className={group}>Have the setup implemented</p>
            <h3 id="p-dfy" className="mt-2 text-xl font-semibold text-[color:var(--text)]">Done-for-You Complete Setup</h3>
            <div className="mt-4 space-y-1">
              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#e8bd63]">{PRICING.doneForYou.setup}</span>
                <span className="text-sm text-[color:var(--text-muted)]">one-time setup</span>
              </p>
              <p className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-muted)]">plus</span>
                <span className="text-2xl font-bold text-[#e8bd63]">{PRICING.doneForYou.support}</span>
                <span className="text-sm text-[color:var(--text-muted)]">/month support</span>
              </p>
            </div>
            <p className="mb-6 mt-3 text-sm text-[color:var(--text-muted)]">
              A defined setup for your business, with the implementation scope, handover, and support
              terms agreed before work begins.
            </p>
            <Link href="/contact" className={secondaryBtn}>Request Done-for-You Setup</Link>
          </article>

          {/* 4. One-on-One AI Consultation */}
          <article className={card} aria-labelledby="p-con">
            <p className={group}>One-on-one guidance</p>
            <h3 id="p-con" className="mt-2 text-xl font-semibold text-[color:var(--text)]">One-on-One AI Consultation</h3>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#e8bd63]">{PRICING.consultation.amount}</span>
              <span className="text-sm text-[color:var(--text-muted)]">/ session</span>
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">60 minutes · one-on-one by video</p>
            <p className="mb-6 mt-3 text-sm text-[color:var(--text-muted)]">
              One-on-one guidance. Focused on your business priorities and questions.
            </p>
            <Link href="/contact" className={secondaryBtn}>Request a Consultation</Link>
          </article>
        </div>

        <p className="mt-6 text-sm text-[color:var(--text-muted)]">
          AI Workforce teaches you to build. Shadow Lab adds closer live coaching. Done-for-You is an
          agreed implementation. Custom apps are quoted separately. Required third-party software and
          usage costs may be separate — we identify actual inclusions and costs before purchase.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className={card} aria-labelledby="p-custom">
            <p className={group}>Need a company-specific app or SaaS?</p>
            <h2 id="p-custom" className="mt-2 text-xl font-semibold text-[color:var(--text)]">Custom app / SaaS development</h2>
            <p className="mt-3 text-3xl font-bold text-[#e8bd63]">{PRICING.custom.label}</p>
            <p className="mb-6 mt-3 text-sm text-[color:var(--text-muted)]">
              Discuss software built around your company&apos;s requirements. Scope and pricing are
              agreed before development.
            </p>
            <Link href="/contact" className={secondaryBtn}>Discuss a Custom Build</Link>
          </article>
          <article className={card} aria-labelledby="p-assess">
            <p className={group}>Lower-commitment next step</p>
            <h2 id="p-assess" className="mt-2 text-xl font-semibold text-[color:var(--text)]">Free AI Assessment</h2>
            <p className="mt-3 text-3xl font-bold text-[#e8bd63]">Free</p>
            <p className="mb-6 mt-3 text-sm text-[color:var(--text-muted)]">
              A free diagnostic to see where AI fits your business. No fee, not a paid plan.
            </p>
            <Link href="/assessment" className={primaryBtn}>Take the AI Assessment</Link>
          </article>
        </div>

        <section aria-labelledby="p-products" className="mt-12 rounded-2xl border border-[color:var(--line)] p-6">
          <h2 id="p-products" className="text-lg font-semibold text-[color:var(--text)]">Product pricing directory</h2>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
            Standalone products list their own plans and prices on their websites. They are not
            included in the AI Workforce membership, setup fee, or support plan.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {PRODUCTS.map((p) => (
              <li key={p.name}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-[#d6ac55]/60 px-4 py-2 text-sm font-semibold text-[#e8bd63] hover:bg-[#d6ac55]/10"
                >
                  {p.name} — see pricing →
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="p-faq" className="mt-14">
          <h2 id="p-faq" className="text-2xl font-semibold text-[color:var(--gold-bright)]">Pricing questions</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-xl border border-[color:var(--line)] bg-[#06111d] p-5">
                <summary className="cursor-pointer font-semibold text-[color:var(--text)]">{f.q}</summary>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-[color:var(--text-muted)]">
            Other questions about terms? <Link href="/contact" className="text-[#f3cd7d] underline">Contact us</Link> before purchase.
          </p>
        </section>
      </section>
    </>
  );
}
