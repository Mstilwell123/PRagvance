// PREVIEW ONLY: branching AI Assessment v2 (/assessment-v2).
// Single source of truth: branches, all 100 questions, scores, cutoffs and routing rules.
// Every option scores its index (0–3). A higher score means "ready for more".
// Wording adapted from src/lib/assessment-questions.ts. Draft for Mark's review.

export type BranchId = "save" | "learn" | "dfy" | "app";
export type AreaId = "ai_today" | "repeat_tasks" | "tools_data" | "time_budget" | "hands_on";
/** "dfy" = a do-it-for-me answer; "app" = an answer that points to a custom app. */
export type Flag = "dfy" | "app";

export type OptionDef = { label: string; flags?: readonly Flag[] };
export type QuestionDef = {
  id: string;
  area: AreaId;
  q: string;
  /** Exactly 4 options; score = index (0–3). */
  options: readonly [OptionDef, OptionDef, OptionDef, OptionDef];
  /** Repeat-task questions name the task used for "top 3 tasks to automate". */
  task?: string;
};

export const AREAS: Record<AreaId, string> = {
  ai_today: "How you use AI today",
  repeat_tasks: "Tasks that repeat every week",
  tools_data: "Tools and data you have connected",
  time_budget: "Time and budget",
  hands_on: "How hands-on you want to be",
};
export const AREA_ORDER: readonly AreaId[] = ["ai_today", "repeat_tasks", "tools_data", "time_budget", "hands_on"];

export const BRANCHES: { id: BranchId; label: string }[] = [
  { id: "save", label: "Save time in my business" },
  { id: "learn", label: "Learn to build with AI" },
  { id: "dfy", label: "Get it done for me" },
  { id: "app", label: "Build an app" },
];

export const Q0 = "What is your area of interest?";

// ---- Scoring / routing rules ----
export const RULES = {
  maxScore: 75,
  /** Score bands, checked after the overrides. Inclusive. */
  bands: { workforceMax: 25, workforcePlusBotMax: 50 },
  /** In the 51–75 band, a hands-on area score at or below this goes to Done-for-You (area max is 15). */
  lowHandsOnMax: 5,
  /** Branch-level overrides, checked in this order: dfy, then app. */
  dfyBranches: ["dfy"] as readonly BranchId[],
  appBranches: ["app"] as readonly BranchId[],
  /** An answer flagged "app" counts as app-shaped; this many flagged answers route to the app track. */
  appFlagsNeeded: 1,
  topTasks: 3,
} as const;

export type OfferId = "workforce" | "workforce_bot" | "shadow_lab" | "dfy" | "app";
export type Offer = { id: OfferId; title: string; price: string | null; body: string; cta: string; href: string; external?: boolean };

export const OFFERS: Record<OfferId, Offer> = {
  workforce: {
    id: "workforce",
    title: "AI Workforce on Skool",
    price: "$99/mo",
    body: "Weekly live training on Skool to build your first agents on your real work.",
    cta: "Join AI Workforce ($99/mo)",
    href: "https://www.skool.com/aiworkforce",
    external: true,
  },
  workforce_bot: {
    id: "workforce_bot",
    title: "AI Workforce plus a custom Grok Bot agent",
    price: "$99/mo + $99 founding price",
    body: "Join AI Workforce on Skool ($99/mo) and add one custom Grok Bot agent built for your business at the $99 founding price, with a 30-minute consultation.",
    cta: "Talk about the $99 custom bot",
    href: "/contact?interest=custom-bot#contact",
  },
  shadow_lab: {
    id: "shadow_lab",
    title: "Shadow Lab",
    price: "$497 per session or $997/mo",
    body: "Live coaching for founders who want closer guidance: $497 for one two-hour session, or $997/mo for four sessions.",
    cta: "Explore Shadow Lab",
    href: "/shadow-lab",
  },
  dfy: {
    id: "dfy",
    title: "Done-for-You Complete Setup",
    price: "$4,999",
    body: "We set it up for you: $4,999 one-time setup.",
    cta: "Talk about Done-for-You",
    href: "/contact?interest=done-for-you#contact",
  },
  app: {
    id: "app",
    title: "Custom app track",
    price: null,
    body: "Your answers point to software your business owns. Start with a planning sprint that ends in a locked spec and a quote.",
    cta: "Book a planning sprint",
    href: "/contact?interest=custom#contact",
  },
};

