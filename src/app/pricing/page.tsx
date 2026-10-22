import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ShadowLabOffers, { FooterNotes, HowItWorks } from "@/components/ShadowLabOffers";

export const metadata: Metadata = {
  title: "Pricing — Shadow Lab | Pragvance",
  description:
    "Shadow Lab Session 1: $497 one-time, one live 2-hour session on Google Meet (up to 10 seats). Shadow Lab Monthly: $997/month, four live meetings a month.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Shadow Lab",
    description: "Session 1 $497 one-time · Monthly $997/month. Live on Google Meet.",
    url: "/pricing",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <section className="section-pad mx-auto max-w-5xl py-12 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">
          Pricing
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-4xl">
          Shadow Lab: build AI agents live.
        </h1>
        <p className="mt-3 max-w-2xl text-[color:var(--text-muted)]">
          Live group labs on Google Meet. You build your own AI agent hands-on while Mark and Grok
          Bot guide you.{" "}
          <Link href="/shadow-lab" className="font-semibold text-[#f3cd7d] hover:underline">
            What happens in the lab →
          </Link>
        </p>
        <div className="mt-8">
          <ShadowLabOffers />
        </div>
        <h2 className="mt-12 text-xl font-semibold text-[color:var(--gold-bright)]">How it works</h2>
        <div className="mt-5">
          <HowItWorks />
        </div>
        <FooterNotes />
      </section>
    </>
  );
}
