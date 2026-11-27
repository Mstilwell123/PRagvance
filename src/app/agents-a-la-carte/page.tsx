import type { Metadata } from "next";
import AgentCatalog from "@/components/agents/AgentCatalog";
import OfferLadder from "@/components/agents/OfferLadder";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

const DESC =
  "Build your business with AI agents, $99 a piece. Each one is a one-time self-serve Grok Bot kit from Pragvance.ai, with a 30-day credit toward AI Workforce on Skool or Done-for-You.";

export const metadata: Metadata = {
  title: { absolute: "Agents a la Carte | Pragvance.ai" },
  description: DESC,
  alternates: { canonical: "/agents-a-la-carte" },
  openGraph: {
    title: "Agents a la Carte | Pragvance.ai",
    description: DESC,
    url: "/agents-a-la-carte",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function AgentsALaCartePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Agents a la Carte", path: "/agents-a-la-carte" },
        ]}
      />
      <section className="section-pad mx-auto max-w-6xl py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">
          Agents a la Carte
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">
          Build your business with AI agents, $99 a piece
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-[color:var(--text-muted)]">
          Pick a Grok Bot kit and install it on your own work. The $99 price is one-time. If you move to
          AI Workforce on Skool or Done-for-You within 30 days, that $99 is a credit. Want someone on the
          line while you set it up? Add an optional 60-minute live setup call for $199–$249. Want
          Pragvance.ai to wire the agents into the business? That path is Done-for-You.
        </p>
        <div className="mt-8">
          <OfferLadder />
        </div>
        <div className="mt-16">
          <AgentCatalog />
        </div>
      </section>
    </>
  );
}
