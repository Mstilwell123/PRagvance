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
    q: 'If the person who "gets AI" quit tomorrow, what survives?',
    options: [
      "Nothing",
      "Their chat history",
      "A few prompts in a doc",
      "Roles, skills, and runbooks someone else can pick up",
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
    q: "Which systems can AI write to (CRM, send email, calendar, code, payments)?",
    options: [
      "None — copy-paste only",
      "One sandbox",
      "Production on a few tools, no audit",
      "Explicit write permissions, an audit log, and a human for irreversible actions",
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
