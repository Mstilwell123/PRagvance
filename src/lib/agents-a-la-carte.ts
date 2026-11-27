/**
 * Buyer-facing roster for Agents a la Carte.
 * Copy stays commercial-safe: no invented metrics, reviews, or client names.
 */

export const AGENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "executive-operations", label: "Executive & Operations" },
  { id: "revenue-sales", label: "Revenue & Sales" },
  { id: "web-apps-growth", label: "Web, Apps & Growth" },
  { id: "content-efficiency", label: "Content & Efficiency" },
] as const;

export type AgentFilterId = (typeof AGENT_CATEGORIES)[number]["id"];
export type AgentCategoryId = Exclude<AgentFilterId, "all">;
export type AgentStatus = "available" | "coming-soon";

export type Agent = {
  number: number;
  slug: string;
  title: string;
  category: AgentCategoryId;
  status: AgentStatus;
  summary: string;
  does: string;
  weekOne: string;
  connectorNote: string;
};

export const ONBOARDING_QUESTIONS = [
  "What does the business sell, and who is it for?",
  "Which job should this agent own first?",
  "What CSV, PDF, or paste will you use on day one?",
  "What does a useful Week-1 deliverable look like for you?",
  "What must this agent never do without asking you first?",
] as const;

const CATEGORY_LABEL: Record<AgentCategoryId, string> = {
  "executive-operations": "Executive & Operations",
  "revenue-sales": "Revenue & Sales",
  "web-apps-growth": "Web, Apps & Growth",
  "content-efficiency": "Content & Efficiency",
};

export function categoryLabel(id: AgentCategoryId): string {
  return CATEGORY_LABEL[id];
}

