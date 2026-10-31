import type { Metadata } from "next";
import Link from "next/link";
import { resolveCalendlyBookingUrl } from "@/lib/calendly";
import { getOffer, isOfferId } from "@/lib/offers";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Book your session",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  session_id?: string;
  offer?: string;
}>;

/**
 * Pay-first booking gate: retrieve Checkout Session; require payment_status === 'paid'
 * before revealing Calendly. Uses env stubs only — never invents public URLs.
 */
export default async function AccessBookPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim() || "";
  const offerParam = params.offer?.trim() || "";

  if (!sessionId || !isOfferId(offerParam)) {
    return (
      <GateShell title="Missing checkout details">
        <p className="text-[color:var(--text-muted)]">
          Open this page from a completed Stripe Checkout redirect (session_id +
          offer required).
        </p>
        <BackLink />
      </GateShell>
    );
  }

  const offer = getOffer(offerParam);

  let paymentStatus: string | null = null;
  let retrieveError: string | null = null;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    paymentStatus = session.payment_status;

    const metaOffer = session.metadata?.offer_id;
    if (metaOffer && metaOffer !== offerParam) {
      return (
        <GateShell title="Offer mismatch">
          <p className="text-[color:var(--text-muted)]">
            This Checkout session does not match the requested offer.
          </p>
          <BackLink />
        </GateShell>
      );
    }
  } catch (err) {
    console.error("Failed to retrieve Checkout session:", err);
    retrieveError = "Could not verify payment session.";
  }

  if (retrieveError) {
    return (
      <GateShell title="Verification failed">
        <p className="text-[color:var(--text-muted)]">{retrieveError}</p>
        <BackLink />
      </GateShell>
    );
  }

  if (paymentStatus !== "paid") {
    return (
      <GateShell title="Payment required">
        <p className="text-[color:var(--text-muted)]">
          Booking opens only after Stripe reports{" "}
          <code className="text-sm">payment_status === &quot;paid&quot;</code>.
          Current status:{" "}
          <strong className="text-[color:var(--text)]">
            {paymentStatus ?? "unknown"}
          </strong>
          .
        </p>
        <BackLink />
      </GateShell>
    );
  }

  const bookingUrl = await resolveCalendlyBookingUrl(offerParam);

  return (
    <GateShell title="Payment confirmed">
      <p className="text-[color:var(--text-muted)]">
        You&apos;re paid for <strong className="text-[color:var(--text)]">{offer.label}</strong>{" "}
        ({offer.durationMin} min).
      </p>
      {bookingUrl ? (
        <p className="mt-6">
          <a
            href={bookingUrl}
            className="inline-flex rounded-md bg-[color:var(--electric)] px-5 py-3 font-medium text-white hover:opacity-90"
            rel="noopener noreferrer"
            target="_blank"
          >
            Book on Calendly
          </a>
        </p>
      ) : (
        <p className="mt-6 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-[color:var(--text-muted)]">
          Calendly not configured. Set{" "}
          <code className="text-sm">CALENDLY_API_TOKEN</code> + event URI, or the{" "}
          <code className="text-sm">CALENDLY_URL_*</code> fallback for this offer.
        </p>
      )}
      <BackLink />
    </GateShell>
  );
}

function GateShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-pad mx-auto max-w-xl py-16 md:py-24">
      <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">
        Access
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text)] md:text-4xl">
        {title}
      </h1>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function BackLink() {
  return (
    <p className="mt-8">
      <Link
        href="/access"
        className="text-[color:var(--electric-bright)] hover:underline"
      >
        Back to access
      </Link>
    </p>
  );
}
