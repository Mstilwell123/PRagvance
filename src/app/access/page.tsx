import type { Metadata } from "next";
import Link from "next/link";
import { OFFERS, isOfferId } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Access",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  canceled?: string;
  offer?: string;
}>;

/**
 * Non-public stub only (ROUTE LOCK). Not a public offer chooser.
 * Cancel returns to flat CTA slugs via Checkout cancel_url.
 * Keep /access/book as the post-pay gate.
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
  const cancelPath =
    offerLabel && isOfferId(offerLabel) ? OFFERS[offerLabel].cancelPath : null;

  return (
    <section className="section-pad mx-auto max-w-xl py-16 md:py-24">
      <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">
        Access
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text)] md:text-4xl">
        {canceled ? "Checkout canceled" : "Not a public booking page"}
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
            Public CTAs are{" "}
            <code className="text-sm">/shadow-lab-group</code>,{" "}
            <code className="text-sm">/shadow-lab-monthly</code>, and{" "}
            <code className="text-sm">/consulting</code>. After pay, Stripe
            redirects to <code className="text-sm">/access/book</code>. This
            route is not an offer chooser.
          </p>
        )}
        <p className="flex flex-wrap gap-x-3 gap-y-2">
          {cancelPath ? (
            <Link
              href={cancelPath}
              className="text-[color:var(--electric-bright)] hover:underline"
            >
              Back to offer
            </Link>
          ) : null}
          <Link
            href="/shadow-lab-group"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Group
          </Link>
          <Link
            href="/shadow-lab-monthly"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Monthly
          </Link>
          <Link
            href="/consulting"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Consulting
          </Link>
          <Link href="/" className="text-[color:var(--electric-bright)] hover:underline">
            Home
          </Link>
        </p>
      </div>
    </section>
  );
}
