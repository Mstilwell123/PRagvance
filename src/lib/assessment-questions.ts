export const QUESTIONS = [
  {
    id: "owner",
    q: "Who is accountable for AI outcomes — not who happens to open ChatGPT?",
    options: [
      "No one / whoever is curious",
      "Individual power users on their own",
      'A manager who also "does AI"',
      "A named owner with budget, a kill switch, and a weekly review",
    ],
  },
  {
    id: "mix",
    q: "Of last month's AI use, how much was one-off chat vs a repeatable job?",
    options: [
      "Almost all one-off prompting",
      "A few saved prompts people reuse",
      "Several jobs run the same way every week",
      "Named roles with skills, tools, and a routine",
    ],
  },
  {
    id: "qa",
    q: "When the model is wrong, how do you usually find out?",
    options: [
      "A customer or boss complains",
      "Someone notices eventually",
      "Spot checks when we remember",
      "Defined QA: sample review, an eval set, or sign-off before it leaves",
    ],
  },
  {
    id: "allow",
    q: "Can you name the workflows where AI is allowed to act, not just suggest?",
    options: [
      "No — everything is experimental",
      "A vague mental list",
      "1–2 workflows, still unofficial",
      "Written allow-list with owners and stop conditions",
    ],
  },
  {
    id: "knowledge",
    q: "Where does company knowledge live for an agent to use?",
    options: [
      "People's heads and random chats",
      "Drive / email graveyard",
      "A wiki nobody fully trusts",
      "Maintained source of truth with owners and last-reviewed dates",
    ],
  },
  {
    id: "data",
    q: "What happens to customer or employee data in prompts?",
    options: [
      "People paste whatever",
      'Informal "don\'t paste secrets"',
      "Written policy, not enforced",
      "Policy plus controls: approved tools, redaction, no training on our data",
    ],
  },
  {
    id: "roi",
    q: "How did you measure whether AI paid for itself last quarter?",
    options: [
      "We didn't",
      "Gut feel / anecdotes",
      "Hours saved on one team",
      "Named metrics (cycle time, error rate, cost per task) on a review cadence",
    ],
  },
  {
    id: "bus",
    q: "If your best AI person left tomorrow, could someone else run it without them?",
    options: [
      "Nothing",
      "Their chat history",
      "A few prompts in a doc",
      "Roles, skills, runbook someone else can pick up — otherwise known as a standard operating procedure, SOP.",
    ],
  },
  {
    id: "shadow",
    q: "How many unapproved AI tools are in use (shadow AI)?",
    options: [
      "No idea",
      "We know it's a lot",
      "Inventoried, not locked down",
      "Approved stack only; new tools go through review",
    ],
  },
  {
    id: "ship",
    q: "Before a customer-facing AI draft ships, what is required?",
    options: [
      "Nothing — people send from the chat",
      "The author rereads it",
      "A second human reviews",
      "Role-based review plus a brand/legal checklist for that channel",
    ],
  },
  {
    id: "roster",
    q: "Do you have jobs for agents, or a chatbot for people?",
    options: [
      "One shared ChatGPT",
      "Personal accounts",
      "A couple of named bots, unclear jobs",
      "A roster: each agent has a job, skills, tools, and a human desk",
    ],
  },
  {
    id: "version",
    q: "How are prompts / skills versioned?",
    options: [
      "Not at all",
      "Slack messages",
      "A shared doc that drifts",
      "Versioned skills with an owner; old versions retired",
    ],
  },
  {
    id: "escalate",
    q: "Default when the model is unsure?",
    options: [
      "It still answers",
      "User decides ad hoc",
      'Informal "ask a human"',
      "Built-in stop / flag / handoff",
    ],
  },
  {
    id: "write",
    q: "Which systems is AI allowed to write to — CRM, sending email, calendar, code, or payments?",
    options: [
      "None — copy-paste only",
      "One sandbox",
      "Production on a few tools, with no audit",
      "Explicit write permissions set by a manager or department head, with an audit log and a human on irreversible actions",
    ],
  },
  {
    id: "review",
    q: "After launch, how often do you re-evaluate a live agent?",
    options: [
      "Never / set and forget",
      "When it breaks",
      "Monthly if we remember",
      "Scheduled review of quality, cost, and whether the job still exists",
    ],
  },
  {
    id: "resist",
    q: "We've seen cases where employees quietly resist AI to protect their role. Does that sound like anyone on your team?",
    options: [
      "Yes, and no one is addressing it",
      'Probably — we hear "AI doesn\'t work" from people who never really tried it',
      "Some pushback, handled case by case",
      "Low risk — roles are redesigned openly, real AI use is tracked, and people are rewarded for using it",
    ],
  },
  {
    id: "account",
    q: "How do you keep people accountable for AI activity? Could you pull up an AI activity log of who did what?",
    options: [
      "We couldn't tell who did anything",
      "We'd have to ask around",
      "Some tools keep a history, but no one reviews it",
      "An automatic AI activity log records every edit to prompts, tools, or permissions, plus searches and drafts, with the person's name and time — visible only to admins and stored in a database managers can query",
    ],
  },
  {
    id: "signs",
    q: "Have you noticed any of these signs that AI is being quietly resisted?",
    options: [
      "Someone who controls the data quietly changes the inputs",
      "Metrics suddenly go quiet",
      "A pilot stalls right when it needs a champion",
      "No visible signs of resistance",
    ],
  },
  {
    id: "editors",
    q: "Who is allowed to change how an agent behaves?",
    options: [
      "Anyone",
      "Only the original builder",
      "A small unofficial group",
      "Named editors plus a change log",
    ],
  },
  {
    id: "stakes",
    q: "For money, legal, HR, or other high-stakes work, what is the rule?",
    options: [
      "Same as everything else",
      '"Be careful"',
      "Banned entirely",
      "Written ban/allow by category, with counsel where needed",
    ],
  },
  {
    id: "handoff",
    q: "How do handoffs work (agent → agent or agent → human)?",
    options: [
      "They don't — one chat does all",
      "Copy-paste between windows",
      "Informal tool chaining",
      "Defined interface: what is passed, what is not, who owns the last mile",
    ],
  },
  {
    id: "cost",
    q: "Do you know AI spend per workflow?",
    options: [
      "No",
      "Company card, surprise bills",
      "Monthly company total only",
      "Per-desk / per-job cost with a cap",
    ],
  },
  {
    id: "stale",
    q: "Last time an agent used stale or wrong context — did you catch it?",
    options: [
      "We wouldn't know",
      "It happened; no process",
      "We fix case by case",
      "Freshness rules (TTL, re-index, owner alert)",
    ],
  },
  {
    id: "access",
    q: "SSO, offboarding, and who can see transcripts?",
    options: [
      "Personal emails, no offboarding",
      "Shared passwords",
      "SSO on some tools",
      "SSO, offboarding, and least-privilege on transcripts",
    ],
  },
  {
    id: "decide",
    q: "Has leadership used AI output to make a decision they could not explain?",
    options: [
      "Regularly / we don't check",
      "Sometimes",
      "Rare; we catch it",
      "Policy: AI can brief; humans own the decision and the rationale",
    ],
  },
  {
    id: "runbook",
    q: "Could a new hire run your top AI workflow from a written card in one day?",
    options: [
      "No",
      "Only with a live walkthrough",
      "For one workflow",
      "Yes, for the core roster",
    ],
  },
  {
    id: "failures",
    q: "Do you keep a library of bad outputs and what you changed?",
    options: [
      "No",
      "A few screenshots",
      "An informal thread",
      "An eval / failure log that actually updates skills",
    ],
  },
  {
    id: "layer",
    q: "In this company, is AI a toy, a project, or an operating layer?",
    options: [
      "Toys for whoever is interested",
      "Side project / pilot graveyard",
      "A few production workflows, no org design",
      "Operating layer: departments, budgets, a plan for what stays human",
    ],
  },
] as const;

