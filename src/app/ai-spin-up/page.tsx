import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import {
  AI_SPIN_UP_CANONICAL,
  AI_SPIN_UP_COMING_SOON,
  AI_SPIN_UP_DESCRIPTION,
  AI_SPIN_UP_EXAMPLE,
  AI_SPIN_UP_FACTS,
  AI_SPIN_UP_FAQ,
  AI_SPIN_UP_H1,
  AI_SPIN_UP_KEYWORDS,
  AI_SPIN_UP_OG,
  AI_SPIN_UP_STEPS,
  AI_SPIN_UP_TITLE,
  AI_SPIN_UP_URL,
  aiSpinUpJsonLd,
} from "@/lib/ai-spin-up";

export const metadata: Metadata = {
  title: { absolute: AI_SPIN_UP_TITLE },
  description: AI_SPIN_UP_DESCRIPTION,
  keywords: [...AI_SPIN_UP_KEYWORDS],
  robots: { index: true, follow: true },
  alternates: { canonical: AI_SPIN_UP_CANONICAL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: AI_SPIN_UP_CANONICAL,
    siteName: "Pragvance.ai",
    title: AI_SPIN_UP_TITLE,
    description: AI_SPIN_UP_DESCRIPTION,
    images: [
      {
        url: AI_SPIN_UP_OG.path,
        width: AI_SPIN_UP_OG.width,
        height: AI_SPIN_UP_OG.height,
        alt: AI_SPIN_UP_OG.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: AI_SPIN_UP_TITLE,
    description: AI_SPIN_UP_DESCRIPTION,
    images: [
      {
        url: AI_SPIN_UP_OG.path,
        width: AI_SPIN_UP_OG.width,
        height: AI_SPIN_UP_OG.height,
        alt: AI_SPIN_UP_OG.alt,
      },
    ],
  },
};

const jsonLd = JSON.stringify(aiSpinUpJsonLd()).replace(/</g, "\\u003c");

export default function AiSpinUpPage() {
  return (
    <div className="bg-[color:var(--bg-void)] text-[color:var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section className="relative overflow-hidden border-b border-[color:var(--line)] bg-[color:var(--bg-space)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(720px 360px at 8% -10%, rgba(208,162,86,0.2), transparent 62%), radial-gradient(640px 380px at 100% 0%, rgba(9,155,228,0.14), transparent 58%)",
          }}
        />
        <div className="section-pad relative mx-auto grid max-w-6xl items-start gap-10 py-8 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-16 lg:py-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-[color:var(--text-muted)]">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-[color:var(--electric-bright)]">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-[color:var(--text)]">AI Spin Up</li>
              </ol>
            </nav>

            <h1 className="mt-4 text-[2.05rem] font-semibold leading-[1.05] tracking-[-0.035em] text-[color:var(--text)] sm:text-5xl lg:text-[4.15rem]">
              {AI_SPIN_UP_H1}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-snug text-[color:var(--gold-bright)] sm:text-2xl">
              {SITE.tagline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--text-muted)] sm:text-lg">
              An AI voice agent for small business, speaking in your voice. It talks with prospects
              from an ad or a call and books a call with you.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:items-start">
              <a
                href={AI_SPIN_UP_URL}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[color:var(--gold)] px-8 text-center text-lg font-semibold text-black shadow-[0_12px_40px_rgba(208,162,86,0.28)] transition hover:bg-[color:var(--gold-bright)] sm:w-auto sm:min-w-[22rem]"
              >
                Talk to an AI Spin Up agent
              </a>
              <a
                href={AI_SPIN_UP_URL}
                className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-[color:var(--electric-bright)] underline decoration-[color:var(--electric)] underline-offset-4 hover:text-[color:var(--gold-bright)] sm:justify-start"
              >
                See plans
              </a>
            </div>
          </div>

          <figure
            className="rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--bg-void)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6"
            aria-label="Example conversation with an owner's AI agent"
          >
            <figcaption className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">
              Example conversation
            </figcaption>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              A sample of the chat shape. Not a customer and not a result.
            </p>
            <div className="mt-4 space-y-3">
              {AI_SPIN_UP_EXAMPLE.map((line) => (
                <p
                  key={line.text}
                  className={
                    line.from === "prospect"
                      ? "ml-8 rounded-2xl rounded-br-md bg-[color:var(--electric-deep)] px-4 py-3 text-sm leading-relaxed text-[color:var(--text)]"
                      : "mr-8 rounded-2xl rounded-bl-md border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3 text-sm leading-relaxed text-[color:var(--text)]"
                  }
                >
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gold-bright)]">
                    {line.from === "prospect" ? "Prospect" : "AI agent"}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
          </figure>
        </div>
      </section>

      <section className="border-b border-[color:var(--line)] bg-[color:var(--bg-void)]" aria-labelledby="spin-voice">
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-24">
          <h2
            id="spin-voice"
            className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--gold-bright)] md:text-5xl"
          >
            An AI voice agent for small business
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-muted)] md:text-lg">
            AI Spin Up gives a business owner an AI agent in the owner&apos;s voice. A 5-10 minute
            interview sets the work and the boundary. The agent stays inside your service area.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3" role="list">
            {AI_SPIN_UP_FACTS.map((fact) => (
              <li key={fact.title} className="panel p-6 md:p-8">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text)]">{fact.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)] md:text-base">{fact.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-[color:var(--line)] bg-[color:var(--bg-space)]" aria-labelledby="spin-steps">
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-24">
          <h2
            id="spin-steps"
            className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--gold-bright)] md:text-5xl"
          >
            An AI agent that books appointments
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-muted)] md:text-lg">
            Four steps. The conversation ends in a call with you.
          </p>
          <ol className="mt-10 grid gap-5 md:grid-cols-2">
            {AI_SPIN_UP_STEPS.map((step, index) => (
              <li key={step.title} className="panel flex gap-5 p-6 md:p-8">
                <span
                  aria-hidden="true"
                  className="text-3xl font-semibold tabular-nums tracking-[-0.04em] text-[color:var(--electric-bright)]"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text)]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)] md:text-base">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[color:var(--line)] bg-[color:var(--bg-void)]" aria-labelledby="spin-soon">
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-24">
          <h2
            id="spin-soon"
            className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--text)] md:text-5xl"
          >
            Coming later
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-muted)] md:text-lg">
            The live agent talks and books. These three follow-ups are not available yet.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3" role="list">
            {AI_SPIN_UP_COMING_SOON.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--bg-space)] p-6 md:p-8"
              >
                <p className="text-xs font-semibold tracking-wide text-[color:var(--gold-bright)]">{item.label}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[color:var(--text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)] md:text-base">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-[color:var(--line)] bg-[color:var(--bg-space)]" aria-labelledby="spin-faq">
        <div className="section-pad mx-auto max-w-3xl py-16 md:py-24">
          <h2
            id="spin-faq"
            className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--gold-bright)] md:text-5xl"
          >
            Questions about AI Spin Up
          </h2>
          <div className="mt-10 space-y-4">
            {AI_SPIN_UP_FAQ.map((item) => (
              <details key={item.q} className="panel group px-5 py-4 md:px-6">
                <summary className="cursor-pointer list-none font-medium text-[color:var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span className="text-base leading-snug md:text-lg">{item.q}</span>
                    <span aria-hidden="true" className="text-xl leading-none text-[color:var(--electric-bright)]">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)] md:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--bg-void)]" aria-labelledby="spin-close">
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-24">
          <div className="panel gold-glow px-6 py-10 md:px-12 md:py-14">
            <h2
              id="spin-close"
              className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--text)] md:text-5xl"
            >
              Talk with the live agent
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[color:var(--text-muted)] md:text-lg">
              The button opens the AI Spin Up site. Plans live there. This page does not list a price.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href={AI_SPIN_UP_URL}
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[color:var(--gold)] px-8 text-center text-lg font-semibold text-black transition hover:bg-[color:var(--gold-bright)]"
              >
                Talk to an AI Spin Up agent
              </a>
              <a
                href={AI_SPIN_UP_URL}
                className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-[color:var(--electric-bright)] underline decoration-[color:var(--electric)] underline-offset-4 sm:px-4"
              >
                See plans
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
