const SESSION_LINK = process.env.NEXT_PUBLIC_SHADOW_LAB_PAYMENT_LINK || "";
const MONTHLY_LINK = process.env.NEXT_PUBLIC_SHADOW_LAB_MONTHLY_PAYMENT_LINK || "";
export const CALENDLY = "https://calendly.com/pragvance/30min";

type Offer = {
  name: string;
  sub: string;
  price: string;
  unit: string;
  badge: string;
  link: string;
  cta: string;
  points: string[];
};

const OFFERS: Offer[] = [
  {
    name: "Shadow Lab Session 1",
    sub: "Basic AI agent building · Date to be announced",
    price: "$497",
    unit: "one-time",
    badge: "Up to 10 seats",
    link: SESSION_LINK,
    cta: "Reserve your seat — $497",
    points: [
      "One live 2-hour (120 min) group session on Google Meet",
      "Build your own AI agent hands-on, with Mark and Grok Bot guiding you",
      "Q&A at the end (last ~12 minutes)",
      "Recording + recap doc afterward",
    ],
  },
  {
    name: "Shadow Lab Monthly",
    sub: "Ongoing live labs · Google Meet",
    price: "$997",
    unit: "per month",
    badge: "4 meetings / month",
    link: MONTHLY_LINK,
    cta: "Start monthly — $997/mo",
    points: [
      "Four live meetings a month on Google Meet",
      "Keep building with AI helpers, with Mark and Grok Bot guiding you",
      "Ask questions as you build, plus Q&A at the end",
      "Recording + recap doc after every meeting",
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
      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-[#e8bd63]">{o.price}</span>
        <span className="text-sm text-[color:var(--text-muted)]">{o.unit}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-3 text-sm text-[color:var(--text)]">
        {o.points.map((p) => (
          <li key={p} className="flex gap-3">
            <span aria-hidden className="mt-0.5 text-[#e8bd63]">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        {o.link ? (
          <a
            href={o.link}
            className="flex w-full items-center justify-center rounded-lg bg-[#e8bd63] px-6 py-4 text-base font-bold text-[#08111d] hover:bg-[#f3cd7d]"
          >
            {o.cta}
          </a>
        ) : (
          <span className="flex w-full items-center justify-center rounded-lg border border-[#d6ac55]/40 px-6 py-4 text-base text-[color:var(--text-muted)]">
            Checkout opening soon
          </span>
        )}
        <p className="mt-3 text-center text-xs text-[color:var(--text-muted)]">
          All sales are final. No refunds. · Secure checkout by Stripe
        </p>
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
    { n: "1", t: "Pay", d: "Reserve your seat with secure Stripe checkout." },
    { n: "2", t: "Book in Calendly", d: "You land on Calendly right after payment to book your time." },
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
        <a href={CALENDLY} className="font-semibold text-[#f3cd7d] hover:underline">
          Book a call
        </a>
      </p>
      <p className="mt-3 text-center text-xs text-[color:var(--text-muted)] opacity-80">
        Came from TikTok? DM AGENT for the link.
      </p>
    </>
  );
}
