import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import CheckoutButton from "@/components/CheckoutButton";
import { OFFERS, SITE } from "@/lib/site";

const offer = OFFERS.shadow_lab_group;

export const metadata: Metadata = {
  title: "Shadow Lab Group Training — $497 · 120 min | Pragvance",
  description:
    "Group Training: $497 one-time · up to 10 on Google Meet · 120 min. Interactive multi-person training with Grok Bot. Pay first, then book.",
  alternates: { canonical: "/shadow-lab-group" },
  openGraph: {
    title: "Shadow Lab Group Training — $497",
    description: "Up to 10 on Google Meet · 120 min. Pay first — book after payment.",
    url: "/shadow-lab-group",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const faqs = [
  {
    q: "What’s included in Group Training?",
    a: "A 120-minute interactive Google Meet session (max 10) covering agent swarm, building a business with AI, and using Grok Bot as your business guide and builder.",
  },
  {
    q: "How do I book after I pay?",
    a: "Pay first on this page. After checkout you’ll confirm payment and pick a time — booking handoff is after paid verify. We don’t invent Calendly links on this page.",
  },
  {
    q: "Is this the same as Shadow Lab Monthly?",
    a: "No. Group Training is $497 one-time, multi-person, 120 min. Monthly is $997/mo for a 60-min 1:1 working session.",
  },
];

export default function ShadowLabGroupPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shadow Lab", path: "/shadow-lab" },
          { name: "Group Training", path: "/shadow-lab-group" },
        ]}
      />
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--gold)]">
          Shadow Lab · Group
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Group Training
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[color:var(--gold-bright)]">
          {offer.priceLabel}{" "}
          <span className="text-base font-medium text-[color:var(--text-muted)]">one-time</span>
        </p>
        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>
            Interactive multi-person training — agent swarm, building a business with AI, and Grok
            Bot as your business guide and builder. You’re in the room with others (max 10) on
            Google Meet for a full 120 minutes.
          </p>
          <p>
            Pay first. After checkout you’ll confirm payment and pick a time — no invented booking
            link on this page.
          </p>
        </div>
        <ul className="panel mt-8 space-y-2 p-5 text-sm text-[color:var(--text-muted)]">
          <li>Max 10 participants · Google Meet</li>
          <li>120 min live session</li>
          <li>$497 one-time</li>
        </ul>
        <div className="mt-10">
          <CheckoutButton offerId={offer.id} label={offer.cta} variant="gold" />
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
          Prefer 1:1 monthly?{" "}
          <Link
            href="/shadow-lab-monthly"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Lab Monthly — {SITE.labMonth}
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
