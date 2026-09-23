import type { Metadata } from "next";
import Link from "next/link";
import { isOfferId } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Access",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  canceled?: string;
  offer?: string;
}>;

/**
 * Cancel / access stub. Marketing CTAs on /shadow-lab stay untouched (Webster).
 */
export default async function AccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const canceled = params.canceled === "1";
  const offer = params.offer?.trim() || "";
  const offerLabel = isOfferId(offer) ? offer : null;

  return (
    <section className="section-pad mx-auto max-w-xl py-16 md:py-24">
      <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">
        Access
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text)] md:text-4xl">
        {canceled ? "Checkout canceled" : "Pay-first access"}
      </h1>
      <div className="mt-6 space-y-4 text-[color:var(--text-muted)]">
        {canceled ? (
          <p>
            You left Stripe Checkout without completing payment
            {offerLabel ? (
              <>
                {" "}
                for <code className="text-sm text-[color:var(--text)]">{offerLabel}</code>
              </>
            ) : null}
            . No charge was made.
          </p>
        ) : (
          <p>
            After a successful payment, Stripe redirects to the booking gate
            at <code className="text-sm">/access/book</code>. This page is the
            cancel / status stub only — marketing pages are unchanged.
          </p>
        )}
        <p>
          <Link href="/" className="text-[color:var(--electric-bright)] hover:underline">
            Return home
          </Link>
          {" · "}
          <Link
            href="/shadow-lab"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Shadow Lab (marketing)
          </Link>
        </p>
      </div>
    </section>
  );
}
