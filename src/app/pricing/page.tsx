import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

const PAYMENT_LINK = process.env.NEXT_PUBLIC_SHADOW_LAB_PAYMENT_LINK || "";
const CALENDLY = "https://calendly.com/pragvance/30min";

export const metadata: Metadata = {
  title: "Pricing — Shadow Lab Session 1 | Pragvance",
  description: "Shadow Lab Session 1: a 10-seat live Zoom lab. $497 per seat.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Shadow Lab Session 1",
    description: "A 10-seat live Zoom lab. $497 per seat.",
    url: "/pricing",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const INCLUDED = [
  "Live session on Zoom — build alongside, not watch a replay",
  "Capped at 10 seats so every founder gets hands-on time",
  "Bring a real problem from your business and leave with a working AI helper",
  "Pick your session time on Calendly right after checkout",
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
      <section className="section-pad mx-auto max-w-xl py-12 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">
          Pricing
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-4xl">
          One live lab. Ten seats.
        </h1>
        <p className="mt-3 text-[color:var(--text-muted)]">
          Shadow Lab is hands-on, live coaching for founders who want to put AI to work on their
          real business — fast.
        </p>

        <div className="mt-8 rounded-2xl border border-[#d6ac55]/50 bg-[#071321] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--text)]">Shadow Lab Session 1</h2>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">10-seat live Zoom lab</p>
            </div>
            <span className="shrink-0 rounded-full border border-[#d6ac55]/60 px-3 py-1 text-xs font-semibold text-[#e8bd63]">
              10 seats
            </span>
          </div>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-[#e8bd63]">$497</span>
            <span className="text-sm text-[color:var(--text-muted)]">per seat · one-time</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[color:var(--text)]">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-0.5 text-[#e8bd63]">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <ol className="mt-8 space-y-3">
            <li>
              {PAYMENT_LINK ? (
                <a
                  href={PAYMENT_LINK}
                  className="flex w-full items-center justify-center rounded-lg bg-[#e8bd63] px-6 py-4 text-base font-bold text-[#08111d] hover:bg-[#f3cd7d]"
                  data-testid="pay-button"
                >
                  1. Reserve your seat — $497
                </a>
              ) : (
                <span className="flex w-full items-center justify-center rounded-lg border border-[#d6ac55]/40 px-6 py-4 text-base text-[color:var(--text-muted)]">
                  Checkout opening soon
                </span>
              )}
            </li>
            <li>
              <a
                href={CALENDLY}
                className="flex w-full items-center justify-center rounded-lg border border-[#d6ac55]/70 px-6 py-4 text-base font-semibold text-[#f3cd7d] hover:bg-[#d6ac55]/10"
              >
                2. Book your session →
              </a>
              <p className="mt-2 text-center text-xs text-[color:var(--text-muted)]">
                After payment you&apos;ll land on Calendly automatically to pick your time.
              </p>
            </li>
          </ol>
          <p className="mt-6 text-center text-xs text-[color:var(--text-muted)]">
            Secure checkout by Stripe.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-[color:var(--text-muted)]">
          Questions?{" "}
          <a href={CALENDLY} className="font-semibold text-[#f3cd7d] hover:underline">
            Book a call
          </a>
        </p>
        <p className="mt-3 text-center text-xs text-[color:var(--text-muted)] opacity-80">
          Came from TikTok? DM AGENT for the link.
        </p>
      </section>
    </>
  );
}