export type Question = (typeof QUESTIONS)[number];

/** Each option scores its index: first = 0, last = 3. Max is the sum of those tops. */
export const ASSESSMENT_SCORE_MAX = QUESTIONS.reduce(
  (sum, question) => sum + (question.options.length - 1),
  0,
);

/**
 * Inclusive upper bounds. Labels are the GoHighLevel band tags and must stay exact.
 * 0–27 chat toys, 28–44 scattered pilots, 45–61 real workflows, 62–max operating layer.
 */
export const SCORE_BANDS = [
  { max: 27, label: "Chat toys / no system" },
  { max: 44, label: "Scattered pilots" },
  { max: 61, label: "Real workflows, weak ops" },
  { max: ASSESSMENT_SCORE_MAX, label: "Operating layer" },
] as const;

export type ScoreBandLabel = (typeof SCORE_BANDS)[number]["label"];

export type ScoreTier = "low" | "midLow" | "mid" | "high";

export function bandForScore(total: number): ScoreBandLabel {
  for (const band of SCORE_BANDS) {
    if (total <= band.max) return band.label;
  }
  return "Operating layer";
}

/** Same cutoffs as bandForScore, in the order the results page already branches on. */
export function scoreTier(total: number): ScoreTier {
  if (total <= SCORE_BANDS[0].max) return "low";
  if (total <= SCORE_BANDS[1].max) return "midLow";
  if (total <= SCORE_BANDS[2].max) return "mid";
  return "high";
}