// ---- Question helpers ----
type Opts = [string | OptionDef, string | OptionDef, string | OptionDef, string | OptionDef];
const o = (opts: Opts) => opts.map((x) => (typeof x === "string" ? { label: x } : x)) as unknown as QuestionDef["options"];
const DFY = (label: string): OptionDef => ({ label, flags: ["dfy"] });
const APP = (label: string): OptionDef => ({ label, flags: ["app"] });
function q(id: string, area: AreaId, text: string, opts: Opts, task?: string): QuestionDef {
  return { id, area, q: text, options: o(opts), ...(task ? { task } : {}) };
}
/** Repeat-task question: how often and how well-defined a named task is. */
function t(id: string, task: string, text: string): QuestionDef {
  return q(id, "repeat_tasks", text, [
    "Rarely, or never",
    "Weekly, done by hand each time",
    "Several times a week, roughly the same steps",
    "Daily, with the same steps every time",
  ], task);
}

// ===== Branch: Save time in my business =====
const SAVE: QuestionDef[] = [
  q("s_owner", "ai_today", "Who in your business owns how AI gets used?", ["No one / whoever is curious", "A few people on their own", "A manager who also handles AI", "A named owner with a weekly review"]),
  q("s_mix", "ai_today", "Of last month's AI use, how much was one-off chat vs a repeatable job?", ["Almost all one-off prompting", "A few saved prompts people reuse", "Several jobs run the same way every week", "Named roles with skills, tools and a routine"]),
  q("s_qa", "ai_today", "When AI gets something wrong, how do you usually find out?", ["A customer complains", "Someone notices eventually", "Spot checks when we remember", "Someone reviews before it goes out"]),
  q("s_allow", "ai_today", "Can you name the jobs where AI is allowed to act, not just suggest?", ["No, everything is experimental", "A vague mental list", "1–2 jobs, still unofficial", "A written list with owners and stop rules"]),
  q("s_bus", "ai_today", 'If the person who "gets AI" left tomorrow, what would survive?', ["Nothing", "Their chat history", "A few prompts in a doc", "Written steps someone else can pick up"]),
  t("s_t_inbox", "Email and inquiry replies", "How often do you answer the same customer emails or inquiries?"),
  t("s_t_followup", "Quote and lead follow-up", "How often do you follow up on quotes or leads?"),
  t("s_t_sched", "Scheduling and reminders", "How often do you book appointments or send reminders?"),
  t("s_t_content", "Social posts and content", "How often do you write social posts or marketing content?"),
  t("s_t_admin", "Reports and admin paperwork", "How often do you compile reports, invoices or admin paperwork?"),
  q("s_knowledge", "tools_data", "Where does business knowledge (prices, FAQs, processes) live?", ["People's heads and old chats", "Scattered across email and Drive", "A doc nobody fully trusts", "One kept-up source with an owner"]),
  q("s_stack", "tools_data", "Which tools run your day-to-day work?", ["Mostly paper, texts and memory", "Email and spreadsheets", "A CRM or booking tool we use some of the time", "A CRM, calendar and email we use every day"]),
  q("s_write", "tools_data", "Which systems can AI write to today (CRM, email, calendar)?", ["None, copy-paste only", "One test account", "A few tools, nobody checks", "Clear permissions, with a human for anything that can't be undone"]),
  q("s_fit", "tools_data", "Do off-the-shelf tools cover how your business works?", [APP("No, we need our own software built"), "Barely; lots of workarounds", "Mostly, with a few gaps", "Yes, our tools fit"]),
  q("s_data", "tools_data", "What happens to customer data in AI prompts?", ["People paste whatever", 'Informal "don\'t paste secrets"', "A written rule, not enforced", "Approved tools only, and private data stays out"]),
  q("s_hours", "time_budget", "How many hours a week could you put into setting up AI?", ["None right now", "About an hour", "2–4 hours", "5 or more hours"]),
  q("s_budget", "time_budget", "What monthly budget could go to AI tools and training?", ["Nothing yet", "Under $100", "$100–$500", "More than $500"]),
  q("s_roi", "time_budget", "How do you know if AI is paying for itself?", ["We don't", "Gut feel", "Hours saved on one task", "We track named numbers on a schedule"]),
  q("s_cost", "time_budget", "Do you know what you spend on AI each month?", ["No", "Surprise bills on a card", "A monthly total only", "Cost per job, with a cap"]),
  q("s_when", "time_budget", "When do you want time back from AI?", ["Someday", "In the next few months", "Next month", "This month"]),
  q("s_style", "hands_on", "How involved do you want to be in setting up your AI?", [DFY("Not at all; I want it done for me"), "I'll approve, someone else builds", "I'll build with guidance", "I want to build it myself"]),
  q("s_review", "hands_on", "Who would check your AI's work each week?", [DFY("I'd rather someone else handles it"), "Whoever has time", "Me, on a set day", "A named person, with a checklist"]),
  q("s_change", "hands_on", "Who should change how your AI behaves?", ["Anyone", "Only whoever built it", "Me, when something breaks", "Me or a named editor, with a change log"]),
  q("s_learn", "hands_on", "How do you like to learn new tools?", ["I don't want to learn it", "Watch someone else do it", "A guided class", "Try it myself and ask questions"]),
  q("s_runbook", "hands_on", "Could a new hire run your top AI job from a written card in one day?", ["No", "Only with a live walkthrough", "For one job", "Yes, for most of them"]),
];

