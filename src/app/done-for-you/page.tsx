import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PRICING } from "@/lib/pricing";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Done-for-You (draft preview)",
  description:
    "Draft preview of the Pragvance Done-for-You setup. Pending approval. This page is not for indexing.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: { canonical: "/done-for-you" },
  openGraph: {
    title: "Done-for-You (draft preview)",
    description: "Draft preview, pending approval.",
    url: "/done-for-you",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

/** Same Done-for-You deposit URL already used on pricing, summary, and contact. */
const DEPOSIT_HREF = "https://buy.stripe.com/28E8wJ7D91iv3UlbJP9MY03";
/** Same contact pattern as the other offers: /contact?interest=<slug>#contact */
const FIT_CALL_HREF = "/contact?interest=done-for-you#contact";

const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)] electric-ring gold-glow";
const secondaryBtn =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--electric)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--electric-bright)] transition hover:border-[color:var(--electric-bright)] hover:bg-[color:rgba(9,155,228,0.12)] electric-ring";
const textLink = "font-semibold text-[color:var(--electric-bright)] hover:underline";

function Mark({ tag }: { tag: string }) {
  return (
    <strong className="mx-0.5 inline font-semibold text-[color:var(--gold-hot)]">{tag}</strong>
  );
}

function Section({
  id,
  title,
  children,
  tone = "void",
}: {
  id: string;
  title: string;
  children: ReactNode;
  tone?: "void" | "space";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-20 border-t border-[color:var(--line)] ${
        tone === "space" ? "bg-[color:var(--bg-space)]" : "bg-[color:var(--bg-void)]"
      }`}
    >
      <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
        <h2
          id={`${id}-heading`}
          className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

const DELIVERABLES: { title: string; body: ReactNode }[] = [
  {
    title: "A plan built around your business.",
    body: "We start with a discovery call and a review of how work moves through your business today. You get a one-page written plan, and nothing gets built until you approve it.",
  },
  {
    title: "Up to 5 agents working as one department.",
    body: "Each agent has a clear job, the skills to do it, the tools it's allowed to use and a set routine. They're set up to work together, not as five separate chatbots.",
  },
  {
    title: "Connections to the tools you already use.",
    body: "We connect your agents to your email, calendar, documents and CRM wherever a supported connector exists. If one of your tools can't be connected, we'll tell you up front.",
  },
  {
    title: "3 to 5 routines that run on a schedule.",
    body: "For example, a morning inbox sort, a weekly business brief or notes after every sales call. These run on their own and report back to you.",
  },
  {
    title: "One starter bot included.",
    body: (
      <>
        Pick Triage, Knowledge SOP or Mover from our catalog (
        <a href="#starter-bots" className={textLink}>
          details below
        </a>
        ). We set it up for your business as part of the build.
      </>
    ),
  },
  {
    title: "An operating manual you can actually use.",
    body: "A plain-language guide to what each agent does, how to ask it for things, and what it will never do without your OK.",
  },
  {
    title: "Two live training sessions, recorded.",
    body: "For you or your team, so the knowledge stays in your business when someone new joins.",
  },
  {
    title: "A handover meeting and a 30-day check-in.",
    body: "We walk you through everything when it's finished, then meet again a month later to fix whatever real use has turned up.",
  },
];

const WEEKS = [
  {
    week: "Week 1",
    body: "Discovery call + audit, written plan, you approve scope. Deposit due.",
  },
  { week: "Week 2", body: "Build agents, connect tools, write skills." },
  { week: "Week 3", body: "Test on your real work, fix, train you." },
  {
    week: "Week 4",
    body: "Handover, manual delivered, final payment, support starts.",
  },
];

const SUPPORT_ITEMS: { title: string; body: ReactNode }[] = [
  {
    title: "Monitoring and fixes.",
    body: "We keep an eye on your routines and fix anything that breaks.",
  },
  {
    title: "Tuning as your work changes.",
    body: "When you add a product, change a process or hire someone, we adjust your agents' skills to match.",
  },
  {
    title: "One change request a month.",
    body: "For example, a new routine or a new job for an existing agent.",
  },
  {
    title: "A 30-minute check-in every month.",
    body: "We review what's working, what isn't and what's next.",
  },
  {
    title: "Email support.",
    body: (
      <>
        Reach us at{" "}
        <a href={`mailto:${SITE.email}`} className={textLink}>
          {SITE.email}
        </a>
        . <Mark tag='[CONFIRM: reply time, e.g. "within one business day"]' />
      </>
    ),
  },
];

const NOT_INCLUDED = [
  "Your Grok Bot / X subscription and any paid tools",
  "Custom app development",
  "Ads spend",
  "Posting to customers or sending messages without your approval",
];

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: "How long does it take?",
    a: (
      <>
        About 30 days from your approved plan to handover. Week 1 is discovery and planning, week
        2 is the build, week 3 is testing on your real work and training, and week 4 is handover.
        If your setup needs more time, we&apos;ll say so in your written plan before you pay the
        second half. <Mark tag="[CONFIRM timeline]" />
      </>
    ),
  },
  {
    q: "What do I need to have?",
    a: (
      <>
        A Grok Bot account of your own, access to the tools you want connected (like your email,
        calendar and CRM), and about an hour a week for calls, reviews and testing. If you
        don&apos;t have a Grok Bot account yet, we&apos;ll walk you through setting one up.{" "}
        <Mark tag="[CONFIRM]" />
      </>
    ),
  },
  {
    q: "Do I own the agents?",
    a: (
      <>
        Your agents are built in your Grok Bot account, and you keep them if you stop support. You
        also keep your operating manual and training recordings.{" "}
        <Mark tag="[CONFIRM ownership terms in writing]" />
      </>
    ),
  },
  {
    q: "What if I want changes?",
    a: (
      <>
        During the build, changes are handled through your approved plan. After handover, support
        includes one change request a month. Bigger changes, like adding agents beyond your plan,
        are quoted separately before any work starts. <Mark tag="[CONFIRM]" />
      </>
    ),
  },
  {
    q: "What happens if I stop support?",
    a: (
      <>
        Your agents keep running in your account. We just stop monitoring, fixing and updating
        them. You can come back to support later.{" "}
        <Mark tag="[CONFIRM whether restarting support has any fee]" />
      </>
    ),
  },
  {
    q: "Is my data safe?",
    a: (
      <>
        Here&apos;s the honest answer. Your agents work through your own Grok Bot account and only
        connect to the tools you choose to connect, using the access you approve. They don&apos;t
        send messages, post anything or make purchases without your OK. Your data is still handled
        by Grok Bot and by each tool you connect, under their own terms, so read those before
        connecting anything sensitive. We&apos;ll go through what each agent can access with you
        before anything is switched on.
      </>
    ),
  },
  {
    q: "What if the deposit doesn't work out?",
    a: (
      <>
        Your scope is agreed in writing before work begins. Under our{" "}
        <Link href="/terms" className={textLink}>
          current terms
        </Link>
        , the $2,500 deposit is non-refundable. <Mark tag="[CONFIRM current terms and link them]" />
      </>
    ),
  },
];

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[color:var(--text)]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="text-[#e8bd63]">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BotCard({
  name,
  subtitle,
  problem,
  dayToDay,
  get,
  needs,
  example,
  note,
}: {
  name: string;
  subtitle: string;
  problem: string;
  dayToDay: string;
  get: string[];
  needs: string[];
  example: string;
  note?: ReactNode;
}) {
  return (
    <article className="panel flex flex-col p-6 md:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--gold)]">{name}</p>
      <h3 className="mt-2 text-xl font-semibold text-[color:var(--text)]">{subtitle}</h3>
      <h4 className="mt-6 text-sm font-semibold text-[color:var(--electric-bright)]">The problem</h4>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">{problem}</p>
      <h4 className="mt-6 text-sm font-semibold text-[color:var(--electric-bright)]">
        What it does day to day
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">{dayToDay}</p>
      <h4 className="mt-6 text-sm font-semibold text-[color:var(--electric-bright)]">What you get</h4>
      <BulletList items={get} />
      <h4 className="mt-6 text-sm font-semibold text-[color:var(--electric-bright)]">
        What it needs from you
      </h4>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
        {needs.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h4 className="mt-6 text-sm font-semibold text-[color:var(--electric-bright)]">Example task</h4>
      <p className="mt-2 border-l-2 border-[color:var(--gold)] pl-4 text-sm leading-relaxed text-[color:var(--text-muted)]">
        {example}
      </p>
      {note}
    </article>
  );
}

function FitCallLink({ className }: { className: string }) {
  return (
    <Link href={FIT_CALL_HREF} className={className}>
      Book a free fit call
    </Link>
  );
}

function DepositLink({ className }: { className: string }) {
  return (
    <a href={DEPOSIT_HREF} target="_blank" rel="noopener noreferrer" className={className}>
      Pay $2,500 deposit
    </a>
  );
}

export default function DoneForYouPage() {
  return (
    <>
      <p className="bg-[color:var(--gold)] px-4 py-3 text-center text-sm font-semibold text-black">
        DRAFT preview, pending Mark&apos;s approval
      </p>

      <section aria-labelledby="hero-heading" className="bg-[color:var(--bg-space)]">
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">
            Done-for-You
          </p>
          <h1
            id="hero-heading"
            className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl"
          >
            We build your AI department. You run your business.
          </h1>
          <p className="mt-4 max-w-2xl text-[color:var(--text-muted)] md:text-lg">
            In about 30 days, we set up a working team of Grok Bot agents on your real work: your
            inbox, your leads, your documents and your follow-ups. Then we hand it over trained,
            tested and written down, so you know exactly what each agent does.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <FitCallLink className={primaryBtn} />
            <a href="#included" className={secondaryBtn}>
              See what&apos;s included
            </a>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-[17rem]">
              <a
                href={DEPOSIT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`${primaryBtn} w-full sm:w-auto`}
              >
                Buy Now
              </a>
              <p className="text-xs leading-relaxed text-[color:var(--text-muted)]">
                You pay 50% today: a $2,500 deposit toward the $5,000 total setup.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold text-[#f3cd7d]">
            {PRICING.doneForYou.setup} setup · {PRICING.doneForYou.support}/month support · $2,500
            deposit to start, $2,500 at handover
          </p>
          <div className="mt-6 max-w-xl">
            <a
              href={DEPOSIT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={primaryBtn}
              aria-label="Start Here: Done-for-You Complete Setup"
            >
              Start Here
            </a>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
              Start Here opens secure checkout for the $2,500 deposit toward the $5,000 Done-for-You
              setup. The remaining $2,500 is billed at handover.
            </p>
            <a
              href={SITE.skoolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${textLink} mt-3 inline-block text-sm`}
            >
              Join AI Workforce
            </a>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-muted)]">
            You&apos;ll need your own Grok Bot account. Your agents are built and run there.{" "}
            <Mark tag="[CONFIRM]" />
          </p>
        </div>
      </section>

      <Section id="who" title="Who it's for" tone="void">
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="panel p-6">
            <h3 className="text-lg font-semibold text-[color:var(--electric-bright)]">For</h3>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
              Owners of 1–25 person businesses who want agents doing real work but don&apos;t have
              time to learn to build them.
            </p>
          </article>
          <article className="panel p-6">
            <h3 className="text-lg font-semibold text-[color:var(--electric-bright)]">Not for</h3>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
              People who want to learn to build it themselves (point them to{" "}
              <Link href="/aiworkforce" className={textLink}>
                AI Workforce
              </Link>
              , {PRICING.aiWorkforce.short}) or need custom software (point to{" "}
              <Link href="/contact?interest=custom#contact" className={textLink}>
                Custom App / SaaS
              </Link>
              ).
            </p>
          </article>
        </div>
      </Section>

      <Section id="included" title="What you walk away with" tone="space">
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          Everything below is agreed in writing before we start building, so you know what
          you&apos;re paying for on day one.
        </p>
        <ol className="mt-8 space-y-4">
          {DELIVERABLES.map((item, index) => (
            <li key={item.title} className="panel flex gap-4 p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8bd63] text-sm font-bold text-[#08111d]">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">
                <span className="font-semibold text-[color:var(--text)]">{item.title}</span>{" "}
                {item.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm font-semibold text-[color:var(--text)]">
          Nothing in your business changes until you sign off on it.
        </p>
      </Section>

      <Section id="how" title="How it works" tone="void">
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {WEEKS.map((step, index) => (
            <li key={step.week} className="rounded-xl border border-[color:var(--line)] bg-[#06111d] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8bd63] text-sm font-bold text-[#08111d]">
                {index + 1}
              </span>
              <p className="mt-3 font-semibold text-[color:var(--text)]">{step.week}</p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="support" title="After handover, we keep it running" tone="space">
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          Your business will change, and your agents should change with it. Support keeps your AI
          department working after we hand it over.
        </p>
        <h3 className="mt-8 text-lg font-semibold text-[color:var(--text)]">
          What&apos;s included each month <Mark tag="[CONFIRM all items]" />
        </h3>
        <ul className="mt-4 space-y-3">
          {SUPPORT_ITEMS.map((item) => (
            <li key={item.title} className="panel p-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
              <span className="font-semibold text-[color:var(--text)]">{item.title}</span> {item.body}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-[color:var(--text)]">
          Support starts at handover. Cancel anytime after the first 3 months. <Mark tag="[CONFIRM]" />
        </p>
        <h3 className="mt-8 text-lg font-semibold text-[color:var(--text)]">
          What support doesn&apos;t include
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--text-muted)]">
          Your Grok Bot subscription and any other paid tools, building new custom software, ad
          spend, and sending messages or posting anything for you without your approval.
        </p>
      </Section>

      <Section id="not-included" title="What's not included" tone="void">
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {NOT_INCLUDED.map((item) => (
            <li key={item} className="panel p-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="compare" title="Compare the ways to work with us" tone="space">
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--line)]">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[color:var(--bg-panel)] text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] max-md:hidden">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Offer
                </th>
                <th scope="col" className="px-4 py-3">
                  Price
                </th>
                <th scope="col" className="px-4 py-3">
                  How you work with us
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="max-md:block border-t border-[color:var(--line)]">
                <td className="px-4 py-4 align-top text-sm max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Offer
                  </span>
                  <Link href="/aiworkforce" className={textLink}>
                    AI Workforce
                  </Link>
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Price
                  </span>
                  {PRICING.aiWorkforce.short}
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text-muted)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    How you work with us
                  </span>
                  You build
                </td>
              </tr>
              <tr className="max-md:block border-t border-[color:var(--line)]">
                <td className="px-4 py-4 align-top text-sm max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Offer
                  </span>
                  <Link href="/shadow-lab" className={textLink}>
                    Shadow Lab
                  </Link>
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Price
                  </span>
                  {PRICING.shadowLabSingle.amount} for one two-hour session, or{" "}
                  {PRICING.shadowLabMonthly.amount}
                  /month for four two-hour sessions (eight hours total)
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text-muted)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    How you work with us
                  </span>
                  Coached
                </td>
              </tr>
              <tr className="max-md:block border-t border-[color:var(--line)]">
                <td className="px-4 py-4 align-top text-sm font-semibold text-[color:var(--text)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Offer
                  </span>
                  Done-for-You
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Price
                  </span>
                  {PRICING.doneForYou.setup} + {PRICING.doneForYou.support}/month
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text-muted)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    How you work with us
                  </span>
                  We build
                </td>
              </tr>
              <tr className="max-md:block border-t border-[color:var(--line)]">
                <td className="px-4 py-4 align-top text-sm max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Offer
                  </span>
                  <Link href="/contact?interest=custom#contact" className={textLink}>
                    Custom App / SaaS
                  </Link>
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    Price
                  </span>
                  {PRICING.custom.label}
                </td>
                <td className="px-4 py-4 align-top text-sm text-[color:var(--text-muted)] max-md:block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] md:hidden">
                    How you work with us
                  </span>
                  Quoted
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="starter-bots" title="Starter bots" tone="void">
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          Pick one, included in your Done-for-You setup. Separate pricing: TBD by Mark.{" "}
          <Mark tag="[CONFIRM]" />
        </p>
        <div className="mt-8 grid gap-6">
          <BotCard
            name="Triage"
            subtitle="Inbox and CRM triage"
            problem="Your inbox mixes new leads, customer questions, invoices and noise. Things slip, replies come late, and your CRM falls out of date because nobody has time to update it."
            dayToDay="Triage reads your new email, sorts it by what needs you, what can wait and what's noise, and flags new leads and urgent customer issues. It drafts replies for you to review, and it keeps your CRM records up to date with new contacts and conversation notes. You get a short summary of what came in and what needs you."
            get={[
              "Triage set up and connected to your inbox and CRM (where a supported connector exists)",
              "Sorting rules built around your business: your customers, your lead types, your priorities",
              "A daily summary routine, at the time you choose",
              "Reply drafts for common questions, written in your voice",
              "An operating card that explains what Triage does and doesn't do",
            ]}
            needs={[
              "Access to your email account and CRM",
              "20 to 30 minutes to walk us through which emails matter most",
              "A few examples of how you usually reply",
              "Your review of draft replies, since Triage never sends anything without your OK",
            ]}
            example="A potential customer emails asking about pricing at 9 PM. By morning, Triage has added them to your CRM as a new lead, flagged the email as high priority in your summary and drafted a reply for you to check and send."
          />
          <BotCard
            name="Knowledge SOP"
            subtitle="Your business know-how, ready to answer questions"
            problem="How your business runs lives in your head, in old manuals and in scattered documents. Every new hire asks the same questions, and when you're busy, they wait or guess."
            dayToDay="Knowledge SOP learns from your manuals, documents and the way you explain things. When someone on your team asks how something is done, it answers like a trained new hire would, pointing to the document it used. When it notices a process that isn't written down, it drafts a new standard operating procedure (SOP) for you to review."
            get={[
              "Knowledge SOP set up and trained on the documents you provide",
              "A tidy, organized library of your existing procedures",
              "Draft SOPs for gaps it finds, for you to approve or edit",
              "An operating card that explains how your team should ask it questions",
            ]}
            needs={[
              "Your existing manuals, guides, checklists and key documents",
              "A recorded walkthrough or short notes on processes that aren't written down yet",
              "Your review of every new SOP draft before your team relies on it",
            ]}
            example={'A new team member asks, "How do we handle a customer who wants to reschedule?" Knowledge SOP answers with your steps, cites the document it came from and, if no written procedure exists, drafts one for you to approve.'}
          />
          <BotCard
            name="Mover"
            subtitle="Move your automations to n8n"
            problem="Your Zapier or Make automations work, but the bills keep growing as you add tasks. Moving them by hand is slow, and nobody remembers why half of them were set up."
            dayToDay="Mover reviews your existing Zapier or Make automations, documents what each one does, and rebuilds them in n8n, an automation tool that can cost less to run depending on your setup. It tests each rebuilt automation, then lists what moved, what needs a manual step and what can't move yet. Your old automations stay on until you approve the switch."
            get={[
              "A written inventory of your current automations and what each one does",
              "Rebuilt n8n versions of the automations that can be moved",
              "A test record for each one before it replaces the original",
              "A list of anything that can't move, and why",
              "An operating card for maintaining your new setup",
            ]}
            needs={[
              "Access to your Zapier or Make account",
              "An n8n account or approval to set one up (n8n hosting may cost money; that's yours to choose)",
              "Access to the apps your automations connect to",
              "Your approval before each old automation is turned off",
            ]}
            example="Your Zapier account runs an automation that adds every new form submission to a spreadsheet and emails your team. Mover documents it, rebuilds it in n8n, runs a test submission, shows you both results side by side and waits for your OK before you switch off the Zapier version."
            note={
              <p className="mt-6 rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-void)] p-4 text-sm leading-relaxed text-[color:var(--text-muted)]">
                <span className="font-semibold text-[color:var(--text)]">
                  Note for Mark <Mark tag="[CONFIRM]" />:
                </span>{" "}
                Don&apos;t promise specific savings. Actual savings depend on the buyer&apos;s
                current plan, task volume and n8n hosting choice.
              </p>
            }
          />
        </div>
      </Section>

      <Section id="terms-of-offer" title="Guarantees and terms" tone="space">
        <ul className="mt-8 space-y-3">
          <li className="panel p-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
            Scope agreed in writing before work begins.
          </li>
          <li className="panel p-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
            Deposit is non-refundable (
            <Link href="/terms" className={textLink}>
              current site terms
            </Link>
            ).
          </li>
          <li className="panel p-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
            Nothing goes live in your business without your sign-off.
          </li>
        </ul>
      </Section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="scroll-mt-20 border-t border-[color:var(--line)] bg-[color:var(--bg-void)]"
      >
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <h2 id="faq-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl">
            FAQ
          </h2>
          <div className="mt-8 space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} open className="panel group open:gold-glow px-5 py-4">
                <summary className="cursor-pointer list-none font-medium text-[color:var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-[color:var(--electric-bright)] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Section id="start" title="Final call to action" tone="space">
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <FitCallLink className={primaryBtn} />
          <DepositLink className={primaryBtn} />
        </div>
        <p className="mt-3 max-w-xl text-xs text-[color:var(--text-muted)]">
          50% deposit. Remaining $2,500 billed on completion. The $2,500 deposit is non-refundable.
        </p>
        <p className="mt-6 text-sm text-[color:var(--text-muted)]">
          <a href={`mailto:${SITE.email}`} className={textLink}>
            {SITE.email}
          </a>
        </p>
      </Section>
    </>
  );
}
