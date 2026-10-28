"use client";

// PREVIEW ONLY: branching AI Assessment v2. Card layout reused from AssessmentQuiz.
// Results are kept only in this browser (localStorage) and in server logs. No email gate.
import { useEffect, useState } from "react";
import Link from "next/link";
import { AREAS, BRANCHES, Q0, QUESTION_SETS } from "@/lib/assessment-v2/config";
import type { BranchId } from "@/lib/assessment-v2/config";
import type { Result } from "@/lib/assessment-v2/scoring";

const STORE_KEY = "pragvance-assessment-v2-result";
type Phase = "intro" | "branch" | "quiz" | "scoring" | "result";

const optionClass =
  "rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-4 py-3 text-left text-sm text-[color:var(--text)] transition hover:border-[color:var(--electric-bright)] hover:text-[color:var(--electric-bright)]";
const primaryClass =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]";

export default function AssessmentV2() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [branch, setBranch] = useState<BranchId | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore the last result kept in this browser (deferred to avoid a sync setState in the effect).
    const id = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORE_KEY);
        if (saved) {
          setResult(JSON.parse(saved) as Result);
          setPhase("result");
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const questions = branch ? QUESTION_SETS[branch] : [];
  const current = questions[step];

  async function submit(final: Record<string, number>) {
    if (!branch) return;
    setPhase("scoring");
    setError(null);
    try {
      const res = await fetch("/api/assessment-v2/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, answers: final }),
      });
      const data = (await res.json()) as { ok?: boolean; result?: Result; error?: string };
      if (!res.ok || !data.ok || !data.result) throw new Error(data.error || "Scoring failed");
      setResult(data.result);
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data.result));
      } catch {
        /* ignore */
      }
      setPhase("result");
    } catch {
      setError("Could not score your answers. Please try again.");
      setPhase("quiz");
    }
  }

  function reset() {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    setBranch(null);
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setPhase("intro");
  }

  return (
    <div className="panel gold-glow mx-auto max-w-2xl p-6 md:p-8" data-testid="assessment-v2">
      {phase === "intro" && (
        <div>
          <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">AI Assessment</p>
          <h1 className="mt-2 text-2xl font-semibold text-[color:var(--text)] md:text-3xl">Find your next step with AI</h1>
          <p className="mt-3 text-[color:var(--text-muted)]">
            One quick question, then 25 short multiple-choice questions. You&apos;ll see your score and one suggested next
            step right away. No email needed.
          </p>
          <button type="button" className={`mt-6 ${primaryClass}`} onClick={() => setPhase("branch")}>
            Start
          </button>
        </div>
      )}

      {phase === "branch" && (
        <>
          <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">First question</p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)] md:text-2xl">{Q0}</h2>
          <div className="mt-6 grid gap-3">
            {BRANCHES.map((b) => (
              <button
                key={b.id}
                type="button"
                data-branch={b.id}
                className={optionClass}
                onClick={() => {
                  setBranch(b.id);
                  setStep(0);
                  setAnswers({});
                  setPhase("quiz");
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "quiz" && current && (
        <>
          <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">
            Question {step + 1} of {questions.length} · {AREAS[current.area]}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)] md:text-2xl">{current.q}</h2>
          <div className="mt-6 grid gap-3">
            {current.options.map((opt, idx) => (
              <button
                key={opt.label}
                type="button"
                data-idx={idx}
                className={optionClass}
                onClick={() => {
                  const next = { ...answers, [current.id]: idx };
                  setAnswers(next);
                  if (step + 1 >= questions.length) void submit(next);
                  else setStep((s) => s + 1);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button type="button" className="mt-4 text-sm text-[color:var(--text-muted)] underline" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </>
      )}

      {phase === "scoring" && <p className="text-[color:var(--text-muted)]">Scoring…</p>}

      {phase === "result" && result && (
        <div data-offer={result.offer.id}>
          <p className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Your AI Assessment</p>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]" data-testid="score">
            Score {result.total} / {result.max}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--gold-bright)]" data-testid="headline">
            {result.headline}
          </h2>
          <p className="mt-3 text-sm font-medium text-[color:var(--text)]">
            {result.offer.title}
            {result.offer.price ? ` · ${result.offer.price}` : ""}
          </p>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">{result.offer.body}</p>
          {result.why?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-[color:var(--text)]">Why we recommend this</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--text-muted)]" data-testid="why">
                {result.why.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {result.topTasks.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-[color:var(--text)]">Your top tasks to automate</p>
              <ol className="mt-2 list-decimal pl-5 text-sm text-[color:var(--text-muted)]">
                {result.topTasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {result.offer.external ? (
              <a href={result.offer.href} target="_blank" rel="noopener noreferrer" className={primaryClass}>
                {result.offer.cta}
              </a>
            ) : (
              <Link href={result.offer.href} className={primaryClass}>
                {result.offer.cta}
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