// ===== Branch: Learn to build with AI =====
const LEARN: QuestionDef[] = [
  q("l_use", "ai_today", "How do you use AI today?", ["I've barely tried it", "Chat for one-off questions", "Saved prompts I reuse", "Agents with set jobs and tools"]),
  q("l_mix", "ai_today", "How much of your AI use is a repeatable job vs one-off chat?", ["All one-off", "A few reused prompts", "Some weekly jobs", "Most of it runs the same way each week"]),
  q("l_qa", "ai_today", "When the model is wrong, how do you catch it?", ["I usually don't", "Eventually, by accident", "I spot check", "I test against examples before trusting it"]),
  q("l_version", "ai_today", "How do you keep track of prompts and skills that work?", ["I don't", "Scattered notes", "One doc that drifts", "Versioned skills; old ones retired"]),
  q("l_escalate", "ai_today", "What should your AI do when it's unsure?", ["It just answers", "I decide each time", 'Informal "ask me"', "A built-in stop or handoff"]),
  t("l_t_inbox", "Email and inquiry replies", "How often do you answer the same questions by email or message?"),
  t("l_t_research", "Research and summaries", "How often do you research a topic and summarize it?"),
  t("l_t_content", "Writing and content drafts", "How often do you draft posts, articles or scripts?"),
  t("l_t_followup", "Lead follow-up", "How often do you follow up with leads or clients?"),
  t("l_t_data", "Spreadsheet and data cleanup", "How often do you clean up or move data between spreadsheets and tools?"),
  q("l_knowledge", "tools_data", "Where does the knowledge you'd give an agent live?", ["In my head", "Email and Drive", "A doc I don't fully trust", "One kept-up source"]),
  q("l_accounts", "tools_data", "Which AI tools do you have accounts with?", ["None", "One free chat tool", "One paid tool", "Several, with an agent builder"]),
  q("l_connect", "tools_data", "Have you connected AI to your email, calendar or CRM?", ["No", "I've thought about it", "One connection, set up once", "Several, and I know what each can do"]),
  q("l_fit", "tools_data", "What would you most like to build?", [APP("My own app or software product"), "Not sure yet", "A helper for one task", "Agents that run real jobs in my business"]),
  q("l_data", "tools_data", "What's your rule for private data in prompts?", ["No rule", "I try to be careful", "A written rule", "Approved tools only, private data stays out"]),
  q("l_hours", "time_budget", "How many hours a week can you spend learning to build?", ["None right now", "About an hour", "2–4 hours", "5 or more hours"]),
  q("l_budget", "time_budget", "What monthly budget could go to AI training and tools?", ["Nothing yet", "Under $100", "$100–$500", "More than $500"]),
  q("l_live", "time_budget", "Can you make a weekly live session?", ["No", "Rarely", "Most weeks", "Every week"]),
  q("l_cost", "time_budget", "Do you know what you spend on AI each month?", ["No", "Roughly", "A monthly total", "Cost per job, with a cap"]),
  q("l_when", "time_budget", "When do you want your first working agent?", ["Someday", "In a few months", "Next month", "This month"]),
  q("l_style", "hands_on", "How do you want to learn?", [DFY("I'd rather someone build it for me"), "Watch and copy", "A guided class with homework", "Build on my real work with feedback"]),
  q("l_build", "hands_on", "How comfortable are you setting up tools yourself?", ["Not at all", "With step-by-step help", "Fairly comfortable", "Very; I like tinkering"]),
  q("l_coach", "hands_on", "How much one-on-one help do you want?", ["None", "Only when stuck", "Some regular check-ins", "Close coaching on my own builds"]),
  q("l_change", "hands_on", "Who will maintain what you build?", [DFY("I'd want someone else to maintain it"), "Not sure", "Me, when it breaks", "Me, with a change log"]),
  q("l_runbook", "hands_on", "Could you write down how your best AI workflow runs so someone else could use it?", ["No", "With help", "For one workflow", "Yes, for several"]),
];