export const AGENTS: readonly Agent[] = [
  {
    number: 1,
    slug: "chief-of-staff",
    title: "Chief of Staff",
    category: "executive-operations",
    status: "available",
    summary:
      "Turns notes you already have into a Monday brief: decisions, waiting items, and the next owner.",
    does: "Chief of Staff keeps one week of the business in view. You give it a calendar paste, an email export, or a notes file. It returns a brief that separates decisions only you can make, items that can wait, and the next step with a named owner. It does not send email or book meetings.",
    weekOne:
      "A one-page Monday brief built from a CSV, PDF, or paste you supply, plus the blank brief you can reuse the next week.",
    connectorNote:
      "A calendar or inbox connection is optional and is not required on day one. The first brief runs from a paste or an export. The kit is installed in your Grok Bot desktop app.",
  },
  {
    number: 2,
    slug: "app-builder",
    title: "App Builder",
    category: "web-apps-growth",
    status: "available",
    summary:
      "Turns a product idea into a first-slice brief: screens, the path a user takes, and what the app must remember.",
    does: "App Builder writes the brief a build can start from. It asks what the app is for, who uses it, and what the first session must accomplish. You get the screens, a click path, and the data the first slice has to store. It does not ship a store listing or invent usage numbers.",
    weekOne:
      "A one-page app brief and a click path for the first screen, drafted from your answers and any notes you paste.",
    connectorNote:
      "No hosting account, app-store account, or design-tool login is required to produce the brief. Those accounts are optional later, and only if you choose to publish.",
  },
  {
    number: 3,
    slug: "website-builder",
    title: "Website Builder",
    category: "web-apps-growth",
    status: "available",
    summary:
      "Drafts the pages, headlines, and facts a business site has to state, from copy you already have.",
    does: "Website Builder reads your current site text, a PDF, or a paste of what you sell, and proposes a sitemap with a homepage outline. Each page gets a headline and the facts it must include. It does not publish the site or register a domain.",
    weekOne: "A sitemap and a homepage outline written only from the copy, PDF, or paste you provide.",
    connectorNote:
      "A domain, host, or website-builder login is not required for the outline. Connecting one later is optional.",
  },
  {
    number: 4,
    slug: "deep-dive-research",
    title: "Deep Dive Research",
    category: "content-efficiency",
    status: "available",
    summary:
      "Reads sources you provide and returns a brief that says what the material supports and what it does not.",
    does: "Deep Dive Research works from documents and notes you supply. The brief cites those sources, separates what they say from what is still open, and marks any claim that still needs a primary source. It does not fill gaps with statistics you did not provide.",
    weekOne:
      "One sourced brief on a question you choose, with each point tied back to a file or passage you provided.",
    connectorNote:
      "No research-database subscription is required. If a source sits behind a login you do not have, the brief says that source was not available.",
  },
  {
    number: 5,
    slug: "sales-manager",
    title: "Sales Manager",
    category: "revenue-sales",
    status: "available",
    summary:
      "Turns a pipeline export into a weekly standup: what moved, what stalled, and the next question on each open deal.",
    does: "Sales Manager reads a CSV or a pasted list of open deals. It groups them by what your notes say happened, names the stalled ones, and writes the next question to ask. It does not email prospects or edit a CRM.",
    weekOne:
      "A pipeline standup from a CSV or pasted deal list, covering the open rows you included and no deals you left out.",
    connectorNote:
      "A CRM login is optional and is not used on day one. Export the rows or paste them. The kit does not ask for CRM credentials to produce the first standup.",
  },
  {
    number: 6,
    slug: "chief-revenue-officer",
    title: "Chief Revenue Officer (CRO)",
    category: "revenue-sales",
    status: "available",
    summary:
      "Writes a one-page revenue note from your pipeline and a plain description of how you sell today.",
    does: "The Chief Revenue Officer (CRO) reads the offers, follow-ups, and pipeline rows you provide. The note says where deals are stuck, which offer you are actually leading with, and what to stop doing this week. It does not forecast a revenue number you did not supply.",
    weekOne:
      "A one-page revenue note built from your pipeline export and a short written description of how you sell.",
    connectorNote:
      "CRM, billing, and ad accounts are optional. Day one uses the export and the description you paste. No ad account is required.",
  },
  {
    number: 7,
    slug: "chief-operating-officer",
    title: "Chief Operating Officer",
    category: "executive-operations",
    status: "available",
    summary: "Maps who does what in a typical week and which handoff should be written down first.",
    does: "The Chief Operating Officer turns a process doc, an SOP, or your written description of a normal week into an operating map. It names the handoffs, any missing owner, and the first routine worth running on a schedule. It does not assign work to your staff.",
    weekOne:
      "A one-page operating map of one workflow, with the steps and owners you provided and a marked gap where an owner is missing.",
    connectorNote:
      "Project-tool and inbox connections are optional. A document, PDF, or paste is enough for the first map.",
  },
  {
    number: 8,
    slug: "opportunity-analyst",
    title: "Opportunity Analyst",
    category: "revenue-sales",
    status: "available",
    summary:
      "Compares opportunities you are considering against criteria you write down, without an invented market size.",
    does: "Opportunity Analyst lines up the options you name and scores them only on criteria you supply, such as fit, effort, and what would make you walk away. Missing facts stay missing. It does not estimate a market or a win rate.",
    weekOne:
      "A side-by-side note on up to three opportunities, using only the criteria and facts you wrote down.",
    connectorNote:
      "No market-data subscription is required. Outside sources are included only if you paste them. The kit does not log into a data vendor on day one.",
  },
  {
    number: 9,
    slug: "strategy-advisor",
    title: "Strategy & Judgment Advisor",
    category: "executive-operations",
    status: "available",
    summary:
      "Pressure-tests one decision: the choice, the assumptions, the downside, and the question you still cannot answer.",
    does: "Strategy & Judgment Advisor writes a decision memo from your notes. It states the choice in your words, lists the assumptions, names the downside, and ends on the next question rather than a forecast. It does not tell you the decision is safe.",
    weekOne: "A decision memo on one real choice, with assumptions and downsides taken from the notes you paste.",
    connectorNote:
      "No strategy tool or data-warehouse account is required. The memo is built from your notes. Any outside report has to be pasted in.",
  },
  {
    number: 10,
    slug: "news-curator",
    title: "News & Media Curator",
    category: "content-efficiency",
    status: "available",
    summary:
      "Sorts articles and links you already saved into a short briefing of what changed and what you can ignore.",
    does: "News & Media Curator works from a paste, a PDF, or a list of items you saved. The briefing says what each item is about, which ones touch the business you described, and which ones you can skip. It does not browse the open web on day one.",
    weekOne:
      "A first briefing from the saved items you paste or upload, with each item marked keep, skim, or skip.",
    connectorNote:
      "News subscriptions and social logins are not required. You bring the items. Connecting a feed later is optional and is not part of the day-one kit.",
  },
  {
    number: 11,
    slug: "board-admin",
    title: "Board & Governance Admin",
    category: "executive-operations",
    status: "available",
    summary: "Turns a board pack or a set of notes into an agenda, a decision log, and a follow-up list.",
    does: "Board & Governance Admin reads the pack or notes you provide and drafts an agenda in the order the material supports, a log of decisions that were actually recorded, and follow-ups with the owner and date when you supplied them. It does not invent motions or votes.",
    weekOne:
      "A draft agenda and a decision log from your last board pack (PDF or paste), or from notes if you do not have a pack yet.",
    connectorNote:
      "A board-portal login is optional. Upload the PDF or paste the notes. The kit does not ask for portal credentials on day one.",
  },
  {
    number: 12,
    slug: "task-manager",
    title: "Task & Execution Manager",
    category: "executive-operations",
    status: "available",
    summary: "Converts a messy task list into a seven-day plan: due, blocked, and the next action.",
    does: "Task & Execution Manager takes a pasted list or a CSV and sorts it into this week. Each item is marked due, blocked, or later. Blocked items name what they are waiting on when you wrote that down. It does not message your team.",
    weekOne: "A seven-day plan from your pasted list or CSV, using only the tasks and dates you included.",
    connectorNote:
      "A task-app login is optional. Export or paste the list. Day one does not connect to a task app.",
  },
  {
    number: 13,
    slug: "filing-organizer",
    title: "Knowledge & Filing Organizer",
    category: "content-efficiency",
    status: "available",
    summary: "Proposes a folder map for documents you already have, and an index with plain file names.",
    does: "Knowledge & Filing Organizer reads a file list or the documents you upload and proposes where each one belongs. The index uses plain names and leaves a question on anything it cannot classify from the text you provided. It does not delete files.",
    weekOne:
      "A folder map and a renamed index of the files you list or upload. Nothing is moved in a live drive unless you later choose to connect one.",
    connectorNote:
      "A cloud-drive login is optional. A file list, a zip, or PDFs you upload are enough. The kit says so before any drive connection is offered.",
  },
  {
    number: 14,
    slug: "operations-mapper",
    title: "Operations Knowledge Mapper",
    category: "executive-operations",
    status: "available",
    summary: "Writes a process map for one workflow, and marks steps that were never written down.",
    does: "Operations Knowledge Mapper drafts the map from an SOP, a transcript, or answers you paste. Steps you stated are marked as stated. Steps that are only implied are marked as gaps so you can confirm them. It does not claim the map is complete.",
    weekOne: "A process map for one workflow, with stated steps and open gaps kept separate.",
    connectorNote:
      "No operations-tool account is required. A document or a paste is the day-one input. Connecting a wiki later is optional.",
  },
  {
    number: 15,
    slug: "hack-bot",
    title: "Hack Bot — Money & Time Saver",
    category: "content-efficiency",
    status: "available",
    summary:
      "Finds repeated tasks and listed charges in a week of your own notes, then turns one leak into a checklist.",
    does: "Hack Bot — Money & Time Saver reads notes you paste and a list of recurring charges if you include one. It points at repeated tasks and charges you listed, then writes a checklist for the first one you could change. It does not promise an amount saved, and it does not see accounts you did not export.",
    weekOne: "A short leak list and one checklist, built only from the notes and the charge list you provide.",
    connectorNote:
      "No bank, card, or subscription login is required or requested. You paste the list or upload a CSV or PDF you exported yourself. A bank connection is not part of this kit.",
  },
  {
    number: 16,
    slug: "social-media-manager",
    title: "Social Media Manager",
    category: "content-efficiency",
    status: "coming-soon",
    summary: "Will draft a week of posts from your offer and examples you approve. It will not post for you.",
    does: "When the kit is ready, Social Media Manager will draft a seven-day set of posts from the offer you describe and examples you approve. You edit them and you post them. The kit will not log into a social account or publish on its own.",
    weekOne:
      "When the kit is available: a seven-day draft calendar and captions you can edit. The kit is not for sale yet. Join the waitlist and Pragvance.ai will email you when self-serve setup opens.",
    connectorNote:
      "Social accounts are optional and are not required to draft posts. The kit will not ask for posting passwords. Publishing stays with you. This kit is not available for setup yet.",
  },
  {
    number: 17,
    slug: "content-marketer",
    title: "Content Marketer",
    category: "content-efficiency",
    status: "coming-soon",
    summary: "Will turn one offer into a content plan and a first article outline. The kit is not for sale yet.",
    does: "When the kit is ready, Content Marketer will name the reader, the questions that reader asks, and an outline for one article based on the offer you describe. It will not invent customer quotes or performance numbers.",
    weekOne:
      "When the kit is available: a one-page content plan and one article outline from your offer description. Join the waitlist. Nothing is delivered until the kit is ready.",
    connectorNote:
      "A blog host, email tool, or analytics login is not required for the plan. Those accounts would stay optional. This kit is not available for setup yet.",
  },
  {
    number: 18,
    slug: "subscription-auditor",
    title: "Subscription & Bill Auditor",
    category: "content-efficiency",
    status: "coming-soon",
    summary:
      "Will read a charge export you provide and flag duplicates, tools you marked unused, and renewals listed in the file.",
    does: "When the kit is ready, Subscription & Bill Auditor will read a CSV or PDF of recurring charges you exported. It lists duplicates, items you marked unused, and renewal dates that appear in the file. It will not guess what you do not use, and it will not see a bank directly.",
    weekOne:
      "When the kit is available: an audit worksheet from the CSV or PDF you provide. Join the waitlist. No audit runs until the kit is ready.",
    connectorNote:
      "No bank or card login is part of this kit. You would export the statement yourself. This kit is not available for setup yet.",
  },
  {
    number: 19,
    slug: "short-form-video-marketer",
    title: "Short-Form Video Marketer",
    category: "content-efficiency",
    status: "coming-soon",
    summary: "Will turn one idea into a short-form script with a hook, beats, and an on-screen line.",
    does: "When the kit is ready, Short-Form Video Marketer will write one script from a topic you provide: a hook, the beats, and the line that appears on screen. It will not film, edit, or publish the video.",
    weekOne:
      "When the kit is available: one script and a shot list from a topic you write down. Join the waitlist. No script is produced until the kit is ready.",
    connectorNote:
      "A video tool or social account is not required to receive the script. Publishing accounts stay optional and are not requested. This kit is not available for setup yet.",
  },
  {
    number: 20,
    slug: "agent-architect",
    title: "Agent Architect & Quality Reviewer",
    category: "web-apps-growth",
    status: "coming-soon",
    summary:
      "Will review one agent you already run: the job, the vague instructions, and a test to run before you trust the output.",
    does: "When the kit is ready, Agent Architect & Quality Reviewer will read the instructions and a sample output you paste. The review names the job, the lines that are vague, and a test you can run on the next real task. It will not score the agent with a made-up quality percent.",
    weekOne:
      "When the kit is available: a written review of one agent from the instructions and sample you paste. Join the waitlist. No review is produced until the kit is ready.",
    connectorNote:
      "No extra tool account is required. You paste the instructions and a sample. Access to any other agent platform would be optional and is not requested on day one. This kit is not available for setup yet.",
  },
];

