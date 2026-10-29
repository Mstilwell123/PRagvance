import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FirstAgentCarousel from "@/components/FirstAgentCarousel";
import { FIRST_AGENT_LABEL, FIRST_AGENT_PATH } from "@/lib/site";

// Package name is set once in FIRST_AGENT_LABEL (src/lib/site.ts).
// Package name: "5 Agent Package for $499" (nav label stays "First Agent").

export const metadata: Metadata = {
  title: `${FIRST_AGENT_LABEL}: Your First AI Agent for $99 | Pragvance`,
  description:
    "Five AI agents: Builder, Folderbot, Deep Dive, Chief Revenue Officer and Lead Magnet Marketer. Your first AI agent is $99, or unlock all five for $499 one-time.",
  alternates: { canonical: FIRST_AGENT_PATH },
};

const AGENTS = [
  { name: "Builder", line: "turns your idea into a working app" },
  { name: "Folderbot", line: "keeps your files organized" },
  { name: "Deep Dive", line: "researches anything, sources linked" },
  { name: "Chief Revenue Officer", line: "finds leads and books them" },
  { name: "Lead Magnet Marketer", line: "captures emails, grows your list" },
];

const SLIDES = [
  { src: "/first-agent/slide1.webp", alt: "I build an AI Chief Revenue Officer for your business. Meet your revenue agent." },
  { src: "/first-agent/slide2.webp", alt: "Leads go cold. Follow-ups slip. Nobody owns the number every day." },
  { src: "/first-agent/slide3.webp", alt: "Meet CROW, Chief Revenue Officer Winston: tracks your revenue goal, flags stalled leads, drafts follow-ups and offers, and tells you the next money move every day." },
  { src: "/first-agent/slide4.webp", alt: "What you get: one custom revenue agent built for your business, plus a 30-minute strategy consultation." },
  { src: "/first-agent/slide5.webp", alt: "Five AI agents. Start with one: Builder, Folderbot, Deep Dive, Chief Revenue Officer, Lead Magnet Marketer. Your first AI agent, $99, or unlock all five for $499 one-time." },
];

export default function FirstAgentPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: FIRST_AGENT_LABEL, path: FIRST_AGENT_PATH }]} />
      <section className="section-pad mx-auto max-w-5xl py-12 md:py-20">
        <h1 className="text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">{FIRST_AGENT_LABEL}</h1>
        <p className="mt-3 text-[color:var(--text-muted)]">Five AI agents. Start with one.</p>
        <div className="mt-8">
          <FirstAgentCarousel slides={SLIDES} label={FIRST_AGENT_LABEL} />
        </div>
        <div className="mx-auto mt-10 max-w-xl">
          <h2 className="text-xl font-semibold text-[color:var(--text)]">The five agents</h2>
          <ul className="mt-4 space-y-2 text-[color:var(--text-muted)]">
            {AGENTS.map((a) => (
              <li key={a.name}><strong className="text-[color:var(--text)]">{a.name}</strong>: {a.line}</li>
            ))}
          </ul>
          <p className="mt-6 text-lg text-[color:var(--text)]">
            Your first AI agent, <strong>$99</strong>. Or unlock all five for <strong>$499 one-time</strong>.
          </p>
          <p className="mt-2 text-[color:var(--text-muted)]">
            Your agents arrive as ready-to-use bot template links, customized for your business.
          </p>
          <Link href="/contact?interest=first-agent#contact"
            className="mt-6 inline-block rounded-full bg-[color:var(--gold)] px-6 py-3 font-semibold text-black hover:bg-[color:var(--gold-bright)]">
            Get your first agent
          </Link>
        </div>
      </section>
    </>
  );
}
