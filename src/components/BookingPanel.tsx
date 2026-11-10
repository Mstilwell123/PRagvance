import Link from "next/link";
import type { BookingView } from "@/lib/checkout/paid";
import { SITE } from "@/lib/site";

const btn =
  "flex w-full items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-center text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]";

function mailtoFor(sessionId: string): string {
  const subject = encodeURIComponent("Schedule 60-minute consultation");
  const body = encodeURIComponent(`Checkout session: ${sessionId}`);
  return `mailto:${SITE.email}?subject=${subject}&body=${body}`;
}

export default function BookingPanel({ view }: { view: BookingView }) {
  if (view.state !== "confirmed") {
    return (
      <section className="section-pad mx-auto max-w-2xl py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Consultation</p>
        <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text)] md:text-5xl">Consultation booking</h1>
        <div className="panel mt-8 space-y-4 p-6">
          <p className="text-[color:var(--text-muted)]">We couldn&apos;t confirm a paid consultation for this link.</p>
          <p className="text-sm text-[color:var(--text-muted)]">
            Use the link from your checkout confirmation, or contact Pragvance.
          </p>
          <Link href="/contact" className={btn}>
            Contact Pragvance
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pad mx-auto max-w-2xl py-16 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Consultation</p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text)] md:text-5xl">Payment confirmed</h1>
      <div className="panel mt-8 space-y-6 p-6">
        <p className="text-[color:var(--text-muted)]">
          Your payment for <span className="text-[color:var(--text)]">{view.productName}</span> is confirmed.
        </p>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[color:var(--text-muted)]">Amount</dt>
            <dd className="text-lg font-semibold text-[#e8bd63]">{view.amountLabel}</dd>
          </div>
          <div>
            <dt className="text-[color:var(--text-muted)]">Email</dt>
            <dd className="text-[color:var(--text)]">{view.maskedEmail}</dd>
          </div>
        </dl>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[color:var(--text)]">Schedule your 60-minute session</h2>
          {view.bookingUrl ? (
            <a href={view.bookingUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={btn}>
              Schedule your session
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <p className="text-sm text-[color:var(--text-muted)]">
              Email{" "}
              <a href={mailtoFor(view.sessionId)} className="text-[color:var(--electric-bright)] hover:underline">
                {SITE.email}
              </a>{" "}
              to schedule your 60-minute session.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