export function agentBySlug(slug: string | null | undefined): Agent | undefined {
  const key = (slug || "").trim().toLowerCase();
  return AGENTS.find((agent) => agent.slug === key);
}

export function agentsForFilter(filter: AgentFilterId): readonly Agent[] {
  if (filter === "all") return AGENTS;
  return AGENTS.filter((agent) => agent.category === filter);
}

export function parseAgentFilter(value: string | null | undefined): AgentFilterId {
  const key = (value || "").trim().toLowerCase();
  const match = AGENT_CATEGORIES.find((category) => category.id === key);
  return match ? match.id : "all";
}

export function agentContactHref(slug: string): string {
  return `/contact?agent=${encodeURIComponent(slug)}`;
}

export function agentPath(slug: string): string {
  return `/agents-a-la-carte/${slug}`;
}

export function agentInquiry(agent: Agent): { note: string; message: string } {
  if (agent.status === "coming-soon") {
    return {
      note: `${agent.title} is Coming Soon. This form joins the waitlist. It does not take payment.`,
      message: `Please add me to the waitlist for ${agent.title}.`,
    };
  }
  return {
    note: `${agent.title} is a $99 one-time self-serve kit. This form does not take payment. Add a line if you also want the optional 60-minute live setup call ($199–$249).`,
    message: `I want the ${agent.title} self-serve kit ($99 one-time).`,
  };
}

export function statusLabel(status: AgentStatus): "Available" | "Coming Soon" {
  return status === "available" ? "Available" : "Coming Soon";
}

export function detailBadge(status: AgentStatus): string {
  return status === "available" ? "$99 one-time self-serve kit" : "Coming Soon";
}

export function primaryCta(status: AgentStatus): string {
  return status === "available" ? "Get this agent — $99" : "Join waitlist";
}