// ===== Branch: Get it done for me =====
const DFYQ: QuestionDef[] = [
  q("d_use", "ai_today", "How does your business use AI today?", ["It doesn't", "A few people use chat tools", "A couple of repeatable jobs", "Several jobs with owners"]),
  q("d_owner", "ai_today", "Who would be our main contact for the setup?", ["Not sure yet", "Whoever is free", "A manager, part-time", "A named owner with time set aside"]),
  q("d_qa", "ai_today", "How do you check work before it reaches a customer?", ["We don't", "The author rereads it", "A second person reviews", "A checklist for each channel"]),
  q("d_allow", "ai_today", "Do you know which jobs you'd let AI do on its own?", ["No idea", "A rough idea", "1–2 jobs", "A written list with limits"]),
  q("d_bus", "ai_today", "Are your key processes written down?", ["No", "A few notes", "Some, partly current", "Yes, and kept current"]),
  t("d_t_inbox", "Email and inquiry replies", "How often does your team answer the same inquiries?"),
  t("d_t_followup", "Quote and lead follow-up", "How often does your team follow up on quotes or leads?"),
  t("d_t_sched", "Scheduling and reminders", "How often does your team book appointments or send reminders?"),
  t("d_t_content", "Social posts and content", "How often does your team create marketing content?"),
  t("d_t_admin", "Reports and admin paperwork", "How often does your team compile reports or admin paperwork?"),
  q("d_knowledge", "tools_data", "Where does your business knowledge live?", ["People's heads", "Email and Drive", "A wiki nobody fully trusts", "One kept-up source with owners"]),
  q("d_stack", "tools_data", "Which tools run the business?", ["Paper and texts", "Email and spreadsheets", "A CRM used some of the time", "A CRM, calendar and email used daily"]),
  q("d_access", "tools_data", "Could you give us admin access to those tools?", ["No", "Not sure who has it", "Yes, with some digging", "Yes, today"]),
  q("d_fit", "tools_data", "Do your current tools fit how you work?", [APP("No, we need our own software built"), "Barely", "Mostly", "Yes"]),
  q("d_data", "tools_data", "How do you handle customer data today?", ["No rules", "Informal care", "A written policy", "A policy with controls"]),
  q("d_budget", "time_budget", "Is a $4,999 one-time setup within budget?", ["No", "Not this quarter", "Probably", "Yes"]),
  q("d_when", "time_budget", "When do you want it running?", ["Someday", "In a few months", "Next month", "This month"]),
  q("d_time", "time_budget", "How much time can your team give us during setup?", ["None", "An hour total", "An hour a week", "A few hours a week"]),
  q("d_roi", "time_budget", "How will you judge whether the setup worked?", ["Not sure", "Gut feel", "Hours saved", "Named numbers we already track"]),
  q("d_cost", "time_budget", "Do you know what you spend on AI tools now?", ["No", "Roughly", "A monthly total", "Per tool, with a cap"]),
  q("d_style", "hands_on", "How involved do you want to be?", [DFY("Not at all; handle it for me"), "Approve the big decisions", "Review each step", "Work alongside you"]),
  q("d_review", "hands_on", "After setup, who checks the AI's work?", [DFY("We'd want you to keep handling it"), "Whoever has time", "A named person", "A named person, with a checklist"]),
  q("d_train", "hands_on", "Do you want your team trained to run it?", ["No", "One short handover", "A few sessions", "Yes, until they can run it alone"]),
  q("d_change", "hands_on", "Who should be allowed to change the AI's behavior later?", ["Anyone", "Only you (Pragvance)", "One person on our side", "Named editors, with a change log"]),
  q("d_runbook", "hands_on", "Would you want written run cards for each AI job?", ["No need", "Maybe", "For the main job", "Yes, for every job"]),
];

