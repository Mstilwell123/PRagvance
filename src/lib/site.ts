export const SITE = {
  name: "Pragvance",
  legal: "PRAGVANCE LLC",
  tagline: "Practical AI. Built to advance your business.",
  url: "https://pragvance.ai",
  email: "support@pragvance.ai",
  location: "Oregon, USA",
  swarmUrl: "https://www.skool.com/the-swarm-2120",
  swarmPrice: "$99/mo",
  labSeat: "$497 seat",
  labMonth: "$997 month",
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/swarm", label: "Agent Swarm" },
  { href: "/shadow-lab", label: "Shadow Lab" },
  { href: "/assessment", label: "Reality Check" },
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
    a: "The Swarm is the self-paced / weekly classroom track on Skool. Shadow Lab is live high-touch seats ($497 seat / $997 month) for founders who want closer coaching. Lab is an upsell, not a second school on this site.",
  },
  {
    q: "What is the AI Reality Check?",
    a: "A free readiness assessment that helps you see where AI can actually help your business — and where it cannot — before you invest in agents, training, or a build.",
  },
  {
    q: "Do you build custom AI apps?",
    a: "Yes. We turn a locked PRD into a shipped app — web or store — with an AI Guide in the loop so founders aren’t blocked waiting on a traditional PM. Portfolio products like MinutesIntel.ai live on their own domains.",
  },
  {
    q: "How do I contact Pragvance?",
    a: "Email support@pragvance.ai. PRAGVANCE LLC is an Oregon company.",
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
