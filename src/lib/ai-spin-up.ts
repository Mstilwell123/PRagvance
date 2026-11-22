import { SITE } from "@/lib/site";

/**
 * AI Spin Up draft page on pragvance.ai.
 * Contract: docs/prd/ai-spin-up-page-prd-2026-11-21.md (R1–R17).
 *
 * The live product URL lives in AI_SPIN_UP_URL only. aispinup.io replaces it
 * once that domain's DNS switches. Do not publish a price here.
 *
 * Keyword sources, fetched 2026-11-22. No search-volume tool was available,
 * so none of these notes are volumes. Empty or off-topic autocomplete is
 * recorded as fetched, not filled in.
 *
 * Google autocomplete
 * https://suggestqueries.google.com/complete/search?client=firefox&hl=en
 * - "AI Spin Up" → openai sign up, spin up ai, ai machines examples,
 *   ai tips and tricks, ai rising review. The product name is not suggested.
 *   Judgment call: it stays the primary keyword because it is the product name.
 * - "AI voice agent" → includes "ai voice agent for small business".
 * - "AI voice agent for small business" → that phrase, plus unrelated
 *   voice-acting queries (ai voice companies, how to get a voice agent).
 * - "AI agent that books appointments" → "ai agent to book appointments".
 * - "AI receptionist in your voice" → no suggestions.
 * - "AI receptionist for small business" → that phrase, plus cost, reddit,
 *   and country variants. Costs from those suggestions are not cited.
 * - "pragvance" → no suggestions.
 *
 * Live product page fetched the same day (AI_SPIN_UP_URL).
 * Title: "AI Spin Up · AI Voice Agent That Books Calls in Your Voice".
 * The static HTML did not contain the name Elaine.
 *
 * Competitor pages fetched the same day, used only as phrasing evidence:
 * - https://www.spokenindex.com/guides/best-ai-receptionist-for-small-business/
 * - https://zinng.ai/
 * - https://qyro.us/assist
 * - https://www.gohighlevel.com/voice-ai/
 * - https://receptionistratings.com/best/appointment-booking
 */

/** Live AI Spin Up site. Keep this URL in this constant alone. */
export const AI_SPIN_UP_URL = "https://connect-now-landing.vercel.app/";

export const AI_SPIN_UP_PATH = "/ai-spin-up";

export const AI_SPIN_UP_CANONICAL = `${SITE.url}${AI_SPIN_UP_PATH}`;

export const AI_SPIN_UP_H1 = "AI Spin Up: talk to an AI Spin Up agent.";

export const AI_SPIN_UP_TITLE =
  "AI Spin Up: AI Voice Agent for Small Business | Pragvance";

export const AI_SPIN_UP_DESCRIPTION =
  "AI Spin Up is an AI voice agent for small business. It speaks in your voice, talks with prospects from an ad or a call, and books a call with you.";

/** Primary, then secondary. Placement is the route, title, description, headings, and schema. */
export const AI_SPIN_UP_KEYWORDS = [
  "AI Spin Up",
  "AI voice agent for small business",
  "AI agent that books appointments",
  "AI receptionist for small business",
] as const;

export const AI_SPIN_UP_OG = {
  path: "/ai-spin-up/og.png",
  width: 1200,
  height: 630,
  alt: "AI Spin Up by Pragvance. An AI voice agent for small business that talks with prospects and books a call with you.",
} as const;

export const AI_SPIN_UP_FACTS = [
  {
    title: "In the owner's voice",
    body: "You get an AI agent speaking in your voice. It talks with prospects who reach out from an ad or a call. It presents itself as your AI agent.",
  },
  {
    title: "A 5-10 minute interview",
    body: "Setup is a 5-10 minute interview. You answer in your own words about your work, how you want to sound, and where you serve.",
  },
  {
    title: "Inside your service area",
    body: "The agent stays inside your service area. It does not offer places or services you do not cover.",
  },
] as const;

export const AI_SPIN_UP_STEPS = [
  {
    title: "They reach out",
    body: "A prospect taps an ad or calls in and lands in a conversation with your AI agent.",
  },
  {
    title: "The agent trades information",
    body: "The agent asks questions and answers from what you taught it, in your voice.",
  },
  {
    title: "They book a call with you",
    body: "The prospect books a call with you, the owner.",
  },
  {
    title: "You get the summary",
    body: "You get a summary of who reached out and what they wanted. The post-call summary email is coming soon.",
  },
] as const;

export const AI_SPIN_UP_COMING_SOON = [
  {
    title: "Post-call summary email",
    body: "An email after the conversation with who reached out, what they wanted, and whether they booked.",
    label: "coming soon",
  },
  {
    title: "Missed-call text back",
    body: "A text back when a call is missed, so the prospect can leave a note or book a time.",
    label: "coming soon",
  },
  {
    title: "Weekly digest",
    body: "A weekly note on the questions prospects asked and the areas they named.",
    label: "coming soon",
  },
] as const;

