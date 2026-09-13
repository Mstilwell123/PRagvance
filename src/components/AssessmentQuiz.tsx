"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";

const QUESTIONS = [
  {
    id: "ops",
    q: "Where does repetitive work pile up most?",
    options: ["Inbox / email", "Content & marketing", "Meetings & notes", "Ops / checklists"],
  },
  {
    id: "team",
    q: "Who would own an AI agent first?",
    options: ["Founder / solo", "Ops lead", "Marketing", "Not sure yet"],
  },
  {
    id: "tools",
    q: "What’s already in place?",
    options: ["ChatGPT / Claude only", "Some automations", "Custom tools", "Starting from scratch"],
  },
  {
    id: "risk",
    q: "Biggest concern right now?",
    options: ["Wasting time on toys", "Quality / brand voice", "Data privacy", "No clear ROI"],
  },
  {
    id: "goal",
    q: "Near-term goal?",
    options: ["Ship a first bot", "Staff a small department", "Build a product", "Get clarity only"],
  },
  {
    id: "pace",
    q: "Preferred pace?",
    options: ["Weekly classroom (Swarm)", "High-touch live seats (Lab)", "Custom build", "Assessment only"],
  },
] as const;

type Answers = Record<string, string>;

function recommend(answers: Answers) {
  const pace = answers.pace || "";
  if (pace.includes("Lab")) {
    return {
      title: "Shadow Lab looks like a fit",
      body: "You want live high-touch seats. Book a Shadow Lab conversation — $497 seat / $997 month.",
      href: "/contact#contact",
      cta: "Book Shadow Lab",
    };
  }
  if (pace.includes("Custom") || answers.goal?.includes("product")) {
    return {
      title: "Apps & SaaS conversation",
      body: "You may need a shipped product, not only agents. Talk about your next app.",
      href: "/contact#contact",
      cta: "Talk about your next app",
    };
  }
  if (pace.includes("Assessment")) {
    return {
      title: "Clarity first",
      body: "Start with a conversation. Email support@pragvance.ai — no pressure to join anything yet.",
      href: "/contact#contact",
      cta: "Contact Pragvance",
    };
  }
  return {
    title: "Agent Swarm is a strong start",
    body: `Weekly live training on Skool to build a Grok Bot agent team for your business — ${SITE.swarmPrice}.`,
    href: SITE.swarmUrl,
    cta: `Join Agent Swarm — ${SITE.swarmPrice}`,
    external: true,
  };
}

export default function AssessmentQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= QUESTIONS.length;
  const result = useMemo(() => (done ? recommend(answers) : null), [done, answers]);

  const current = QUESTIONS[step];

  return (
    <div className="panel gold-glow mx-auto max-w-2xl p-6 md:p-8">
      {!done && current && (
        <>
          <p className="text-xs uppercase tracking-wider text-[color:var(--electric-bright)]">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)] md:text-2xl">
            {current.q}
          </h2>
          <div className="mt-6 grid gap-3">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-4 py-3 text-left text-sm text-[color:var(--text)] transition hover:border-[color:var(--electric-bright)] hover:text-[color:var(--electric-bright)]"
                onClick={() => {
                  setAnswers((a) => ({ ...a, [current.id]: opt }));
                  setStep((s) => s + 1);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {done && result && (
        <div>
          <p className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Your Reality Check</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--gold-bright)]">{result.title}</h2>
          <p className="mt-3 text-[color:var(--text-muted)]">{result.body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {"external" in result && result.external ? (
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
              onClick={() => {
                setAnswers({});
                setStep(0);
              }}
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
