import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AppsPage, { metadata } from "../src/app/apps/page.tsx";
import { APPS, B2B_APPS, B2C_APPS } from "../src/lib/apps.ts";
import { NAV } from "../src/lib/site.ts";

const B2B = [
  ["MinutesIntel.ai", "https://www.minutesintel.ai/"],
  ["ShowPiece.Pro", "https://showpiece.pro/"],
  ["App N SaaS Builder", "https://www.appnsaasbuilder.com/"],
] as const;

const B2C = [
  ["VoiceTalk.app", "https://voicetalk.app/"],
  ["ID-Clare", "https://id-clare.vercel.app/"],
  ["My Briefing", "https://mybriefing.us/"],
] as const;

test("/apps lists six cards in B2B then B2C order", () => {
  assert.deepEqual(
    B2B_APPS.map((app) => [app.name, app.url]),
    B2B.map((row) => [...row]),
  );
  assert.deepEqual(
    B2C_APPS.map((app) => [app.name, app.url]),
    B2C.map((row) => [...row]),
  );
  assert.equal(APPS.length, 6);
  assert.deepEqual(APPS.map((app) => app.name), [...B2B, ...B2C].map((row) => row[0]));
});

test("each /apps card is one external link covering the whole card", () => {
  const html = renderToStaticMarkup(createElement(AppsPage));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<h1[^>]*>\s*Apps \/ SaaS\s*<\/h1>/);
  assert.match(html, /<h2[^>]*>\s*B2B\s*<\/h2>/);
  assert.match(html, /Business to business/);
  assert.match(html, /<hr\b/);
  assert.match(html, /<h2[^>]*>\s*B2C\s*<\/h2>/);
  assert.match(html, /Business to consumer/);
  assert.match(html, /"name":"Apps \/ SaaS"/);

  const b2bAt = html.indexOf(">B2B<");
  const ruleAt = html.indexOf("<hr");
  const b2cAt = html.indexOf(">B2C<");
  assert.ok(b2bAt < ruleAt && ruleAt < b2cAt);

  const namesInOrder = [...B2B, ...B2C].map((row) => row[0]);
  let cursor = 0;
  for (const name of namesInOrder) {
    const at = html.indexOf(`>${name}<`, cursor);
    assert.ok(at > cursor, name);
    cursor = at;
  }
  assert.ok(html.indexOf(">MinutesIntel.ai<") < ruleAt);
  assert.ok(html.indexOf(">VoiceTalk.app<") > ruleAt);

  for (const [name, url] of [...B2B, ...B2C]) {
    const heading = html.indexOf(`>${name}<`);
    const open = html.lastIndexOf("<a ", heading);
    const close = html.indexOf("</a>", heading);
    const card = html.slice(open, close);
    assert.match(card, new RegExp(`href="${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(card, /target="_blank"/);
    assert.match(card, /rel="noopener noreferrer"/);
    assert.match(card, /cursor-pointer/);
    assert.match(card, /group /);
    assert.match(card, /motion-safe:group-hover:scale-105/);
    assert.match(card, /motion-safe:hover:-translate-y-0\.5/);
    assert.match(card, /focus-visible:outline/);
    assert.equal((card.match(/<a\b/g) || []).length, 1);
    assert.match(card, new RegExp(`alt="${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(card, />Start Here</);
    assert.equal(card.includes("<h2"), false);
    assert.match(card, /<h3/);
  }

  assert.equal(html.includes("AppDemo"), false);
  assert.equal(html.includes("MinutePush"), false);
  assert.equal(html.includes("AI Intellectual Capital"), false);
  assert.equal(html.includes('href="/apps"'), false);
});

test("the nav label is Apps / SAAS and page titles stay Apps / SaaS", () => {
  const nav = NAV.find((item) => item.href === "/apps");
  assert.ok(nav);
  assert.equal(nav.label, "Apps / SAAS");
  assert.equal(metadata.title, "Apps / SaaS Portfolio");
  assert.equal(metadata.openGraph && "title" in metadata.openGraph ? metadata.openGraph.title : "", "Apps / SaaS | Pragvance");
  assert.equal(metadata.alternates && "canonical" in metadata.alternates ? metadata.alternates.canonical : "", "/apps");
});

test("AppDemo.live and MinutePushPro are gone from this repo", () => {
  assert.equal(existsSync("public/apps/appdemo-live.png"), false);
  assert.equal(existsSync("public/apps/minutepushpro.png"), false);

  const skip = new Set(["node_modules", ".next", ".git", "package-lock.json", "apps-page.test.ts"]);
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (skip.has(name)) continue;
      const path = join(dir, name);
      const info = statSync(path);
      if (info.isDirectory()) walk(path);
      else if (/\.(ts|tsx|js|jsx|md|txt|json|css|html|svg)$/.test(name)) files.push(path);
    }
  };
  walk(".");

  const banned = /appdemo|app demo|minutepush|minute push|minutespush|minute-push-pro/i;
  const hits = files.filter((path) => banned.test(readFileSync(path, "utf8")));
  assert.deepEqual(hits, []);
});
