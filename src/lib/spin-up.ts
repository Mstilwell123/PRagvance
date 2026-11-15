/**
 * AI Spin Up landing page content (draft at /spin-up).
 * Copy rules: spell Pragvance, say "business person", no pricing, no invented numbers,
 * no industry examples. Source: AI Spin Up PRD (2026-11-15).
 */

export const SPIN_UP_PATH = "/spin-up";

/**
 * Draft gate. Keep false until Mark approves publish AND keyword research is written
 * into titles, headings, routes, FAQ answers, and schema. While false, the page is noindex.
 */
export const SPIN_UP_PUBLISHED = false;

/**
 * Mark's recorded "Tap to hear Mark" greeting. No clip exists yet.
 * TODO(Mark): drop the recorded 10-15 second clip in /public/spin-up/ and set the path here.
 * Never swap in a generated voice.
 */
export const SPIN_UP_VOICE_CLIP: string | null = null;

/**
 * TODO(Mark): Calendly link for the 30-minute "Free AI agent call". Not provided yet.
 * Until it exists, "Book a free call" falls back to email (the PRD's Calendly-down fallback).
 */
export const SPIN_UP_CALENDLY_URL: string | null = null;

export const SPIN_UP_EMAIL_FALLBACK =
  "mailto:support@pragvance.ai?subject=" + encodeURIComponent("Free AI agent call");

export const SPIN_UP_COPY = {
  name: "AI Spin Up",
  owner: "Mark",
  ownerFull: "Mark Stilwell",
  business: "Pragvance.ai",
  h1: "Every prospect feels like they're talking straight to you.",
  lede: "A SaaS where any business owner gets an AI agent speaking in their voice,",
  ledeMore:
    "so a prospect tapping a social ad feels they're talking straight to the owner and ends up booked on a call.",
  firstLine: "Hi, I'm Mark's AI agent at Pragvance.ai.",
  opener:
    "Mark is lending me out to you for a moment to see if our AI agents can take something off your plate in your business. What kind of business do you run?",
  tagline: "Practical AI. Built to advance your business.",
  powered: "Powered by AI Spin Up",
} as const;

export const SPIN_UP_FEATURES = [
  { title: "Speaks in your voice", body: "The owner's AI agent talks in the owner's own voice and tone." },
  { title: "No forms, just a conversation", body: "A visitor taps a social ad and lands directly in a live conversation." },
  { title: "Interviews and books", body: "The agent interviews the prospect and books them on a Calendly call with the owner." },
  { title: "One-time owner profile", body: "Name, business, photo, an optional greeting recording, and how you talk." },
  {
    title: "Always you at the close",
    body: 'Every hand-off names the owner, and the close is always a call with the owner, never "our team."',
  },
  { title: "Built for anyone who sells", body: "Works for any business person selling something." },
] as const;

export const SPIN_UP_STEPS = [
  { title: "Land from the ad", body: "A prospect taps your social ad and lands straight in a chat with your agent, phone in hand." },
  { title: "The agent starts talking", body: "It says hi on its own, in your words. No buttons, no forms, no tap needed." },
  { title: "Interview, one question at a time", body: "It asks one question at a time, in your tone, and reflects their answers back." },
  {
    title: "Swap contact details and book via Calendly",
    body: "An in-chat card swaps details both ways, and the prospect books a call with you right in the chat.",
  },
] as const;

export const SPIN_UP_FAQ = [
  {
    q: "What is AI Spin Up?",
    a: "AI Spin Up is a SaaS from Pragvance.ai where any business owner gets an AI agent speaking in their voice. A prospect who taps a social ad lands in a conversation with the owner's agent and ends up booked on a call with the owner.",
  },
  {
    q: "Does the AI agent pretend to be me?",
    a: "No. The agent always says it is an AI agent and never claims to be the owner. It is clearly yours: it greets prospects in your words, talks in your tone, and every close is a call with you, never \"our team.\"",
  },
  {
    q: "Do prospects have to fill out a form?",
    a: "No. There are no forms or buttons on arrival. The agent opens the conversation on its own, asks one question at a time, then shows an in-chat card to swap contact details and book a call through Calendly.",
  },
  {
    q: "Does the voice play automatically?",
    a: "No. Voice never autoplays and there is no generated voice. \"Tap to hear\" plays the owner's own recorded greeting, and the text always shows.",
  },
  {
    q: "Who is AI Spin Up for?",
    a: "Built for anyone who sells. Works for any business person selling something.",
  },
  {
    q: "How do I get my own AI agent?",
    a: "Book a free call. After that, you fill in a one-time owner profile with your name, business, a real photo, your greeting, how you talk, and your Calendly link, and you see a private preview before anything goes live.",
  },
] as const;
