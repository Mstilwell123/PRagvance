import Link from "next/link";
import AgentPortrait from "@/components/agents/AgentPortrait";
import OfferLadder from "@/components/agents/OfferLadder";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import {
  ONBOARDING_QUESTIONS,
  agentContactHref,
  agentPath,
  categoryLabel,
  detailBadge,
  primaryCta,
  type Agent,
} from "@/lib/agents-a-la-carte";

const GROK_BOT_URL = "https://x.ai/bot";
const GROK_BOT_DESKTOP_URL = "https://cursor.com/download/bot";

const textLink = "font-semibold text-[color:var(--electric-bright)] hover:underline";

export default function AgentDetail({ agent }: { agent: Agent }) {
  const available = agent.status === "available";
  const contactHref = agentContactHref(agent.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Agents a la Carte", path: "/agents-a-la-carte" },
          { name: agent.title, path: agentPath(agent.slug) },
        ]}
      />
      <article className="section-pad mx-auto max-w-3xl py-16 md:py-24">
        <Link href="/agents-a-la-carte" className={`text-sm ${textLink}`}>
          Back to Agents a la Carte
        </Link>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <AgentPortrait slug={agent.slug} title={agent.title} size="detail" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--gold)]">
              {categoryLabel(agent.category)}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">{agent.title}</h1>
            <p
              className={
                available
                  ? "mt-4 inline-flex rounded-full bg-[color:var(--gold)] px-3 py-1 text-sm font-semibold text-black"
                  : "mt-4 inline-flex rounded-full border border-[color:var(--line)] px-3 py-1 text-sm font-semibold text-[color:var(--gold-bright)]"
              }
            >
              {detailBadge(agent.status)}
            </p>
          </div>
        </div>

        <section className="mt-12" aria-labelledby="what-heading">
          <h2 id="what-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
            What this agent does
          </h2>
          <p className="mt-4 text-[color:var(--text-muted)]">{agent.does}</p>
        </section>

        <section className="mt-10" aria-labelledby="week-heading">
          <h2 id="week-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
            Your Week-1 deliverable
          </h2>
          <p className="mt-4 text-[color:var(--text-muted)]">{agent.weekOne}</p>
        </section>

        <section className="panel mt-10 p-6 md:p-8" aria-labelledby="setup-heading">
          <h2 id="setup-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
            How self-serve setup works
          </h2>
          {available ? (
            <p className="mt-4 text-[color:var(--text-muted)]">
              Day one does not need a live connector. Start from a CSV, a PDF, or a paste of notes you
              already have.
            </p>
          ) : (
            <p className="mt-4 text-[color:var(--text-muted)]">
              This agent is Coming Soon. The self-serve kit is not on sale yet. When it opens, day one
              still will not need a live connector. You will start from a CSV, a PDF, or a paste of notes
              you already have.
            </p>
          )}
          <h3 className="mt-6 text-lg font-semibold text-[color:var(--text)]">Five-question onboarding</h3>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            {available
              ? "Guided onboarding asks these five questions before the kit drafts anything:"
              : "When the kit is ready, guided onboarding will ask these five questions before it drafts anything:"}
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[color:var(--text-muted)]">
            {ONBOARDING_QUESTIONS.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
          <h3 className="mt-6 text-lg font-semibold text-[color:var(--text)]">Desktop app</h3>
          <p className="mt-2 text-[color:var(--text-muted)]">
            Install the kit in the{" "}
            <a href={GROK_BOT_URL} target="_blank" rel="noopener noreferrer" className={textLink}>
              Grok Bot
            </a>{" "}
            desktop app (Mac, Windows, or Linux). The phone app is for everyday use after setup. Teaching
            by demonstration and testing a routine need the desktop app.{" "}
            <a href={GROK_BOT_DESKTOP_URL} target="_blank" rel="noopener noreferrer" className={textLink}>
              Download the Grok Bot desktop app
            </a>
            .
          </p>
          <h3 className="mt-6 text-lg font-semibold text-[color:var(--text)]">Accounts and connectors</h3>
          <p className="mt-2 text-[color:var(--text-muted)]">{agent.connectorNote}</p>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={contactHref}
            className={
              available
                ? "inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)] gold-glow"
                : "inline-flex items-center justify-center rounded-full border border-[color:var(--gold)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--gold-bright)] transition hover:bg-[color:rgba(208,162,86,0.12)]"
            }
          >
            {primaryCta(agent.status)}
          </Link>
          <p className="text-sm text-[color:var(--text-muted)]">
            Opens a contact note. This page does not take payment.
          </p>
        </div>

        <div className="mt-10">
          <OfferLadder />
        </div>
      </article>
    </>
  );
}
