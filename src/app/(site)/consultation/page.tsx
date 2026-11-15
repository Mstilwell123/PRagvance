import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { PRICING } from "@/lib/pricing";
import { SITE } from "@/lib/site";

const PATH = "/consultation";

export const metadata: Metadata = {
  title: "One-on-One AI Consultation (preview)",
  description: `Preview of the Pragvance One-on-One AI Consultation: ${PRICING.consultation.amount} / session, ${PRICING.consultation.duration}, one-on-one by video. Pending approval. This page is not for indexing.`,
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
    title: "One-on-One AI Consultation (preview)",
    description: "Draft preview, pending approval.",
    url: PATH,
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const purchaseBtn =
  "inline-flex rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)] gold-glow";
const textLink = "text-[color:var(--electric-bright)] hover:underline";

function Confirm({ tag }: { tag: string }) {
  return <strong className="font-semibold text-[color:var(--gold-hot)]">{tag}</strong>;
}

export default function ConsultationPage() {
  return (
    <>
      <p className="bg-[color:var(--gold)] px-4 py-3 text-center text-sm font-semibold text-black">
        DRAFT preview, pending approval
      </p>
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--gold)]">One-on-one guidance</p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          One-on-One AI Consultation
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[color:var(--gold-bright)]">
          {PRICING.consultation.amount}
          <span className="text-base font-medium text-[color:var(--text-muted)]"> / session</span>
        </p>
        <p className="mt-2 text-[color:var(--text-muted)]">
          {PRICING.consultation.duration} · one-on-one by video
        </p>

        <div className="mt-8 max-w-xl">
          <CheckoutButton
            product="consulting_1hr"
            className={purchaseBtn}
            ariaLabel="Start Here: One-on-One AI Consultation"
          >
            Start Here
          </CheckoutButton>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
            Start Here opens secure checkout for the {PRICING.consultation.amount} one-on-one session. After
            payment, Pragvance takes you to book the 60-minute video consultation.
          </p>
          <a
            href={SITE.skoolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${textLink} mt-3 inline-block text-sm`}
          >
            Join AI Workforce
          </a>
        </div>

        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>One-on-one guidance. Focused on your business priorities and questions.</p>
          <p>
            The site checkout for this offer is a one-time payment named “One-on-One AI Consultation
            (60 min)”. It is not a monthly subscription. Current prices are on the{" "}
            <Link href="/pricing" className={textLink}>
              pricing page
            </Link>
            .
          </p>
          <p>
            The terms list this service as “One-on-One AI Consultation and automation consulting.”{" "}
            <Confirm tag="[CONFIRM whether automation consulting is this same session or a separate service]" />
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-semibold text-[color:var(--gold-bright)]">What is stated</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
          <li>Price: {PRICING.consultation.amount} / session</li>
          <li>Length: {PRICING.consultation.duration}</li>
          <li>Format: one-on-one by video</li>
          <li>Focus: your business priorities and questions</li>
        </ul>

        <h2 className="mt-12 text-2xl font-semibold text-[color:var(--gold-bright)]">How to request it</h2>
        <div className="mt-4 space-y-4 text-sm text-[color:var(--text-muted)]">
          <p>
            Start Here on this page opens secure checkout for the {PRICING.consultation.amount} one-time
            session. After payment, Pragvance takes you to book the 60-minute video consultation.
          </p>
          <p>
            Questions:{" "}
            <a href={`mailto:${SITE.email}`} className={textLink}>
              {SITE.email}
            </a>
            . {SITE.legal} · {SITE.location}.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-semibold text-[color:var(--gold-bright)]">Payment and refunds</h2>
        <div className="mt-4 space-y-4 text-sm text-[color:var(--text-muted)]">
          <p>
            Paid services are charged in U.S. dollars when you buy, through Stripe or the platform
            named at checkout. See the{" "}
            <Link href="/terms" className={textLink}>
              terms
            </Link>
            .
          </p>
          <p>
            The terms say that for services other than Shadow Lab and the Done-for-You deposit, refund
            requests are reviewed case by case unless a written agreement says otherwise. Email{" "}
            <a href={`mailto:${SITE.email}`} className={textLink}>
              {SITE.email}
            </a>
            . <Confirm tag="[CONFIRM the refund rule for this session]" />
          </p>
          <p>
            The terms describe cancellation for monthly subscriptions. They do not state a
            cancellation rule for this session.{" "}
            <Confirm tag="[CONFIRM how a booked session is rescheduled or canceled]" />
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-semibold text-[color:var(--gold-bright)]">Still to confirm</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
          <li>
            <Confirm tag="[CONFIRM who you meet]" />
          </li>
          <li>
            <Confirm tag="[CONFIRM which video platform]" />
          </li>
          <li>
            <Confirm tag="[CONFIRM the agenda, and what you leave with]" />
          </li>
          <li>
            <Confirm tag="[CONFIRM what to prepare]" />
          </li>
        </ul>

      </section>
    </>
  );
}
