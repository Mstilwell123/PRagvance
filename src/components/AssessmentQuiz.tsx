"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { QUESTIONS } from "@/lib/assessment-questions";

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
  // Optional next pick must never override a 0–24 into Lab
  const low = total <= 24;
  const midLow = total >= 25 && total <= 39;
  const mid = total >= 40 && total <= 54;
  const high = total >= 55;

  if (high && nextWant === "custom") {
    return {
      band: "Operating layer",
      title: "Operating layer — custom app conversation",
      body: `Score ${total} / 75. You asked about a custom app. Talk through what to ship — or stay in Shadow Lab (${SITE.labSeat} / ${SITE.labMonth}) if you want high-touch seats first.`,
      href: "/contact#contact",
      cta: "Talk about a custom app",
    };
  }

  if (high) {
    if (nextWant === "swarm") {
      return {
        band: "Operating layer",
        title: "Operating layer — Agent Swarm still fits",
        body: `Score ${total} / 75. You already run AI as an operating layer. Weekly classroom keeps the roster sharp — ${SITE.swarmPrice} on Skool.`,
        href: SITE.swarmUrl,
        cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
        external: true,
      };
    }
    return {
      band: "Operating layer",
      title: "Operating layer — Shadow Lab",
      body: `Score ${total} / 75. High-touch seats for founders who want a closer desk — ${SITE.labSeat} / ${SITE.labMonth}.`,
      href: "/shadow-lab",
      cta: "Explore Shadow Lab",
    };
  }

  if (mid) {
    if (nextWant === "lab") {
      return {
        band: "Real workflows, weak ops",
        title: "Real workflows, weak ops — Shadow Lab if you want a closer desk",
        body: `Score ${total} / 75. Production workflows exist; ops are thin. Agent Swarm builds the system; Shadow Lab (${SITE.labSeat} / ${SITE.labMonth}) if you want closer coaching.`,
        href: "/shadow-lab",
        cta: "Explore Shadow Lab",
      };
    }
    if (nextWant === "custom") {
      return {
        band: "Real workflows, weak ops",
        title: "Real workflows, weak ops — custom conversation",
        body: `Score ${total} / 75. You may need a product, not only agents. Or start with Agent Swarm (${SITE.swarmPrice}) to tighten ops first.`,
        href: "/contact#contact",
        cta: "Talk about a custom app",
      };
    }
    return {
      band: "Real workflows, weak ops",
      title: "Real workflows, weak ops — Agent Swarm",
      body: `Score ${total} / 75. You have real workflows but weak ops. Agent Swarm (${SITE.swarmPrice}) builds the roster and routines. Mention Shadow Lab if you want a closer desk.`,
      href: SITE.swarmUrl,
      cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
      external: true,
    };
  }

  // 0–39 always Swarm-primary; optional Lab pick cannot override 0–24 into Lab
  if (low || midLow) {
    const bandLabel = low ? "Chat toys / no system" : "Scattered pilots";
    if (nextWant === "custom") {
      return {
        band: bandLabel,
        title: `${bandLabel} — start with Swarm, or talk custom later`,
        body: `Score ${total} / 75. ${bandLabel}. Agent Swarm (${SITE.swarmPrice}) is the right first step. Custom apps come after you have a system — contact us when ready.`,
        href: SITE.swarmUrl,
        cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
        external: true,
      };
    }
    // Even if they picked Lab optionally, 0–24 stays Swarm; 25–39 can mention Lab lightly but CTA stays Swarm unless they insist — rule: do not override 0–24 into Lab
    if (nextWant === "lab" && midLow) {
      return {
        band: bandLabel,
        title: `${bandLabel} — Agent Swarm first`,
        body: `Score ${total} / 75. Scattered pilots. Start with Agent Swarm (${SITE.swarmPrice}). Shadow Lab (${SITE.labSeat} / ${SITE.labMonth}) is available when the foundation is in place.`,
        href: SITE.swarmUrl,
        cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
        external: true,
      };
    }
    return {
      band: bandLabel,
      title: `${bandLabel} — Agent Swarm`,
      body: `Score ${total} / 75. ${bandLabel}. Weekly live training on Skool to build a Grok Bot agent team — ${SITE.swarmPrice}.`,
      href: SITE.swarmUrl,
      cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
      external: true,
    };
  }

  // fallback
  return {
    band: "Assessment",
    title: "Agent Swarm is a strong start",
    body: `Score ${total} / 75. Weekly live training — ${SITE.swarmPrice}.`,
    href: SITE.swarmUrl,
    cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
    external: true,
  };
}

const NEXT_OPTIONS = [
  ["swarm", "Weekly classroom (Swarm)"],
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

  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setCompany("");
    setPhone("");
    setEmail("");
    setHoneypot("");
    setSubmitting(false);
    setSubmitError(null);
  }

  async function onCaptureSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const companyTrim = company.trim();
    const phoneTrim = phone.trim();
    const emailTrim = email.trim();
    if (!companyTrim || !phoneTrim || !emailTrim) {
      setSubmitError("Company, phone, and email are required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/assessment-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: companyTrim,
          phone: phoneTrim,
          email: emailTrim,
          score: total,
          band: previewBand,
          nextWant,
          website: honeypot,
        }),
      });

      let data: { ok?: boolean; error?: string } = {};
      try {
        data = (await res.json()) as { ok?: boolean; error?: string };
      } catch {
        data = {};
      }

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.error === "Mailer not configured"
            ? "Results are temporarily unavailable. Please try again later."
            : "Could not submit. Check your details and try again."
        );
        setSubmitting(false);
        return;
      }

      setPhase("result");
      setSubmitting(false);
    } catch {
      setSubmitError("Could not submit. Check your connection and try again.");
      setSubmitting(false);
    }
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
            Leave your company, phone, and email — then we show your score and band.
          </p>

          <div className="mt-6 grid gap-4">
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
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
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
            Score {total} / 75 · {result.band}
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
