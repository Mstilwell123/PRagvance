import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HubPage, { metadata as hubMetadata } from "../src/app/agents-a-la-carte/page.tsx";
import AgentPage, {
  generateMetadata,
  generateStaticParams,
} from "../src/app/agents-a-la-carte/[slug]/page.tsx";
import Header from "../src/components/Header.tsx";
import Footer from "../src/components/Footer.tsx";
import { portraitSlugs } from "../src/components/agents/AgentPortrait.tsx";
import { NAV } from "../src/lib/site.ts";
import sitemap from "../src/app/sitemap.ts";
import {
  AGENTS,
  agentContactHref,
  agentInquiry,
  detailBadge,
  primaryCta,
  statusLabel,
} from "../src/lib/agents-a-la-carte.ts";

const ROSTER = [
  ["chief-of-staff", "Chief of Staff", "available", "executive-operations"],
  ["app-builder", "App Builder", "available", "web-apps-growth"],
  ["website-builder", "Website Builder", "available", "web-apps-growth"],
  ["deep-dive-research", "Deep Dive Research", "available", "content-efficiency"],
  ["sales-manager", "Sales Manager", "available", "revenue-sales"],
  ["chief-revenue-officer", "Chief Revenue Officer (CRO)", "available", "revenue-sales"],
  ["chief-operating-officer", "Chief Operating Officer", "available", "executive-operations"],
  ["opportunity-analyst", "Opportunity Analyst", "available", "revenue-sales"],
  ["strategy-advisor", "Strategy & Judgment Advisor", "available", "executive-operations"],
  ["news-curator", "News & Media Curator", "available", "content-efficiency"],
  ["board-admin", "Board & Governance Admin", "available", "executive-operations"],
  ["task-manager", "Task & Execution Manager", "available", "executive-operations"],
  ["filing-organizer", "Knowledge & Filing Organizer", "available", "content-efficiency"],
  ["operations-mapper", "Operations Knowledge Mapper", "available", "executive-operations"],
  ["hack-bot", "Hack Bot — Money & Time Saver", "available", "content-efficiency"],
  ["social-media-manager", "Social Media Manager", "coming-soon", "content-efficiency"],
  ["content-marketer", "Content Marketer", "coming-soon", "content-efficiency"],
  ["subscription-auditor", "Subscription & Bill Auditor", "coming-soon", "content-efficiency"],
  ["short-form-video-marketer", "Short-Form Video Marketer", "coming-soon", "content-efficiency"],
  ["agent-architect", "Agent Architect & Quality Reviewer", "coming-soon", "web-apps-growth"],
] as const;

const BANNED = [
  /swarm/i,
  /\b[Cc]rows?\b/,
  /PragVance/,
  /Gandalf/,
  /Harry Potter/,
  /Donna Paulsen/,
  /Einstein/,
  /\$99\s*\/\s*mo/i,
  /\$99\s*a month/i,
  /stripe\.com/i,
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|txt)$/.test(name)) out.push(path);
  }
  return out;
}

test("the nav keeps every existing link and adds Agents a la Carte", () => {
  assert.deepEqual(
    NAV.map((item) => [item.href, item.label]),
    [
      ["/", "Home"],
      ["/aiworkforce", "AI Workforce"],
      ["/agents-a-la-carte", "Agents a la Carte"],
      ["/assessment", "AI Assessment"],
      ["/apps", "App / Saas"],
      ["/pricing", "Pricing"],
      ["/contact", "Contact"],
    ],
  );
  const header = renderToStaticMarkup(createElement(Header));
  const footer = renderToStaticMarkup(createElement(Footer));
  for (const html of [header, footer]) {
    assert.match(html, /href="\/agents-a-la-carte"[^>]*>Agents a la Carte</);
    assert.match(html, /href="\/aiworkforce"/);
    assert.equal(html.includes('href="/done-for-you"'), false);
    assert.match(html, /href="\/assessment"/);
    assert.match(html, /href="\/apps"/);
    assert.match(html, /href="\/pricing"/);
    assert.match(html, /href="\/contact"/);
  }
});

test("the hub states the exact offer and lists all 20 agents", () => {
  const html = renderToStaticMarkup(createElement(HubPage));
  assert.match(html, /<h1[^>]*>\s*Build your business with AI agents, \$99 a piece\s*<\/h1>/);
  assert.match(html, /\$99 one-time self-serve Grok Bot kit/);
  assert.match(html, /30 days/);
  assert.match(html, /AI Workforce on Skool/);
  assert.match(html, /Done-for-You/);
  assert.match(html, /\$199–\$249/);
  assert.match(html, /60-minute live setup call/);
  assert.match(html, /not sold as a monthly hosted plan/);
  assert.match(html, /All/);
  assert.match(html, /Executive &amp; Operations/);
  assert.match(html, /Revenue &amp; Sales/);
  assert.match(html, /Web, Apps &amp; Growth/);
  assert.match(html, /Content &amp; Efficiency/);
  for (const [, title] of ROSTER) {
    assert.ok(html.includes(title.replace(/&/g, "&amp;")), title);
  }
  assert.equal((html.match(/Week-1 deliverable:/g) || []).length, 20);
  assert.equal((html.match(/View this agent/g) || []).length, 20);
  assert.equal((html.match(/>Available</g) || []).length, 15);
  assert.equal((html.match(/>Coming Soon</g) || []).length, 5);
  assert.equal(
    hubMetadata.title && typeof hubMetadata.title === "object" && "absolute" in hubMetadata.title
      ? hubMetadata.title.absolute
      : "",
    "Agents a la Carte | Pragvance.ai",
  );
  assert.equal(
    hubMetadata.alternates && "canonical" in hubMetadata.alternates ? hubMetadata.alternates.canonical : "",
    "/agents-a-la-carte",
  );
});