// ===== Branch: Build an app =====
const APPQ: QuestionDef[] = [
  q("a_use", "ai_today", "How do you use AI today?", ["Not at all", "Chat for one-off questions", "A few repeatable jobs", "AI is part of how we run"]),
  q("a_idea", "ai_today", "How clear is the app idea?", ["A rough feeling", "A problem, no solution yet", "A written list of features", "A written spec with users and screens"]),
  q("a_users", "ai_today", "Who would use the app?", ["Not sure", "Just me", "My team", "Customers or the public"]),
  q("a_tried", "ai_today", "Have you tried building it already (no-code, AI builders, freelancers)?", ["No", "Looked into it", "Started, then stalled", "Have a working prototype"]),
  q("a_qa", "ai_today", "How would you know the app works?", ["Not sure", "I'd try it", "A few people would test it", "A written list of what must work"]),
  t("a_t_entry", "Manual data entry", "How often does someone type the same data into more than one place?"),
  t("a_t_sched", "Booking and scheduling", "How often do bookings or schedules get managed by hand?"),
  t("a_t_reports", "Reports and dashboards", "How often do you build the same report by hand?"),
  t("a_t_inbox", "Customer requests and replies", "How often do you handle the same customer requests?"),
  t("a_t_billing", "Quotes, invoices and payments", "How often do you create quotes or invoices by hand?"),
  q("a_data", "tools_data", "Where does the data the app needs live?", ["Paper or heads", "Spreadsheets", "One main tool", "Several tools with exports or APIs"]),
  q("a_stack", "tools_data", "Which tools would the app need to connect to?", ["Not sure", "One", "Two or three", "We have a list"]),
  q("a_fit", "tools_data", "Why can't an existing tool do this?", ["Not sure it can't", "Too expensive", "Missing key features", APP("Nothing fits how we work")]),
  q("a_own", "tools_data", "Do you want to own the code and data?", ["Don't care", "Nice to have", "Probably", APP("Yes, that matters")]),
  q("a_priv", "tools_data", "Will the app handle private customer data?", ["Not sure", "Some", "Yes, with known rules", "Yes, and we know our rules"]),
  q("a_budget", "time_budget", "Have you set a budget for the build?", ["No", "A rough number", "A range", "An approved budget"]),
  q("a_when", "time_budget", "When do you need a first version?", ["No date", "Within a year", "Within a few months", "Within weeks"]),
  q("a_time", "time_budget", "How much time can you give to planning and reviews?", ["None", "An hour total", "An hour a week", "A few hours a week"]),
  q("a_after", "time_budget", "Have you budgeted for hosting and upkeep after launch?", ["No", "Not yet", "Roughly", "Yes"]),
  q("a_roi", "time_budget", "How will you judge whether the app paid off?", ["Not sure", "Gut feel", "Time saved", "Named numbers we track"]),
  q("a_style", "hands_on", "How involved do you want to be in the build?", [DFY("Not at all; build it for me"), "Approve the big decisions", "Review each milestone", "Work alongside the build"]),
  q("a_spec", "hands_on", "Who signs off on the spec?", ["Not sure", "Whoever is free", "Me", "Me, with named reviewers"]),
  q("a_test", "hands_on", "Who would test new versions?", ["No one", "Me, when I can", "Me, on a schedule", "A small group of real users"]),
  q("a_change", "hands_on", "How should changes be handled after launch?", ["Ad hoc", "Email us when needed", "A request list", "A priced change list with an owner"]),
  q("a_runbook", "hands_on", "Do you want docs so someone else could run the app?", ["No need", "Maybe", "Basic docs", "Yes, full handover docs"]),
];

export const QUESTION_SETS: Record<BranchId, readonly QuestionDef[]> = { save: SAVE, learn: LEARN, dfy: DFYQ, app: APPQ };

// =====================================================================
// Tailored recommendation screen (deterministic templates, no AI).
// Mark: edit the wording below freely. Placeholders: {tasks}, {task1}, {offer}, {price}.
// =====================================================================

