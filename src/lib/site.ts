export const SITE = {
  name: "Pragvance",
  legal: "PRAGVANCE LLC",
  tagline: "Practical AI. Built to advance your business.",
  url: "https://pragvance.ai",
  email: "support@pragvance.ai",
  location: "Oregon, USA",
  swarmUrl: "https://www.skool.com/agentswarmbypragvance",
  swarmPrice: "$99/mo",
  /** @deprecated Prefer OFFERS / CTA labels — kept for short display */
  labSeat: "$497",
  labMonth: "$997/mo",
  consultingPrice: "$100",
  consultingDuration: "60 min 1:1",
} as const;

/** Pay-first offer_ids — App Builder / Stripe checkout. Do not invent Calendly URLs. */
export const OFFER_IDS = {
  shadowLabGroup: "shadow_lab_group",
  shadowLabMonthly: "shadow_lab_monthly",
  consulting1hr: "consulting_1hr",
} as const;

export type OfferId = (typeof OFFER_IDS)[keyof typeof OFFER_IDS];

export const OFFERS = {
  shadow_lab_group: {
    id: "shadow_lab_group" as const,
    name: "Group Training",
    priceLabel: "$497",
    priceNote: "one-time",
    duration: "120 min",
    format: "up to 10 on Google Meet",
    cta: "Group Training — $497 · up to 10 on Google Meet · 120 min",
    href: "/shadow-lab-group",
    cancelOffer: "shadow_lab_group",
  },
  shadow_lab_monthly: {
    id: "shadow_lab_monthly" as const,
    name: "Lab Monthly",
    priceLabel: "$997/mo",
    priceNote: "monthly",
    duration: "60 min",
    format: "1:1 Google Meet",
    cta: "Lab Monthly — $997/mo · 1:1 Google Meet (60 min)",
    href: "/shadow-lab-monthly",
    cancelOffer: "shadow_lab_monthly",
  },
  consulting_1hr: {
    id: "consulting_1hr" as const,
    name: "Consulting",
    priceLabel: "$100",
    priceNote: "one-time",
    duration: "60 min",
    format: "1:1",
    cta: "$100/hr · 60 min 1:1",
    href: "/consulting",
    cancelOffer: "consulting_1hr",
  },
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/swarm", label: "Agent Swarm" },
  { href: "/shadow-lab-group", label: "Group Training" },
  { href: "/shadow-lab-monthly", label: "Lab Monthly" },
  { href: "/consulting", label: "Consulting" },
  { href: "/assessment", label: "AI Assessment" },
  { href: "/apps", label: "Apps" },
  { href: "/contact", label: "Contact" },
] as const;

export const FAQ = [
  {
    q: "What is Pragvance?",
    a: "Pragvance helps you staff a Grok Bot department — roles, skills, tools, and routines — and ships apps & SaaS when the work needs a product. Practical AI built to advance your business.",
  },
  {
    q: "What is the Agent Swarm?",
    a: "The Swarm is weekly live training on Skool ($99/mo) to build a Grok Bot agent team for your business — from your first bot to roles and agents that work together. Classroom + community stay on Skool; we teach, you build on your real work.",
  },
  {
    q: "How is Shadow Lab different from The Swarm?",
    a: "The Swarm is the self-paced / weekly classroom track on Skool. Shadow Lab is live high-touch training: Group Training ($497 · up to 10 on Google Meet · 120 min) at /shadow-lab-group or Lab Monthly ($997/mo · 1:1 · 60 min) at /shadow-lab-monthly. Pay first on those pages; after payment you’ll pick a time. Lab is an upsell, not a second school on this site.",
  },
  {
    q: "How do I book Shadow Lab?",
    a: "Pay first on /shadow-lab-group or /shadow-lab-monthly (compare options on /shadow-lab). Checkout sends you to Stripe; after a successful payment you’ll land on a booking handoff to pick a time. No contact-form booking for Lab seats.",
  },
  {
    q: "What is Consulting?",
    a: "A focused 60 min 1:1 session for $100/hr. Pay on /consulting; after payment you’ll pick a time. Support questions still go to support@pragvance.ai.",
  },
  {
    q: "What is the AI Assessment?",
    a: "A free 25-question diagnostic (0–75) that bands how your company uses AI — from chat toys to an operating layer — and points to Agent Swarm or Shadow Lab. It replaces the old Reality Check.",
  },
  {
    q: "Do you build custom AI apps?",
    a: "Yes. We turn a locked PRD into a shipped app — web or store — with an AI Guide in the loop so founders aren’t blocked waiting on a traditional PM. Portfolio products like MinutesIntel.ai live on their own domains.",
  },
  {
    q: "How do I contact Pragvance?",
    a: "Email support@pragvance.ai for support and general questions. Shadow Lab and Consulting are pay-first on /shadow-lab-group, /shadow-lab-monthly, and /consulting. PRAGVANCE LLC is an Oregon company.",
  },
] as const;

export const DESKS = [
  {
    name: "Inbox Triage",
    blurb: "Sort, label, and draft replies so priority mail hits the right desk first.",
  },
  {
    name: "Content Brief",
    blurb: "Turn a topic into a structured brief your writers or bots can ship from.",
  },
  {
    name: "Reel Scripts",
    blurb: "Outline short-form scripts with hooks, beats, and CTA options.",
  },
  {
    name: "Meeting Notes",
    blurb: "Capture decisions, owners, and next steps from a call transcript.",
  },
  {
    name: "Lead Qualifier",
    blurb: "Score inbound interest and route warm leads with a clear handoff note.",
  },
  {
    name: "Ops Checklist",
    blurb: "Run a recurring ops routine with status, blockers, and follow-ups.",
  },
] as const;
