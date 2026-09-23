import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { OFFERS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shadow Lab — Compare Group & Monthly | Pragvance",
  description:
    "Compare Shadow Lab: Group Training ($497 · up to 10 · 120 min) or Lab Monthly ($997/mo · 1:1 · 60 min). Pay on each offer page.",
  alternates: { canonical: "/shadow-lab" },
  openGraph: {
    title: "Shadow Lab — Compare Group & Monthly",
    description:
      "Interactive high-touch training with Grok Bot. Choose Group Training or Lab Monthly — pay first on each page.",
    url: "/shadow-lab",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function ShadowLabPage() {
  const group = OFFERS.shadow_lab_group;
  const monthly = OFFERS.shadow_lab_monthly;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shadow Lab", path: "/shadow-lab" },
        ]}
      />
      <section className="section-pad mx-auto max-w-5xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--electric)]">
          Live high-touch
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Shadow Lab
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[color:var(--text-muted)]">
          Interactive training to staff agent swarms and build a business with AI — with Grok Bot
          as your business guide and builder. Pick an option below; pay on that page, then book.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="panel gold-glow flex flex-col p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider text-[color:var(--gold)]">
              Group Training
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text)]">{group.name}</h2>
            <p className="mt-1 text-3xl font-semibold text-[color:var(--gold-bright)]">
              {group.priceLabel}
              <span className="ml-2 text-base font-medium text-[color:var(--text-muted)]">
                {group.priceNote}
              </span>
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[color:var(--text-muted)]">
              <li>Interactive multi-person training — agent swarm, building with AI.</li>
              <li>Grok Bot as business guide and builder on your real work.</li>
              <li>Max 10 · Google Meet · 120 min.</li>
            </ul>
            <Link
              href="/shadow-lab-group"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)]"
            >
              Group Training — {group.priceLabel} →
            </Link>
          </article>

          <article className="panel flex flex-col p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider text-[color:var(--electric)]">
              Lab Monthly
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text)]">{monthly.name}</h2>
            <p className="mt-1 text-3xl font-semibold text-[color:var(--electric-bright)]">
              {monthly.priceLabel}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[color:var(--text-muted)]">
              <li>Ongoing 1:1 working sessions with closer coaching.</li>
              <li>Build and refine your agent department month by month.</li>
              <li>60 min · Google Meet · paid monthly.</li>
            </ul>
            <Link
              href="/shadow-lab-monthly"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-[color:var(--electric)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--electric-bright)] transition hover:bg-[color:rgba(9,155,228,0.12)]"
            >
              Lab Monthly — {monthly.priceLabel} →
            </Link>
          </article>
        </div>

        <div className="panel mt-12 overflow-x-auto p-6">
          <h2 className="text-lg font-semibold text-[color:var(--gold-bright)]">Compare</h2>
          <table className="mt-4 w-full min-w-[28rem] text-left text-sm text-[color:var(--text-muted)]">
            <thead>
              <tr className="border-b border-[color:var(--line)] text-[color:var(--text)]">
                <th className="py-2 pr-4 font-medium"> </th>
                <th className="py-2 pr-4 font-medium">Group Training</th>
                <th className="py-2 font-medium">Lab Monthly</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-3 pr-4 text-[color:var(--text)]">Price</td>
                <td className="py-3 pr-4">$497 one-time</td>
                <td className="py-3">$997/mo</td>
              </tr>
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-3 pr-4 text-[color:var(--text)]">Duration</td>
                <td className="py-3 pr-4">120 min</td>
                <td className="py-3">60 min</td>
              </tr>
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-3 pr-4 text-[color:var(--text)]">Format</td>
                <td className="py-3 pr-4">Up to 10 · Google Meet</td>
                <td className="py-3">1:1 Google Meet</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[color:var(--text)]">Pay &amp; book</td>
                <td className="py-3 pr-4">
                  <Link
                    href="/shadow-lab-group"
                    className="text-[color:var(--electric-bright)] hover:underline"
                  >
                    /shadow-lab-group
                  </Link>
                </td>
                <td className="py-3">
                  <Link
                    href="/shadow-lab-monthly"
                    className="text-[color:var(--electric-bright)] hover:underline"
                  >
                    /shadow-lab-monthly
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-sm text-[color:var(--text-muted)]">
          Prefer the classroom track first? Start with{" "}
          <Link href="/swarm" className="text-[color:var(--electric-bright)] hover:underline">
            The Agent Swarm
          </Link>{" "}
          at {SITE.swarmPrice}. Need a single focused hour? See{" "}
          <Link href="/consulting" className="text-[color:var(--electric-bright)] hover:underline">
            Consulting — {SITE.consultingPrice}/hr
          </Link>
          .
        </p>
      </section>
    </>
  );
}
