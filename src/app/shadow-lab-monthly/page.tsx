import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import CheckoutButton from "@/components/CheckoutButton";
import { OFFERS, SITE } from "@/lib/site";

const offer = OFFERS.shadow_lab_monthly;

export const metadata: Metadata = {
  title: "Shadow Lab Monthly — $997/mo · 60 min 1:1 | Pragvance",
  description:
    "Shadow Lab Monthly: $997/mo · 1:1 Google Meet working session (60 min). Pay first, then book your time.",
  alternates: { canonical: "/shadow-lab-monthly" },
  openGraph: {
    title: "Shadow Lab Monthly — $997/mo",
    description: "1:1 working session · 60 min Google Meet. Pay first — book after payment.",
    url: "/shadow-lab-monthly",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const faqs = [
  {
    q: "What’s included in Lab Monthly?",
    a: "A 60-minute 1:1 Google Meet working session each month — closer coaching to staff your agent department and ship real work with Grok Bot as guide and builder.",
  },
  {
    q: "How do I book after I pay?",
    a: "Pay first on this page. After checkout you’ll confirm payment and pick a time — booking handoff is after paid verify.",
  },
  {
    q: "How is this different from Group Training?",
    a: "Monthly is ongoing 1:1 at $997/mo · 60 min. Group Training is a $497 one-time multi-person session (max 10 · 120 min).",
  },
];

export default function ShadowLabMonthlyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shadow Lab", path: "/shadow-lab" },
          { name: "Lab Monthly", path: "/shadow-lab-monthly" },
        ]}
      />
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">
          Shadow Lab · Monthly
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Lab Monthly
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[color:var(--electric-bright)]">
          {offer.priceLabel}
        </p>
        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>
            Ongoing closer coaching in a 60-minute 1:1 Google Meet working session each month —
            staff your agent department, ship real work with Grok Bot as guide and builder.
          </p>
          <p>
            Pay first. After checkout you’ll confirm payment and pick a time — booking handoff is
            after paid verify.
          </p>
        </div>
        <ul className="panel mt-8 space-y-2 p-5 text-sm text-[color:var(--text-muted)]">
          <li>1:1 Google Meet</li>
          <li>60 min per session</li>
          <li>$997/mo</li>
        </ul>
        <div className="mt-10">
          <CheckoutButton offerId={offer.id} label={offer.cta} variant="electric" />
        </div>

        <div className="mt-14 space-y-4">
          <h2 className="text-lg font-semibold text-[color:var(--gold-bright)]">FAQ</h2>
          {faqs.map((item) => (
            <details key={item.q} className="panel group open:gold-glow px-5 py-4">
              <summary className="cursor-pointer list-none font-medium text-[color:var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="text-[color:var(--electric-bright)] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-sm text-[color:var(--text-muted)]">
          <Link href="/shadow-lab" className="text-[color:var(--electric-bright)] hover:underline">
            ← Compare Shadow Lab options
          </Link>
          {" · "}
          Prefer a group session?{" "}
          <Link
            href="/shadow-lab-group"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Group Training — {SITE.labSeat}
          </Link>
          {" · "}
          <Link href="/consulting" className="text-[color:var(--electric-bright)] hover:underline">
            Consulting — {SITE.consultingPrice}
          </Link>
        </p>
      </section>
    </>
  );
}
