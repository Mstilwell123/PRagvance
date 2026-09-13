import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shadow Lab — Live High-Touch Seats | Pragvance",
  description:
    "Shadow Lab: live high-touch seats at $497 seat / $997 month. Upsell from The Swarm — book via contact.",
  alternates: { canonical: "/shadow-lab" },
  openGraph: {
    title: "Shadow Lab — Live High-Touch Seats",
    description: `Book Shadow Lab — ${SITE.labSeat} / ${SITE.labMonth}.`,
    url: "/shadow-lab",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function ShadowLabPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shadow Lab", path: "/shadow-lab" },
        ]}
      />
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">Upsell</p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Shadow Lab
        </h1>
        <p className="mt-4 text-xl font-semibold text-[color:var(--electric-bright)]">
          {SITE.labSeat} / {SITE.labMonth}
        </p>
        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>
            Live high-touch seats for founders who want closer coaching than the weekly Skool
            classroom. Shadow Lab is an upsell — not a second school in the public nav.
          </p>
          <p>
            Prefer the classroom track first? Start with{" "}
            <Link href="/swarm" className="text-[color:var(--electric-bright)] hover:underline">
              The Agent Swarm
            </Link>{" "}
            at {SITE.swarmPrice}.
          </p>
          <p>
            Booking: email or the contact form. No invented Calendly link on this draft site.
          </p>
        </div>
        <Link
          href="/contact#contact"
          className="mt-10 inline-flex rounded-full border border-[color:var(--electric)] px-6 py-3 text-sm font-semibold text-[color:var(--electric-bright)] hover:bg-[color:rgba(9,155,228,0.12)]"
        >
          Book Shadow Lab — {SITE.labSeat} / {SITE.labMonth}
        </Link>
      </section>
    </>
  );
}