export const AI_SPIN_UP_FAQ = [
  {
    q: "What is AI Spin Up?",
    a: "AI Spin Up is a Pragvance product: an AI voice agent for small business. A business owner gets an AI agent speaking in their voice. The agent talks with prospects who reach out from an ad or a call and books a call with the owner.",
  },
  {
    q: "What does an AI voice agent for small business do?",
    a: "An AI voice agent for small business speaks with a prospect in a conversation instead of sending them to a form. AI Spin Up speaks in the owner's voice, trades information, and books a call with the owner. Pragvance does not list an AI Spin Up price on this page.",
  },
  {
    q: "How does the AI agent book an appointment?",
    a: "The prospect reaches out, the agent trades information, and the prospect books a call with the owner. You then get the summary. That is the AI Spin Up path for an AI agent that books appointments: a call with the owner, not a handoff to a nameless team.",
  },
  {
    q: "How long is the AI Spin Up setup interview?",
    a: "Setup is a 5-10 minute interview. The owner answers in their own words about the work, the voice, and the service area. Those answers are what the agent is allowed to say.",
  },
  {
    q: "Does the AI agent stay inside my service area?",
    a: "Yes. The 5-10 minute interview is where you set the area and the services you cover. The agent stays inside your service area and does not offer places or services outside it.",
  },
  {
    q: "Are the summary email, missed-call text, and weekly digest available?",
    a: "Not yet. The post-call summary email, the missed-call text back, and the weekly digest are coming soon. This page labels each one coming soon.",
  },
  {
    q: "Is AI Spin Up an AI receptionist for small business?",
    a: "AI Spin Up is an AI voice agent that speaks in the owner's voice and books a call with the owner. An AI receptionist for small business is a related kind of product that answers a business line. AI Spin Up talks with prospects who reach out from an ad or a call, stays inside the service area you set, and is not a full front desk.",
  },
] as const;

export const AI_SPIN_UP_EXAMPLE = [
  { from: "agent", text: "Hi, I'm the owner's AI agent." },
  { from: "agent", text: "I can ask a few questions and book a call with the owner." },
  { from: "prospect", text: "I saw the ad. Do you cover my area?" },
  {
    from: "agent",
    text: "I stay inside the owner's service area. If it is a fit, you can book a call with the owner.",
  },
] as const;

export function aiSpinUpJsonLd() {
  const pageId = `${AI_SPIN_UP_CANONICAL}#webpage`;
  const orgId = `${SITE.url}/#organization`;
  const appId = `${AI_SPIN_UP_CANONICAL}#software`;
  const faqId = `${AI_SPIN_UP_CANONICAL}#faq`;
  const crumbId = `${AI_SPIN_UP_CANONICAL}#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Pragvance",
        legalName: SITE.legal,
        url: SITE.url,
        email: SITE.email,
        slogan: SITE.tagline,
        logo: {
          "@type": "ImageObject",
          url: `${SITE.url}/logo-lockup.png`,
        },
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: AI_SPIN_UP_CANONICAL,
        name: AI_SPIN_UP_TITLE,
        description: AI_SPIN_UP_DESCRIPTION,
        keywords: AI_SPIN_UP_KEYWORDS.join(", "),
        inLanguage: "en-US",
        isPartOf: { "@type": "WebSite", name: "Pragvance", url: SITE.url },
        publisher: { "@id": orgId },
        about: { "@id": appId },
        mainEntity: { "@id": faqId },
        breadcrumb: { "@id": crumbId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE.url}${AI_SPIN_UP_OG.path}`,
          width: AI_SPIN_UP_OG.width,
          height: AI_SPIN_UP_OG.height,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        name: "AI Spin Up",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "AI voice agent for small business",
        operatingSystem: "Web",
        url: AI_SPIN_UP_CANONICAL,
        description: AI_SPIN_UP_DESCRIPTION,
        keywords: AI_SPIN_UP_KEYWORDS.join(", "),
        featureList: [
          "AI agent in the owner's voice",
          "5-10 minute setup interview",
          "Stays inside your service area",
          "They reach out",
          "The agent trades information",
          "They book a call with you",
          "You get the summary",
        ],
        publisher: { "@id": orgId },
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        url: AI_SPIN_UP_CANONICAL,
        isPartOf: { "@id": pageId },
        mainEntity: AI_SPIN_UP_FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": crumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
          { "@type": "ListItem", position: 2, name: "AI Spin Up", item: AI_SPIN_UP_CANONICAL },
        ],
      },
    ],
  };
}
