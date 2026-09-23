import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import CheckoutButton from "@/components/CheckoutButton";
import { OFFERS, SITE } from "@/lib/site";

const offer = OFFERS.consulting_1hr;

export const metadata: Metadata = {
  title: "Consulting — $100/hr · 60 min 1:1 | Pragvance",
  description:
    "Focused consulting: $100/hr · 60 min 1:1 Google Meet. Pay first on this page, then pick a time after payment.",
  alternates: { canonical: "/consulting" },
  openGraph: {
    title: "Consulting — $100/hr · 60 min 1:1",
    description: "Pay first — booking after payment. support@pragvance.ai for support.",
    url: "/consulting",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const faqs = [
  {
    q: "What do we cover in the hour?",
    a: "Strategy, agent staffing, or your next AI build — practical guidance to unblock the next step. Not a sales pitch.",
  },
  {
    q: "How does booking work?",
    a: "Pay $100 first on this page. After successful payment you’ll land on a booking handoff to pick a time. Support and non-booking questions go to support@pragvance.ai.",
  },
];

export default function ConsultingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Consulting", path: "/consulting" },
        ]}
      />
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--gold)]">1:1 session</p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Consulting
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[color:var(--gold-bright)]">
          {offer.priceLabel}/hr{" "}
          <span className="text-base font-medium text-[color:var(--text-muted)]">
            · 60 min 1:1
          </span>
        </p>
        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>
            A focused hour to unblock strategy, agent staffing, or your next AI build — practical
            guidance, not a sales pitch. One clear offer: $100/hr · 60 min 1:1. Pay first, then
            schedule.
          </p>
          <p>
            After successful payment you’ll land on a booking handoff to pick a time. Support and
            non-booking questions:{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-[color:var(--electric-bright)] hover:underline"
            >
              {SITE.email}
            </a>
            .
          </p>
        </div>
        <ul className="panel mt-8 space-y-2 p-5 text-sm text-[color:var(--text-muted)]">
          <li>$100/hr · one-time</li>
          <li>60 min · 1:1</li>
          <li>Pay first → pick a time after payment</li>
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
          Want multi-person Lab training or monthly coaching?{" "}
          <Link
            href="/shadow-lab-group"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Group Training
          </Link>
          {" · "}
          <Link
            href="/shadow-lab-monthly"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Lab Monthly
          </Link>
          {" · "}
          <Link href="/shadow-lab" className="text-[color:var(--electric-bright)] hover:underline">
            Compare
          </Link>
          .
        </p>
      </section>
    </>
  );
}