/** Which question in each branch measures hours available and budget (answer index 0–3). */
export const SIGNAL_QUESTIONS: Record<BranchId, { hours: string; budget: string }> = {
  save: { hours: "s_hours", budget: "s_budget" },
  learn: { hours: "l_hours", budget: "l_budget" },
  dfy: { hours: "d_time", budget: "d_budget" },
  app: { hours: "a_time", budget: "a_budget" },
};

/**
 * Solo vs team detection. Each listed answer adds one "solo" or "team" vote.
 * More solo votes than team = solo; more team = team; tie or none = unknown.
 */
export const SOLO_TEAM_SIGNALS: Record<string, Partial<Record<0 | 1 | 2 | 3, "solo" | "team">>> = {
  // Save time
  s_owner: { 1: "team", 2: "team" }, // "A few people on their own", "A manager who also handles AI"
  s_review: { 2: "solo", 3: "team" }, // "Me, on a set day" vs "A named person, with a checklist"
  s_change: { 2: "solo" }, // "Me, when something breaks"
  s_runbook: { 1: "team", 3: "team" }, // thinking about a new hire running it
  // Learn
  l_change: { 2: "solo", 3: "solo" }, // "Me, when it breaks" / "Me, with a change log"
  l_runbook: { 3: "team" }, // written for someone else, several workflows
  // Get it done for me
  d_owner: { 2: "team", 3: "team" }, // a manager / named owner
  d_review: { 2: "team", 3: "team" },
  d_train: { 2: "team", 3: "team" }, // wants their team trained
  // Build an app
  a_users: { 1: "solo", 2: "team" }, // "Just me" vs "My team"
  a_spec: { 2: "solo", 3: "team" }, // "Me" vs "Me, with named reviewers"
  a_test: { 1: "solo", 3: "team" },
};

/** Area thresholds (each area is 0–15). */
export const SIGNAL_THRESHOLDS = { handsOnHigh: 10, handsOnLow: 5, readyHigh: 10, readyLow: 5 } as const;

/**
 * Conditions a why-line can use:
 *  solo, team, hours_low (answer 0–1), hours_high (2–3), budget_low (0–1), budget_high (2–3),
 *  hands_on_high, hands_on_low, ready_high, ready_low (ready = "How you use AI today" area),
 *  has_tasks (at least one top task), always.
 */
export type WhyCondition =
  | "solo" | "team" | "hours_low" | "hours_high" | "budget_low" | "budget_high"
  | "hands_on_high" | "hands_on_low" | "ready_high" | "ready_low" | "has_tasks" | "always";

export type OfferTemplates = {
  /** Headline: first entry whose condition matches wins. Last one should be "always". */
  headlines: { when: WhyCondition; text: string }[];
  /** Why-lines in priority order. Up to 3 matching lines are shown; "always" lines fill in when fewer than 2 match. Keep two "always" lines per offer. */
  why: { when: WhyCondition; text: string }[];
};

export const WHY_LIMITS = { min: 2, max: 3 } as const;

