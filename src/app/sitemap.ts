import type { MetadataRoute } from "next";
import { AGENTS, agentPath } from "@/lib/agents-a-la-carte";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Preview pages stay out until approved: /done-for-you, /consultation, /custom-app.
  const paths = [
    "",
    "/aiworkforce",
    "/pricing",
    "/gift",
    "/assessment",
    "/apps",
    "/agents-a-la-carte",
    ...AGENTS.map((agent) => agentPath(agent.slug)),
    "/contact",
    "/privacy",
    "/terms",
  ];
  const now = new Date();
  return paths.map((path) => ({
    url: `${SITE.url}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
