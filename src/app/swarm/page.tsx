import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agent Swarm — Grok Bot Training on Skool | $99/mo",
  description:
    "Join the Agent Swarm on Skool — $99/mo. Weekly live training to build a Grok Bot agent team for your business. Classroom stays on Skool.",
  alternates: { canonical: "/swarm" },
  openGraph: {
    title: "Agent Swarm — Grok Bot Training | $99/mo",
    description:
      "Weekly live training to staff a Grok Bot department. Join The Swarm on Skool.",
    url: "/swarm",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function SwarmPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Agent Swarm", path: "/swarm" },
        ]}
      />
      <section className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <p className="text-sm uppercase tracking-wider text-[color:var(--gold)]">Primary offer</p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
          Agent Swarm
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[color:var(--gold-bright)]">
          {SITE.swarmPrice} on Skool
        </p>
        <div className="mt-8 space-y-4 text-[color:var(--text-muted)]">
          <p>
            The Swarm — {SITE.swarmPrice} on Skool: weekly live training to build a Grok Bot agent
            team for your business (first bot → roles → agents that work together).
          </p>
          <p>
            Classroom + community on Skool. We teach; you build on your real work.
          </p>
          <p>
            Want live high-touch seats? That’s{" "}
            <Link href="/shadow-lab" className="text-[color:var(--electric-bright)] hover:underline">
              Shadow Lab
            </Link>{" "}
            (separate) — The Swarm Skool is the self-paced / weekly classroom track.
          </p>
        </div>
        <a
          href={SITE.swarmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)] gold-glow"
        >
          Join Agent Swarm — {SITE.swarmPrice}
        </a>
        <p className="mt-6 text-sm text-[color:var(--text-muted)]">
          Site job: explain + outbound CTA. Classroom stays on Skool — not hosted here.
        </p>
      </section>
    </>
  );
}