export const TEMPLATES: Record<OfferId, OfferTemplates> = {
  // Tone: friendly, practical, low-pressure starter.
  workforce: {
    headlines: [
      { when: "solo", text: "Based on your answers, you're running this solo, so AI Workforce is the right start." },
      { when: "team", text: "Based on your answers, AI Workforce is the right start for you and your team." },
      { when: "always", text: "Based on your answers, AI Workforce is the right place to start." },
    ],
    why: [
      { when: "has_tasks", text: "You named {tasks} as work that keeps coming back. Those make good first agents to build in class." },
      { when: "ready_low", text: "You're early with AI, so a weekly class that walks you through it step by step fits better than a big setup." },
      { when: "hours_low", text: "You have limited hours right now, and AI Workforce lets you go at your own pace each week." },
      { when: "budget_low", text: "At {price}, it keeps your spend small while you learn what works for your business." },
      { when: "solo", text: "As a solo operator, you'll build on your own real work, with a community on Skool to ask when you're stuck." },
      { when: "always", text: "You can start small, build one agent, and grow from there." },
      { when: "always", text: "Classes and the community live on Skool, so help is there between sessions." },
    ],
  },
  // Tone: encouraging, "you're ready for a real build".
  workforce_bot: {
    headlines: [
      { when: "solo", text: "Based on your answers, you're ready for more: join AI Workforce and let us build your first custom agent." },
      { when: "team", text: "Based on your answers, your team is ready for a custom agent alongside AI Workforce." },
      { when: "always", text: "Based on your answers, we recommend AI Workforce plus a custom Grok Bot agent." },
    ],
    why: [
      { when: "has_tasks", text: "{task1} came up most often in your answers. That's a strong first job for a custom agent." },
      { when: "hands_on_high", text: "You want to stay hands-on, so you'll keep learning in AI Workforce while we build the first agent with you." },
      { when: "hours_low", text: "Your time is tight, so having the first agent built for you saves you the trial and error." },
      { when: "team", text: "Others in your business touch this work, so one shared agent with a clear job keeps everyone on the same page." },
      { when: "solo", text: "You're carrying this yourself, so one agent that takes a repeat task off your plate is the quickest win." },
      { when: "always", text: "The 30-minute consultation turns your answers into a clear job for your agent." },
      { when: "always", text: "Pricing is {price}, and the custom agent includes the 30-minute consultation." },
    ],
  },
  // Tone: direct, confident, peer-to-peer coaching.
  shadow_lab: {
    headlines: [
      { when: "solo", text: "Based on your answers, we really recommend Shadow Lab, so you're not building this alone." },
      { when: "team", text: "Based on your answers, we really recommend Shadow Lab for you and the people building with you." },
      { when: "always", text: "Based on your answers, we really recommend Shadow Lab." },
    ],
    why: [
      { when: "ready_high", text: "You already run AI on real work. Live coaching is where you'll tighten it, not a beginner class." },
      { when: "hands_on_high", text: "You want to build it yourself, and Shadow Lab gives you a coach next to you while you do." },
      { when: "hours_high", text: "You have hours to put in each week, so a two-hour working session gets used, not wasted." },
      { when: "budget_high", text: "The budget you described leaves room for {price}." },
      { when: "has_tasks", text: "We'd start with {tasks}, the work you said repeats most." },
      { when: "always", text: "Each session works on your own business, not on examples." },
      { when: "always", text: "Start with one session or go monthly: {price}." },
    ],
  },
  // Tone: reassuring, "we handle it".
  dfy: {
    headlines: [
      { when: "solo", text: "Based on your answers, you're running this solo, so let us set it up for you with Done-for-You." },
      { when: "team", text: "Based on your answers, Done-for-You is the right fit: we set it up and hand it to your team." },
      { when: "always", text: "Based on your answers, we recommend Done-for-You. We set it up for you." },
    ],
    why: [
      { when: "hands_on_low", text: "You told us you'd rather not do the setup yourself, so we take it off your plate." },
      { when: "has_tasks", text: "We'd start by handing {tasks} to AI." },
      { when: "hours_low", text: "You don't have hours to spare for setup, and with Done-for-You you mostly don't need them." },
      { when: "team", text: "Your team gets a working setup plus a handover, instead of learning it from scratch." },
      { when: "solo", text: "You're already doing everything yourself; this is one less thing to learn." },
      { when: "always", text: "It's a {price} one-time setup, and you approve what goes live." },
      { when: "always", text: "We start from your answers here, so the first call is about your business from minute one." },
    ],
  },
  // Tone: thoughtful, scoping-first; never names a price.
  app: {
    headlines: [
      { when: "team", text: "Based on your answers, your team needs its own app, and the next step is a planning sprint." },
      { when: "always", text: "Based on your answers, what you need is your own app. Let's plan it properly first." },
    ],
    why: [
      { when: "has_tasks", text: "{tasks} keep coming up, and an app built around how you work could handle them in one place." },
      { when: "ready_high", text: "You already have a clear idea and some groundwork, so a sprint can lock the spec quickly." },
      { when: "ready_low", text: "The idea is still forming, and the planning sprint turns it into a written spec before anyone writes code." },
      { when: "solo", text: "It's mainly for you right now, so we'll keep the first version small." },
      { when: "team", text: "Several people would use it, so we'll map who does what before building." },
      { when: "always", text: "The sprint ends with a locked spec and a quote, so you know the scope before you commit." },
      { when: "always", text: "There's no price yet: the quote comes from the locked spec, not a guess." },
    ],
  },
};
