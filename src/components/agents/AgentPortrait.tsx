/**
 * Original geometric portraits. These are role badges, not likenesses of real or fictional people.
 */

type HairStyle =
  | "side"
  | "bob"
  | "bun"
  | "waves"
  | "crop"
  | "braid"
  | "curly"
  | "shaved"
  | "part"
  | "fringe";

type Prop =
  | "calendar"
  | "blocks"
  | "browser"
  | "search"
  | "pipeline"
  | "chart"
  | "flow"
  | "compass"
  | "fork"
  | "paper"
  | "gavel"
  | "checks"
  | "folders"
  | "nodes"
  | "clock"
  | "bubbles"
  | "pen"
  | "receipt"
  | "play"
  | "blueprint";

type PortraitSpec = {
  from: string;
  to: string;
  skin: string;
  hair: HairStyle;
  hairColor: string;
  shirt: string;
  prop: Prop;
};

const PORTRAITS: Record<string, PortraitSpec> = {
  "chief-of-staff": {
    from: "#0b1c33",
    to: "#16385c",
    skin: "#f0c7a8",
    hair: "side",
    hairColor: "#24180f",
    shirt: "#1d4e89",
    prop: "calendar",
  },
  "app-builder": {
    from: "#062033",
    to: "#0c4d73",
    skin: "#e0a67a",
    hair: "crop",
    hairColor: "#1a1a1a",
    shirt: "#0e7c86",
    prop: "blocks",
  },
  "website-builder": {
    from: "#06262a",
    to: "#0f5c62",
    skin: "#f6d3ba",
    hair: "bob",
    hairColor: "#3a2416",
    shirt: "#147a86",
    prop: "browser",
  },
  "deep-dive-research": {
    from: "#1a1740",
    to: "#3a2f78",
    skin: "#c68642",
    hair: "bun",
    hairColor: "#2a160e",
    shirt: "#3d4d9a",
    prop: "search",
  },
  "sales-manager": {
    from: "#102418",
    to: "#1e4d32",
    skin: "#8d5524",
    hair: "crop",
    hairColor: "#140e0a",
    shirt: "#2f6b45",
    prop: "pipeline",
  },
  "chief-revenue-officer": {
    from: "#2a1218",
    to: "#6a2433",
    skin: "#e8b896",
    hair: "waves",
    hairColor: "#3b2417",
    shirt: "#8a3044",
    prop: "chart",
  },
  "chief-operating-officer": {
    from: "#141820",
    to: "#2c3648",
    skin: "#d9a679",
    hair: "part",
    hairColor: "#1c140f",
    shirt: "#3e4c63",
    prop: "flow",
  },
  "opportunity-analyst": {
    from: "#2a2112",
    to: "#6a5424",
    skin: "#6b3e26",
    hair: "shaved",
    hairColor: "#2a2118",
    shirt: "#8a6a2f",
    prop: "compass",
  },
  "strategy-advisor": {
    from: "#241432",
    to: "#4e2a68",
    skin: "#f3d2b8",
    hair: "braid",
    hairColor: "#4a3420",
    shirt: "#68448a",
    prop: "fork",
  },
  "news-curator": {
    from: "#102033",
    to: "#1d4d73",
    skin: "#a56b45",
    hair: "curly",
    hairColor: "#24160f",
    shirt: "#2a628c",
    prop: "paper",
  },
  "board-admin": {
    from: "#14241c",
    to: "#2d4a38",
    skin: "#e7c2a4",
    hair: "side",
    hairColor: "#5c5148",
    shirt: "#3d5c4a",
    prop: "gavel",
  },
  "task-manager": {
    from: "#2a1a10",
    to: "#8a4b22",
    skin: "#f6d7c3",
    hair: "fringe",
    hairColor: "#2c1c12",
    shirt: "#a85a28",
    prop: "checks",
  },
  "filing-organizer": {
    from: "#241c16",
    to: "#5a4636",
    skin: "#d08b5b",
    hair: "bob",
    hairColor: "#1e140e",
    shirt: "#6d5340",
    prop: "folders",
  },
  "operations-mapper": {
    from: "#062028",
    to: "#0e5870",
    skin: "#c9956a",
    hair: "crop",
    hairColor: "#1a120e",
    shirt: "#1a6d86",
    prop: "nodes",
  },
  "hack-bot": {
    from: "#071828",
    to: "#0a3d66",
    skin: "#f0c7a8",
    hair: "waves",
    hairColor: "#24180f",
    shirt: "#0e6ea8",
    prop: "clock",
  },
  "social-media-manager": {
    from: "#2a1420",
    to: "#7a3450",
    skin: "#e8b896",
    hair: "bob",
    hairColor: "#3a2418",
    shirt: "#a84868",
    prop: "bubbles",
  },
  "content-marketer": {
    from: "#221433",
    to: "#5a3a86",
    skin: "#f6d3ba",
    hair: "bun",
    hairColor: "#2a1a12",
    shirt: "#6d4e9a",
    prop: "pen",
  },
  "subscription-auditor": {
    from: "#102418",
    to: "#1f5a3c",
    skin: "#8d5524",
    hair: "part",
    hairColor: "#1a120c",
    shirt: "#2f7a52",
    prop: "receipt",
  },
  "short-form-video-marketer": {
    from: "#2a1218",
    to: "#7a3044",
    skin: "#d9a679",
    hair: "curly",
    hairColor: "#2c1a12",
    shirt: "#9a3d55",
    prop: "play",
  },
  "agent-architect": {
    from: "#1a160c",
    to: "#4a3c1c",
    skin: "#c68642",
    hair: "crop",
    hairColor: "#1c140e",
    shirt: "#8a7040",
    prop: "blueprint",
  },
};

