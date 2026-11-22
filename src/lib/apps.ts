export type ShowcaseApp = {
  name: string;
  url: string;
  /** Path under /public, or null to show an initial tile. */
  logo: string | null;
  /** One line taken from the app's own site or README. */
  description: string;
};

/** Business-to-business cards, in display order. */
export const B2B_APPS: ShowcaseApp[] = [
  {
    name: "MinutesIntel.ai",
    url: "https://www.minutesintel.ai/",
    logo: "/apps/minutesintel.png",
    description:
      "Privacy-first, on-device meeting recording and AI-generated board-quality minutes for CEOs and business consultants.",
  },
  {
    name: "ShowPiece.Pro",
    url: "https://showpiece.pro/",
    logo: "/apps/showpiece.png",
    description: "Turn contractor project photos and clips into branded, narrated videos.",
  },
  {
    name: "App N SaaS Builder",
    url: "https://www.appnsaasbuilder.com/",
    logo: "/apps/appnsaasbuilder.png",
    description: "Know how close your app is to shipping.",
  },
];

/** Business-to-consumer cards, in display order. */
export const B2C_APPS: ShowcaseApp[] = [
  {
    name: "VoiceTalk.app",
    url: "https://voicetalk.app/",
    logo: "/apps/voicetalk.png",
    description: "Speak your language. Hear theirs.",
  },
  {
    name: "ID-Clare",
    url: "https://id-clare.vercel.app/",
    logo: "/apps/id-clare.png",
    description: "Know who you are in Christ. Speak the Word. Live from truth.",
  },
  {
    name: "My Briefing",
    url: "https://mybriefing.us/",
    logo: "/apps/mybriefing.png",
    description: "My Briefing turns one spoken thought into an organized day.",
  },
];

/** Public /apps cards: B2B, then B2C. */
export const APPS: ShowcaseApp[] = [...B2B_APPS, ...B2C_APPS];
