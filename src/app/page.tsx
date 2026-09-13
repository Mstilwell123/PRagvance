import Image from "next/image";
import Link from "next/link";
import CtaButtons from "@/components/CtaButtons";
import Faq from "@/components/Faq";
import { DESKS, SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* HERO — Mark's collage is the ONLY hero image; no overlay art/copy on the artwork */}
      <section className="relative overflow-hidden bg-black" aria-label="Hero">
        <div className="relative mx-auto w-full max-w-[1600px]">
          <Image
            src="/hero-banner.png"
            alt="Pragvance.ai — AI Education, Consulting, Strategy. Agent Swarm with Grok Bot."
            width={1983}
            height={793}
            priority
            className="h-auto w-full object-contain"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 border-t border-[color:var(--line)] bg-black">
          <div className="section-pad mx-auto flex max-w-6xl flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:py-10">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--electric-bright)]">
                Pragvance.ai
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-snug text-[color:var(--text)] md:text-3xl">
                Practical AI. Built to advance your business.
              </h1>
              <p className="mt-2 text-sm text-[color:var(--text-muted)] md:text-base">
                Staff a Grok Bot department — roles, skills, tools, and routines — so agents work
                together on your real work.
              </p>
            </div>
            <CtaButtons className="shrink-0" />
          </div>
        </div>
      </section>

      {/* HOW A DEPARTMENT WORKS */}
      <section
        id="department"
        className="border-t border-[color:var(--line)] bg-[color:var(--bg-space)]"
        aria-labelledby="dept-heading"
      >
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <h2
            id="dept-heading"
            className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl"
          >
            How a department works
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
            Chat is a single seat. A department is a roster — each agent with a job, skills, tools,
            and a routine you can run every week.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Roles",
                body: "Name who does what: triage, research, drafting, QA — clear ownership.",
              },
              {
                title: "Skills",
                body: "Give each agent the playbooks and judgment calls that match the role.",
              },
              {
                title: "Tools",
                body: "Connect inbox, docs, CRM, or your stack so work leaves the chat window.",
              },
              {
                title: "Routines",
                body: "Schedule the loops: daily triage, weekly briefs, post-call notes.",
              },
            ].map((card) => (
              <article key={card.title} className="panel p-5 electric-ring transition">
                <h3 className="text-lg font-semibold text-[color:var(--electric-bright)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE OFFERS */}
      <section
        id="offers"
        className="border-t border-[color:var(--line)] bg-[color:var(--bg-void)]"
        aria-labelledby="offers-heading"
      >
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <h2
            id="offers-heading"
            className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl"
          >
            Live offers
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="panel gold-glow flex flex-col p-6 md:p-8">
              <p className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Primary</p>
              <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text)]">
                The Agent Swarm
              </h3>
              <p className="mt-1 text-3xl font-semibold text-[color:var(--gold-bright)]">
                {SITE.swarmPrice}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
                <li>Weekly live training to build a Grok Bot agent team for your business.</li>
                <li>First bot → roles → agents that work together.</li>
                <li>Classroom + community on Skool. We teach; you build on your real work.</li>
              </ul>
              <a
                href={SITE.swarmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)]"
              >
                Join Agent Swarm — {SITE.swarmPrice}
              </a>
              <Link
                href="/swarm"
                className="mt-3 text-center text-sm text-[color:var(--electric-bright)] hover:underline"
              >
                Learn more about The Swarm
              </Link>
            </article>

            <article className="panel flex flex-col p-6 md:p-8">
              <p className="text-xs uppercase tracking-wider text-[color:var(--electric)]">
                Upsell
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text)]">Shadow Lab</h3>
              <p className="mt-1 text-lg font-semibold text-[color:var(--electric-bright)]">
                {SITE.labSeat} / {SITE.labMonth}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
                <li>Live high-touch seats for founders who want closer coaching.</li>
                <li>Separate from The Swarm Skool classroom track.</li>
                <li>Book via contact — no invented booking link.</li>
              </ul>
              <Link
                href="/contact#contact"
                className="mt-8 inline-flex items-center justify-center rounded-full border border-[color:var(--electric)] px-6 py-3 text-sm font-semibold text-[color:var(--electric-bright)] transition hover:bg-[color:rgba(9,155,228,0.12)]"
              >
                Book Shadow Lab — {SITE.labSeat} / {SITE.labMonth}
              </Link>
              <Link
                href="/shadow-lab"
                className="mt-3 text-center text-sm text-[color:var(--electric-bright)] hover:underline"
              >
                Learn more about Shadow Lab
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* REALITY CHECK */}
      <section
        id="reality-check"
        className="border-t border-[color:var(--line)] bg-[color:var(--bg-space)]"
        aria-labelledby="rc-heading"
      >
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2
                id="rc-heading"
                className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl"
              >
                AI Reality Check
              </h2>
              <p className="mt-4 text-[color:var(--text-muted)]">
                A free readiness pass — six quick questions — so you see where agents help and
                where they don’t, before you invest.
              </p>
              <Link
                href="/assessment"
                className="mt-6 inline-flex rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]"
              >
                Take the Reality Check
              </Link>
            </div>
            <div className="panel p-6">
              <p className="text-sm text-[color:var(--text-muted)]">
                Honest framing: chat vs department, named desks, Weekly Meet process. No fake
                metrics or testimonials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO THIN */}
      <section
        id="portfolio"
        className="border-t border-[color:var(--line)] bg-[color:var(--bg-void)]"
        aria-labelledby="portfolio-heading"
      >
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <h2
            id="portfolio-heading"
            className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl"
          >
            Apps & SaaS
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
            We turn a locked PRD into a shipped app — web or store — with an AI Guide in the loop
            so founders aren’t blocked waiting on a traditional PM.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">MinutesIntel.ai</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Meeting intelligence product on its own domain. Deep pricing and features live
                there — not a ten-product wall here.
              </p>
              <a
                href="https://minutesintel.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-[color:var(--electric-bright)] hover:underline"
              >
                Visit MinutesIntel.ai →
              </a>
            </article>
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Your next build</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Design + ship AI products for founders, ops, and L&D — when the work needs a
                product, not only agents.
              </p>
              <Link
                href="/contact#contact"
                className="mt-4 inline-block text-sm text-[color:var(--electric-bright)] hover:underline"
              >
                Talk about your next app →
              </Link>
            </article>
          </div>
          <Link
            href="/apps"
            className="mt-6 inline-block text-sm text-[color:var(--gold)] hover:underline"
          >
            See products
          </Link>
        </div>
      </section>

      {/* WEEKLY MEET */}
      <section
        id="weekly-meet"
        className="border-t border-[color:var(--line)] bg-[color:var(--bg-space)]"
        aria-labelledby="meet-heading"
      >
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <h2
            id="meet-heading"
            className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl"
          >
            Weekly Meet — honest proof
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
            Face-to-cam process, built with Grok Bot. Named desks you can staff — not invented
            member counts or testimonials.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESKS.map((desk) => (
              <article key={desk.name} className="panel p-5">
                <h3 className="font-semibold text-[color:var(--electric-bright)]">{desk.name}</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{desk.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-[color:var(--line)] bg-[color:var(--bg-void)]">
        <Faq />
      </div>
    </>
  );
}
