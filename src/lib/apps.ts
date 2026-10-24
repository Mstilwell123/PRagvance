export type ShowcaseApp = {
  name: string;
  url: string;
  /** Path under /public, or null to show an initial tile. */
  logo: string | null;
  /** One line taken from the app's own site or README. */
  description: string;
};

export const APPS: ShowcaseApp[] = [
  {
    name: "MinutesIntel.ai",
    url: "https://www.minutesintel.ai/",
    logo: "/apps/minutesintel.png",
    description:
      "Privacy-first, on-device meeting recording and AI-generated board-quality minutes for CEOs and business consultants.",
  },
  {
    name: "My Briefing",
    url: "https://mybriefing.us/",
    logo: "/apps/mybriefing.png",
    description: "My Briefing turns one spoken thought into an organized day.",
  },
  {
    name: "App N SaaS Builder",
    url: "https://www.appnsaasbuilder.com/",
    logo: "/apps/appnsaasbuilder.png",
    description: "Know how close your app is to shipping.",
  },
  {
    name: "ShowPiece.Pro",
    url: "https://showpiece.pro/",
    logo: "/apps/showpiece.svg",
    description: "Turn contractor project photos and clips into branded, narrated videos.",
  },
  {
    name: "MinutePushPro",
    url: "https://minute-push-pro.vercel.app/",
    logo: "/apps/minutepushpro.png",
    description: "90-second job proof that ranks locally.",
  },
  {
    name: "AppDemo.live",
    url: "https://appdemo-live.vercel.app/",
    logo: null,
    description: "Launch your software live.",
  },
  {
    name: "ID-Clare",
    url: "https://id-clare.vercel.app/",
    logo: "/apps/id-clare.png",
    description: "Know who you are in Christ. Speak the Word. Live from truth.",
  },
];
