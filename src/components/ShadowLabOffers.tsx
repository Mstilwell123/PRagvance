import Link from "next/link";
import { PRICING } from "@/lib/pricing";

const SESSION_LINK = process.env.NEXT_PUBLIC_SHADOW_LAB_PAYMENT_LINK || "";
const MONTHLY_LINK = process.env.NEXT_PUBLIC_SHADOW_LAB_MONTHLY_PAYMENT_LINK || "";
export const CALENDLY = "https://calendly.com/pragvance/30min";

type Offer = {
  name: string;
  sub: string;
  price: string;
  unit: string;
  badge: string;
  savings?: string;
  comparison?: string;
  link: string;
  payCta: string;
  points: string[];
};

const OFFERS: Offer[] = [
  {
    name: "Shadow Lab — Single Session",
    sub: "One two-hour session · Live on Google Meet · Date to be announced",
    price: PRICING.shadowLabSingle.amount,
    unit: "for one two-hour session",
    badge: "Up to 10 seats",
    link: SESSION_LINK,
    payCta: "Test checkout — $497",
    points: [
      "One live two-hour group session on Google Meet",
      "Build your own AI agent hands-on, with Mark and Grok Bot guiding you",
      "Q&A at the end",
      "Recording + recap doc afterward",
    ],
  },
  {
    name: "Shadow Lab — Monthly Package",
    sub: "Four two-hour sessions per month · Google Meet",
    price: PRICING.shadowLabMonthly.amount,
    unit: "/month for four two-hour sessions (eight hours total)",
    badge: "4 × 2 hours / month",
    savings: PRICING.shadowLabMonthly.savings,
    comparison: `Compared with ${PRICING.shadowLabMonthly.comparison} for four individual sessions`,
    link: MONTHLY_LINK,
    payCta: "Test checkout — $997/month",
    points: [
      "Four live two-hour sessions a month on Google Meet (eight hours total)",
      "Keep building with AI helpers, with Mark and Grok Bot guiding you",
      "Ask questions as you build, plus Q&A at the end",
      "Recording + recap doc after every session",
    ],
  },
];

function OfferCard({ o }: { o: Offer }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#d6ac55]/50 bg-[#071321] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--text)]">{o.name}</h3>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">{o.sub}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#d6ac55]/60 px-3 py-1 text-xs font-semibold text-[#e8bd63]">
          {o.badge}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-5xl font-bold text-[#e8bd63]">{o.price}</span>
        <span className="text-sm text-[color:var(--text-muted)]">{o.unit}</span>
      </div>
      {o.savings && (
        <p className="mt-2 text-sm font-semibold text-[#f3cd7d]">
          {o.savings}
          <span className="block text-xs font-normal text-[color:var(--text-muted)]">{o.comparison}</span>
        </p>
      )}
      <ul className="mt-6 flex-1 space-y-3 text-sm text-[color:var(--text)]">
        {o.points.map((p) => (
          <li key={p} className="flex gap-3">
            <span aria-hidden className="mt-0.5 text-[#e8bd63]">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link
          href="/contact?interest=shadow-lab#contact"
          className="flex w-full items-center justify-center rounded-lg bg-[#e8bd63] px-6 py-4 text-base font-bold text-[#08111d] hover:bg-[#f3cd7d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f4f1]"
        >
          Discuss Shadow Lab
        </Link>
        {o.link && (
          <>
            <a
              href={o.link}
              className="mt-3 flex w-full items-center justify-center rounded-lg border border-[#d6ac55]/60 px-6 py-3 text-sm font-semibold text-[#e8bd63] hover:bg-[#d6ac55]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f4f1]"
            >
              {o.payCta}
            </a>
            <p className="mt-2 text-center text-xs text-[color:var(--text-muted)]">
              All sales are final. No refunds. · Secure checkout by Stripe
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShadowLabOffers() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {OFFERS.map((o) => (
        <OfferCard key={o.name} o={o} />
      ))}
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "1", t: "Discuss", d: "Tell us what you want to build through the contact page." },
    { n: "2", t: "Pick your option", d: "Single two-hour session or the monthly package of four two-hour sessions." },
    { n: "3", t: "Confirmation", d: "Get your confirmation and Google Meet details by email." },
  ];
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((s) => (
        <li key={s.n} className="rounded-xl border border-[color:var(--line)] bg-[#06111d] p-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8bd63] text-sm font-bold text-[#08111d]">
            {s.n}
          </span>
          <p className="mt-3 font-semibold text-[color:var(--text)]">{s.t}</p>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function FooterNotes() {
  return (
    <>
      <p className="mt-10 text-center text-sm text-[color:var(--text-muted)]">
        Already paid?{" "}
        <a href={CALENDLY} className="font-semibold text-[#f3cd7d] hover:underline">
          Book your session
        </a>{" "}
        · Questions?{" "}
        <Link href="/contact?interest=shadow-lab#contact" className="font-semibold text-[#f3cd7d] hover:underline">
          Contact us
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-[color:var(--text-muted)] opacity-80">
        Came from TikTok? DM AGENT for the link.
      </p>
    </>
  );
}
