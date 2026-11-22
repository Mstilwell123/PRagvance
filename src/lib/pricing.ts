// Single source of truth for Pragvance prices (Pricing PRD v1.2, Oct 23 2026). USD.
export const PRICING = {
  aiWorkforce: { amount: "$99", basis: "/month", short: "$99/mo" },
  // Still read by the Done-for-You comparison table. That page is intentionally unchanged.
  shadowLabSingle: { amount: "$497", basis: "one two-hour session", hours: 2 },
  shadowLabMonthly: {
    amount: "$997",
    basis: "/month",
    detail: "four two-hour sessions per month (eight hours total)",
    savings: "Save $991 — nearly 50% compared with four individual sessions",
    comparison: "4 × $497 = $1,988",
  },
  doneForYou: { setup: "$5,000", setupBasis: "one-time setup", support: "$500", supportBasis: "/month support" },
  consultation: { amount: "$199", basis: "/ session", duration: "60 minutes" },
  custom: { label: "Custom quote" },
  assessment: { label: "Free" },
} as const;

/** One page per priced product. Start Here links use these paths. */
export const PRODUCT_PAGES = {
  aiWorkforce: "/aiworkforce",
  doneForYou: "/done-for-you",
  consultation: "/consultation",
  customApp: "/custom-app",
} as const;

export const PRODUCTS = [
  { name: "MinutesIntel.ai", href: "https://www.minutesintel.ai/" },
  { name: "App N SaaS Builder", href: "https://www.appnsaasbuilder.com/" },
  { name: "My Briefing", href: "https://mybriefing.us/" },
] as const;
