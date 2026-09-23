import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confirming payment… | Pragvance",
  description: "Payment verification and booking handoff — coming soon.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/access/book" },
};

export default function AccessBookPage() {
  return (
    <section className="section-pad mx-auto max-w-2xl py-16 md:py-24">
      <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">
        After checkout
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text)] md:text-4xl">
        Confirming payment… you’ll pick a time next.
      </h1>
      <div className="panel mt-8 space-y-4 p-6 text-[color:var(--text-muted)]">
        <p>
          This page is the success gate after Stripe checkout. Payment verification and the
          booking handoff are owned by App Builder — a real scheduling link appears only after
          paid verify.
        </p>
        <p>
          We do not invent Calendly (or other) booking URLs on the marketing site. If you landed
          here without completing payment, start again from{" "}
          <Link
            href="/shadow-lab-group"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Group Training
          </Link>
          ,{" "}
          <Link
            href="/shadow-lab-monthly"
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            Lab Monthly
          </Link>
          , or{" "}
          <Link href="/consulting" className="text-[color:var(--electric-bright)] hover:underline">
            Consulting
          </Link>
          .
        </p>
        <p className="text-sm">
          Questions?{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            {SITE.email}
          </a>
        </p>
      </div>
    </section>
  );
}
