// Single source of truth for Pragvance prices (Pricing PRD v1.2, Oct 23 2026). USD.
export const PRICING = {
  aiWorkforce: { amount: "$99", basis: "/month", short: "$99/mo" },
  shadowLabSingle: { amount: "$497", basis: "one two-hour session", hours: 2 },
  shadowLabMonthly: {
    amount: "$997",
    basis: "/month",
    detail: "four two-hour sessions per month (eight hours total)",
    savings: "Save $991 — nearly 50% compared with four individual sessions",
    comparison: "4 × $497 = $1,988",
  },
  doneForYou: { setup: "$4,999", setupBasis: "one-time setup", support: "$500", supportBasis: "/month support" },
  consultation: { amount: "$199", basis: "/ session", duration: "60 minutes" },
  custom: { label: "Custom quote" },
  assessment: { label: "Free" },
} as const;

export const SHADOW_LAB_SUMMARY =
  "$497 for one two-hour session, or $997/month for four two-hour sessions (eight hours total)";

export const PRODUCTS = [
  { name: "MinutesIntel.ai", href: "https://www.minutesintel.ai/" },
  { name: "App N SaaS Builder", href: "https://www.appnsaasbuilder.com/" },
  { name: "My Briefing", href: "https://mybriefing.us/" },
] as const;
