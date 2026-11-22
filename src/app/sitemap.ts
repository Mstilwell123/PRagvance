import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Preview pages stay out until approved: /done-for-you, /consultation, /custom-app.
  const paths = ["", "/aiworkforce", "/shadow-lab", "/pricing", "/gift", "/assessment", "/apps", "/contact", "/privacy", "/terms", "/summary", "/ai-spin-up"];
  const now = new Date();
  return paths.map((path) => ({
    url: `${SITE.url}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