test("each agent has its own static page, badge, setup, and contact CTA", async () => {
  assert.deepEqual(
    AGENTS.map((agent) => [agent.slug, agent.title, agent.status, agent.category]),
    ROSTER.map((row) => [...row]),
  );
  assert.deepEqual(
    generateStaticParams().map((item) => item.slug),
    ROSTER.map((row) => row[0]),
  );
  assert.deepEqual(portraitSlugs().sort(), ROSTER.map((row) => row[0]).sort());

  for (const agent of AGENTS) {
    assert.ok(agent.summary.length > 40);
    assert.ok(agent.does.length > 80);
    assert.ok(agent.weekOne.length > 40);
    assert.ok(agent.connectorNote.length > 40);
    assert.equal(agent.summary.includes("%"), false);
    const inquiry = agentInquiry(agent);
    assert.match(inquiry.note, /does not take payment/);
    assert.equal(agentContactHref(agent.slug), `/contact?agent=${agent.slug}`);
  }

  const active = AGENTS[0];
  const waiting = AGENTS[15];
  assert.equal(active.slug, "chief-of-staff");
  assert.equal(waiting.slug, "social-media-manager");
  assert.equal(statusLabel(active.status), "Available");
  assert.equal(detailBadge(active.status), "$99 one-time self-serve kit");
  assert.equal(primaryCta(active.status), "Get this agent — $99");
  assert.equal(statusLabel(waiting.status), "Coming Soon");
  assert.equal(primaryCta(waiting.status), "Join waitlist");

  const activeHtml = renderToStaticMarkup(
    await AgentPage({ params: Promise.resolve({ slug: active.slug }) }),
  );
  assert.match(activeHtml, /href="\/agents-a-la-carte"/);
  assert.match(activeHtml, /Back to Agents a la Carte/);
  assert.match(activeHtml, /What this agent does/);
  assert.match(activeHtml, /Your Week-1 deliverable/);
  assert.match(activeHtml, /How self-serve setup works/);
  assert.match(activeHtml, /CSV, a PDF, or a paste/);
  assert.match(activeHtml, /Five-question onboarding/);
  assert.equal((activeHtml.match(/<li>/g) || []).length >= 5, true);
  assert.match(activeHtml, /Download the Grok Bot desktop app/);
  assert.match(activeHtml, /Accounts and connectors/);
  assert.match(activeHtml, /href="\/contact\?agent=chief-of-staff"/);
  assert.match(activeHtml, /Get this agent — \$99/);
  assert.match(activeHtml, /\$99 one-time self-serve kit/);
  assert.match(activeHtml, /30 days/);
  assert.match(activeHtml, /This page does not take payment/);

  const waitingHtml = renderToStaticMarkup(
    await AgentPage({ params: Promise.resolve({ slug: waiting.slug }) }),
  );
  assert.match(waitingHtml, /Coming Soon/);
  assert.match(waitingHtml, /Join waitlist/);
  assert.match(waitingHtml, /href="\/contact\?agent=social-media-manager"/);
  assert.equal(waitingHtml.includes("Get this agent"), false);

  const croHtml = renderToStaticMarkup(
    await AgentPage({ params: Promise.resolve({ slug: "chief-revenue-officer" }) }),
  );
  assert.match(croHtml, /Chief Revenue Officer \(CRO\)/);
  assert.equal(/\b[Cc]rows?\b/.test(croHtml), false);

  const meta = await generateMetadata({ params: Promise.resolve({ slug: "hack-bot" }) });
  assert.equal(
    meta.title && typeof meta.title === "object" && "absolute" in meta.title ? meta.title.absolute : "",
    "Hack Bot — Money & Time Saver | Agents a la Carte | Pragvance.ai",
  );
  assert.equal(
    meta.alternates && "canonical" in meta.alternates ? meta.alternates.canonical : "",
    "/agents-a-la-carte/hack-bot",
  );

  await assert.rejects(() => AgentPage({ params: Promise.resolve({ slug: "not-an-agent" }) }));
});

test("catalog copy and the public index avoid banned claims", () => {
  const files = [
    ...walk("src/app/agents-a-la-carte"),
    ...walk("src/components/agents"),
    "src/lib/agents-a-la-carte.ts",
  ];
  const hits: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED) {
      if (pattern.test(text)) hits.push(`${file} :: ${pattern}`);
    }
  }
  assert.deepEqual(hits, []);

  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.some((url) => url.endsWith("/agents-a-la-carte")), true);
  for (const [slug] of ROSTER) {
    assert.equal(urls.some((url) => url.endsWith(`/agents-a-la-carte/${slug}`)), true);
  }
  assert.equal(urls.some((url) => url.includes("/done-for-you")), false);

  const llms = readFileSync("public/llms.txt", "utf8");
  assert.match(llms, /https:\/\/pragvance\.ai\/agents-a-la-carte/);
  assert.match(llms, /\$99 one-time self-serve Grok Bot kit per agent/);
  assert.equal(/swarm/i.test(llms), false);
});
