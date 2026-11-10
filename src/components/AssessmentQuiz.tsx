"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { completeAssessmentCapture } from "@/lib/assessment-lead";
import { SITE } from "@/lib/site";
import { ASSESSMENT_SCORE_MAX, QUESTIONS, bandForScore, scoreTier } from "@/lib/assessment-questions";

type NextWant = "swarm" | "lab" | "custom" | "score" | null;

type BandResult = {
  band: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
};

function scoreTotal(answers: Record<string, number>): number {
  return QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

function bandFromScore(total: number, nextWant: NextWant): BandResult {
  // Optional next pick must never override a 0–27 into Lab
  const tier = scoreTier(total);
  const low = tier === "low";
  const midLow = tier === "midLow";
  const mid = tier === "mid";
  const high = tier === "high";
  const bandName = bandForScore(total);
  const scored = `Score ${total} / ${ASSESSMENT_SCORE_MAX}.`;

  if (high && nextWant === "custom") {
    return {
      band: bandName,
      title: "Operating layer — custom app conversation",
      body: `${scored} You asked about a custom app. Talk through what to ship — or stay in Shadow Lab (${SITE.labPrices}) if you want closer coaching first.`,
      href: "/contact?interest=custom#contact",
      cta: "Talk about a custom app",
    };
  }

  if (high) {
    if (nextWant === "swarm") {
      return {
        band: bandName,
        title: "Operating layer — AI Workforce still fits",
        body: `${scored} You already run AI as an operating layer. Weekly classroom keeps the roster sharp — ${SITE.swarmPrice} on Skool.`,
        href: SITE.skoolUrl,
        cta: `Join AI Workforce — ${SITE.swarmPrice}`,
        external: true,
      };
    }
    return {
      band: bandName,
      title: "Operating layer — Shadow Lab",
      body: `${scored} Live coaching for founders who want closer guidance — ${SITE.labPrices}.`,
      href: "/shadow-lab",
      cta: "Explore Shadow Lab",
    };
  }

  if (mid) {
    if (nextWant === "lab") {
      return {
        band: bandName,
        title: "Real workflows, weak ops — Shadow Lab if you want a closer desk",
        body: `${scored} Production workflows exist; ops are thin. AI Workforce builds the system; Shadow Lab (${SITE.labPrices}) if you want closer coaching.`,
        href: "/shadow-lab",
        cta: "Explore Shadow Lab",
      };
    }
    if (nextWant === "custom") {
      return {
        band: bandName,
        title: "Real workflows, weak ops — custom conversation",
        body: `${scored} You may need a product, not only agents. Or start with AI Workforce (${SITE.swarmPrice}) to tighten ops first.`,
        href: "/contact?interest=custom#contact",
        cta: "Talk about a custom app",
      };
    }
    return {
      band: bandName,
      title: "Real workflows, weak ops — AI Workforce",
      body: `${scored} You have real workflows but weak ops. AI Workforce (${SITE.swarmPrice}) builds the roster and routines. Mention Shadow Lab if you want a closer desk.`,
      href: SITE.skoolUrl,
      cta: `Join AI Workforce — ${SITE.swarmPrice}`,
      external: true,
    };
  }

  // 0–44 always Swarm-primary; optional Lab pick cannot override 0–27 into Lab
  if (low || midLow) {
    if (nextWant === "custom") {
      return {
        band: bandName,
        title: `${bandName} — start with AI Workforce, or talk custom later`,
        body: `${scored} ${bandName}. AI Workforce (${SITE.swarmPrice}) is the right first step. Custom apps come after you have a system — contact us when ready.`,
        href: SITE.skoolUrl,
        cta: `Join AI Workforce — ${SITE.swarmPrice}`,
        external: true,
      };
    }
    // Even if they picked Lab optionally, 0–27 stays Swarm; 28–44 can mention Lab lightly but CTA stays Swarm unless they insist — rule: do not override 0–27 into Lab
    if (nextWant === "lab" && midLow) {
      return {
        band: bandName,
        title: `${bandName} — AI Workforce first`,
        body: `${scored} Scattered pilots. Start with AI Workforce (${SITE.swarmPrice}). Shadow Lab (${SITE.labPrices}) is available when the foundation is in place.`,
        href: SITE.skoolUrl,
        cta: `Join AI Workforce — ${SITE.swarmPrice}`,
        external: true,
      };
    }
    return {
      band: bandName,
      title: `${bandName} — AI Workforce`,
      body: `${scored} ${bandName}. Weekly live training on Skool to build a Grok Bot agent team — ${SITE.swarmPrice}.`,
      href: SITE.skoolUrl,
      cta: `Join AI Workforce — ${SITE.swarmPrice}`,
      external: true,
    };
  }

  // fallback
  return {
    band: "Assessment",
    title: "AI Workforce is a strong start",
    body: `${scored} Weekly live training — ${SITE.swarmPrice}.`,
    href: SITE.skoolUrl,
    cta: `Join AI Workforce — ${SITE.swarmPrice}`,
    external: true,
  };
}

const NEXT_OPTIONS = [
  ["swarm", "Weekly classroom (AI Workforce)"],
  ["lab", "High-touch seats (Lab)"],
  ["custom", "Custom app / product"],
  ["score", "Just the score"],
] as const;

const inputClass =
  "mt-1 w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-[color:var(--electric-bright)]";

export default function AssessmentQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [nextWant, setNextWant] = useState<NextWant>(null);
  const [phase, setPhase] = useState<"quiz" | "capture" | "result">("quiz");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const total = useMemo(() => scoreTotal(answers), [answers]);
  const previewBand = useMemo(() => bandFromScore(total, nextWant).band, [total, nextWant]);
  const result = useMemo(
    () => (phase === "result" ? bandFromScore(total, nextWant) : null),
    [phase, total, nextWant]
  );

  const current = QUESTIONS[step];

  function reset() {
    setAnswers({});
    setNextWant(null);
    setStep(0);
    setPhase("quiz");
    setName("");
    setCompany("");
    setPhone("");
    setEmail("");
    setHoneypot("");
    setSubmitting(false);
    setSubmitError(null);
    setEmailError(null);
  }

  async function onCaptureSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    setEmailError(null);

    // Score and band are already computed here. Show them after a valid form
    // even when the lead API errors, times out, or never responds.
    // completeAssessmentCapture rejects addresses the lead route would reject.
    const outcome = await completeAssessmentCapture(
      { name, company, phone, email, score: total, band: previewBand, nextWant, honeypot },
      (body) => {
        void fetch("/api/assessment-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => undefined);
      },
    );

    if (outcome.phase === "capture") {
      if (outcome.field === "email") setEmailError(outcome.error);
      else setSubmitError(outcome.error);
      setSubmitting(false);
      return;
    }

    setPhase("result");
    setSubmitting(false);
  }

  return (
    <div className="panel gold-glow mx-auto max-w-2xl p-6 md:p-8">
      {phase === "quiz" && current && (
        <>
          <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)] md:text-2xl">
            {current.q}
          </h2>
          <div className="mt-6 grid gap-3">
            {current.options.map((opt, idx) => (
              <button
                key={opt}
                type="button"
                className="rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-4 py-3 text-left text-sm text-[color:var(--text)] transition hover:border-[color:var(--electric-bright)] hover:text-[color:var(--electric-bright)]"
                onClick={() => {
                  setAnswers((a) => ({ ...a, [current.id]: idx }));
                  if (step + 1 >= QUESTIONS.length) {
                    setPhase("capture");
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "capture" && (
        <form onSubmit={onCaptureSubmit} noValidate>
          <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">
            Almost there
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)] md:text-2xl">
            See your results
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Leave your name, company, phone, and email — then we show your score and band.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label
                htmlFor="assess-name"
                className="block text-xs uppercase tracking-wider text-[color:var(--electric-bright)]"
              >
                Name
              </label>
              <input
                id="assess-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="assess-company"
                className="block text-xs uppercase tracking-wider text-[color:var(--electric-bright)]"
              >
                Company name
              </label>
              <input
                id="assess-company"
                name="company"
                type="text"
                required
                autoComplete="organization"
                maxLength={200}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="assess-phone"
                className="block text-xs uppercase tracking-wider text-[color:var(--electric-bright)]"
              >
                Phone number
              </label>
              <input
                id="assess-phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="assess-email"
                className="block text-xs uppercase tracking-wider text-[color:var(--electric-bright)]"
              >
                Email
              </label>
              <input
                id="assess-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "assess-email-error" : undefined}
                className={inputClass}
                disabled={submitting}
              />
              {emailError && (
                <p id="assess-email-error" className="mt-2 text-sm text-red-400" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Honeypot — hidden from users */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
            >
              <label htmlFor="assess-website">Website</label>
              <input
                id="assess-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">
              Optional — not scored
            </p>
            <p className="mt-2 text-sm font-medium text-[color:var(--text)]">
              What do you want next?
            </p>
            <div className="mt-3 grid gap-3">
              {NEXT_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  disabled={submitting}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    nextWant === key
                      ? "border-[color:var(--electric-bright)] bg-[color:var(--bg-elevated)] text-[color:var(--electric-bright)]"
                      : "border-[color:var(--line)] bg-[color:var(--bg-elevated)] text-[color:var(--text)] hover:border-[color:var(--electric-bright)] hover:text-[color:var(--electric-bright)]"
                  }`}
                  onClick={() => setNextWant((prev) => (prev === key ? null : key))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-red-400" role="alert">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Submitting…" : "See my results"}
          </button>
        </form>
      )}

      {phase === "result" && result && (
        <div>
          <p className="text-xs uppercase tracking-wider text-[color:var(--gold)]">
            Your AI Assessment
          </p>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Score {total} / {ASSESSMENT_SCORE_MAX} · {result.band}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--gold-bright)]">
            {result.title}
          </h2>
          <p className="mt-3 text-[color:var(--text-muted)]">{result.body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {result.external ? (
              <a
                href={result.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]"
              >
                {result.cta}
              </a>
            ) : (
              <Link
                href={result.href}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]"
              >
                {result.cta}
              </Link>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--electric)] px-6 py-3 text-sm font-semibold text-[color:var(--electric-bright)]"
              onClick={reset}
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