const stroke = {
  fill: "none",
  stroke: "#e5b862",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Hair({ style, color }: { style: HairStyle; color: string }) {
  if (style === "shaved") {
    return (
      <path
        d="M58 62c8-14 36-16 48 0"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
    );
  }
  if (style === "crop") {
    return <path d="M55 66c4-22 46-26 53-2-8-12-40-14-53 2z" fill={color} />;
  }
  if (style === "side" || style === "part") {
    return (
      <path
        d="M54 70c2-24 20-36 40-33 16 2 24 14 26 24-16-14-38-16-54-4-6 4-10 8-12 13z"
        fill={color}
      />
    );
  }
  if (style === "fringe") {
    return (
      <g fill={color}>
        <path d="M54 68c4-24 48-28 54-2-10-12-40-14-54 2z" />
        <path d="M58 64c6 10 12 12 18 8 4-8 8-14 4-18-10 2-18 4-22 10z" opacity="0.95" />
      </g>
    );
  }
  if (style === "bob") {
    return (
      <g fill={color}>
        <path d="M54 72c2-28 22-40 42-36 14 2 24 14 26 28-10-14-28-16-44-10-12 4-20 12-24 18z" />
        <path d="M50 68c1 22 4 36 10 42-2-16-4-28-2-42-4 0-8 0-8 0z" />
        <path d="M108 64c2 20 0 34 6 46 4-16 4-30 2-44-2-2-6-2-8-2z" />
      </g>
    );
  }
  if (style === "bun") {
    return (
      <g fill={color}>
        <path d="M56 66c4-20 44-24 50-2-8-12-38-14-50 2z" />
        <circle cx="98" cy="46" r="10" />
      </g>
    );
  }
  if (style === "braid") {
    return (
      <g fill={color}>
        <path d="M56 68c3-22 42-26 50-2-8-12-38-14-50 2z" />
        <path d="M108 62c6 8 8 20 6 34 6-2 10-10 8-20-2-10-8-16-14-14z" />
        <circle cx="116" cy="100" r="4" />
      </g>
    );
  }
  if (style === "waves") {
    return (
      <path
        d="M52 74c0-28 18-42 34-40 10 1 16 6 22 4-6 6-4 8 0 12-8 2-10-4-16-4-8 8-6 6-14 10-6-8-10-4-16-2-6 4-10 10-10 20z"
        fill={color}
      />
    );
  }
  return (
    <g fill={color}>
      <path d="M54 70c2-26 22-38 42-34 12 2 22 12 24 24-8-8-14-6-20-10-4 8-8 6-14 8-6-6-12-4-18 0-6-4-10 2-14 12z" />
      <circle cx="60" cy="62" r="6" />
      <circle cx="74" cy="52" r="7" />
      <circle cx="92" cy="50" r="7" />
      <circle cx="106" cy="60" r="6" />
    </g>
  );
}

function PropIcon({ prop }: { prop: Prop }) {
  switch (prop) {
    case "calendar":
      return (
        <g {...stroke}>
          <rect x="9" y="11" width="18" height="16" rx="2" />
          <path d="M9 16h18M13 9v4M23 9v4M13 21h3M20 21h3" />
        </g>
      );
    case "blocks":
      return (
        <g {...stroke}>
          <rect x="8" y="16" width="9" height="9" rx="1.5" />
          <rect x="19" y="16" width="9" height="9" rx="1.5" />
          <rect x="13.5" y="8" width="9" height="9" rx="1.5" />
        </g>
      );
    case "browser":
      return (
        <g {...stroke}>
          <rect x="7" y="10" width="22" height="16" rx="2" />
          <path d="M7 15h22M11 12.5h.1M14 12.5h.1" />
        </g>
      );
    case "search":
      return (
        <g {...stroke}>
          <circle cx="16" cy="16" r="6" />
          <path d="M20.5 20.5L27 27" />
        </g>
      );
    case "pipeline":
      return (
        <g {...stroke}>
          <path d="M8 26V14M14 26V18M20 26V12M26 26V16" />
          <path d="M8 14h0M14 18h0M20 12h0M26 16h0" />
        </g>
      );
    case "chart":
      return (
        <g {...stroke}>
          <path d="M8 26h20" />
          <path d="M10 22l5-6 4 3 7-9" />
          <path d="M21 10h5v5" />
        </g>
      );
    case "flow":
      return (
        <g {...stroke}>
          <rect x="6" y="8" width="8" height="6" rx="1" />
          <rect x="22" y="8" width="8" height="6" rx="1" />
          <rect x="14" y="22" width="8" height="6" rx="1" />
          <path d="M10 14v4h8v4M26 14v4h-8" />
        </g>
      );
    case "compass":
      return (
        <g {...stroke}>
          <circle cx="18" cy="18" r="9" />
          <path d="M18 12v2M18 22v2M12 18h2M22 18h2" />
          <path d="M15 21l6-6 1 4-4-1z" fill="#e5b862" stroke="none" />
        </g>
      );
    case "fork":
      return (
        <g {...stroke}>
          <path d="M10 28c4-8 4-12 0-18M10 18h8c6 0 8 3 8 8" />
          <circle cx="10" cy="9" r="1.4" fill="#e5b862" stroke="none" />
          <circle cx="26" cy="26" r="1.4" fill="#e5b862" stroke="none" />
        </g>
      );
    case "paper":
      return (
        <g {...stroke}>
          <path d="M12 8h10l6 6v14H12z" />
          <path d="M22 8v6h6M15 18h8M15 22h6" />
        </g>
      );
    case "gavel":
      return (
        <g {...stroke}>
          <path d="M14 12l8 8M12 14l8 8" />
          <path d="M20 20l6 6M11 25h14" />
        </g>
      );
    case "checks":
      return (
        <g {...stroke}>
          <rect x="10" y="8" width="16" height="20" rx="2" />
          <path d="M13 14l2 2 4-4M13 21l2 2 4-4" />
        </g>
      );
    case "folders":
      return (
        <g {...stroke}>
          <path d="M8 14h8l2 2h10v12H8z" />
          <path d="M11 14V12h7l2 2" />
        </g>
      );
    case "nodes":
      return (
        <g {...stroke}>
          <circle cx="11" cy="12" r="2.2" />
          <circle cx="25" cy="11" r="2.2" />
          <circle cx="18" cy="25" r="2.2" />
          <path d="M13 13l4 10M23 13l-3 10M13 12h10" />
        </g>
      );
    case "clock":
      return (
        <g {...stroke}>
          <circle cx="16" cy="18" r="8" />
          <path d="M16 14v4l3 2" />
          <circle cx="26" cy="24" r="4" />
          <path d="M26 22.5v2h2" />
        </g>
      );
    case "bubbles":
      return (
        <g {...stroke}>
          <rect x="7" y="8" width="14" height="10" rx="3" />
          <path d="M11 18l-2 4 5-4" />
          <rect x="16" y="16" width="13" height="9" rx="3" />
        </g>
      );
    case "pen":
      return (
        <g {...stroke}>
          <path d="M22 8l6 6-12 12H10v-6z" />
          <path d="M19 11l6 6" />
        </g>
      );
    case "receipt":
      return (
        <g {...stroke}>
          <path d="M12 8h12v20l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z" />
          <path d="M15 13h6M15 17h6M15 21h4" />
        </g>
      );
    case "play":
      return (
        <g {...stroke}>
          <rect x="7" y="10" width="22" height="16" rx="2" />
          <path d="M15 14l8 4-8 4z" fill="#e5b862" stroke="none" />
        </g>
      );
    case "blueprint":
      return (
        <g {...stroke}>
          <rect x="8" y="8" width="20" height="20" rx="1" />
          <path d="M8 14h20M8 20h20M14 8v20M20 8v20" />
        </g>
      );
    default: {
      const _never: never = prop;
      return _never;
    }
  }
}

export function portraitSlugs(): string[] {
  return Object.keys(PORTRAITS);
}

export default function AgentPortrait({
  slug,
  title,
  size = "card",
}: {
  slug: string;
  title: string;
  size?: "card" | "detail";
}) {
  const spec = PORTRAITS[slug] ?? PORTRAITS["chief-of-staff"];
  const dim = size === "detail" ? "h-36 w-36 md:h-44 md:w-44" : "h-28 w-28";
  const gradId = `agent-portrait-${slug}`;

  return (
    <svg viewBox="0 0 160 160" className={`${dim} shrink-0`} role="img" aria-label={`${title} illustration`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={spec.from} />
          <stop offset="1" stopColor={spec.to} />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="32" fill={`url(#${gradId})`} />
      <rect
        x="7"
        y="7"
        width="146"
        height="146"
        rx="28"
        fill="none"
        stroke="rgba(229,184,98,0.45)"
        strokeWidth="1.5"
      />
      <circle cx="78" cy="78" r="46" fill="rgba(255,255,255,0.06)" />
      <path d="M30 158c8-38 26-52 48-52s40 14 48 52" fill={spec.shirt} />
      <rect x="68" y="96" width="20" height="16" rx="6" fill={spec.skin} />
      <circle cx="78" cy="74" r="26" fill={spec.skin} />
      <Hair style={spec.hair} color={spec.hairColor} />
      <ellipse cx="69" cy="76" rx="2.1" ry="2.4" fill="#1c2430" />
      <ellipse cx="88" cy="76" rx="2.1" ry="2.4" fill="#1c2430" />
      <path
        d="M64 70h9"
        stroke={spec.hairColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M84 70h9"
        stroke={spec.hairColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M70 86c3 3.5 12 3.5 16 0"
        fill="none"
        stroke="#6a3a32"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <g transform="translate(108 104)">
        <circle cx="20" cy="20" r="22" fill="#07111c" stroke="#e5b862" strokeWidth="2" />
        <PropIcon prop={spec.prop} />
      </g>
    </svg>
  );
}
