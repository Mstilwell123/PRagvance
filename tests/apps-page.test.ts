import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AppsPage, { metadata } from "../src/app/apps/page.tsx";
import Header from "../src/components/Header.tsx";
import Footer from "../src/components/Footer.tsx";
import { APPS, B2B_APPS, B2C_APPS } from "../src/lib/apps.ts";
import { AI_INTELLECTUAL_CAPITAL_URL, NAV } from "../src/lib/site.ts";

const B2B = [
  ["MinutesIntel.ai", "https://www.minutesintel.ai/"],
  ["App N Saas Builder", "https://www.appnsaasbuilder.com/"],
  ["ShowPiece.Pro", "https://showpiece.pro/"],
  ["AI Intellectual Capital", AI_INTELLECTUAL_CAPITAL_URL],
] as const;

const B2C = [
  ["My Briefing", "https://mybriefing.us/"],
  ["VoiceTalk.app", "https://voicetalk.app/"],
  ["ID-Clare", "https://id-clare.vercel.app/"],
] as const;

test("/apps lists B2B then B2C in Mark's order", () => {
  assert.deepEqual(
    B2B_APPS.map((app) => [app.name, app.url]),
    B2B.map((row) => [...row]),
  );
  assert.deepEqual(
    B2C_APPS.map((app) => [app.name, app.url]),
    B2C.map((row) => [...row]),
  );
  assert.equal(APPS.length, 7);
  assert.equal(B2B_APPS[3]?.tag, "Saas");
  assert.equal(B2B_APPS.filter((app) => app.tag).length, 1);
  assert.deepEqual(APPS.map((app) => app.name), [...B2B, ...B2C].map((row) => row[0]));
});

test("each /apps card is one external link covering the whole card", () => {
  const html = renderToStaticMarkup(createElement(AppsPage));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<h1[^>]*>\s*Apps \/ Saas\s*<\/h1>/);
  assert.equal(
    (html.match(/grid grid-cols-1 items-center gap-3 md:grid-cols-2 lg:grid-cols-5/g) || []).length,
    2,
  );
  assert.match(html, /<h2 id="b2b-heading" class="text-4xl font-bold tracking-tight md:text-5xl text-\[color:var\(--text\)\]">\s*B2B\s*<\/h2>/);
  assert.match(html, /<h2 id="b2c-heading" class="text-4xl font-bold tracking-tight md:text-5xl text-\[color:var\(--gold-bright\)\]">\s*B2C\s*<\/h2>/);
  assert.equal(html.includes("lg:col-start-"), false);
  assert.match(html, /Business to business/);
  assert.match(html, /<hr class="my-12 h-\[2px\] w-full border-0 bg-\[rgba\(208,162,86,0\.6\)\]"/);
  assert.equal(html.includes("uppercase"), false);
  assert.match(html, /<h2[^>]*>\s*B2C\s*<\/h2>/);
  assert.match(html, /Business to consumer/);
  assert.match(html, /"name":"Apps \/ Saas"/);

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
  const minutesAt = html.indexOf(">MinutesIntel.ai<");
  const builderAt = html.indexOf(">App N Saas Builder<");
  assert.ok(b2bAt < minutesAt && minutesAt < builderAt);
  assert.ok(minutesAt < ruleAt);
  const briefAt = html.indexOf(">My Briefing<");
  assert.ok(ruleAt < b2cAt && b2cAt < briefAt);
  assert.ok(html.indexOf(">VoiceTalk.app<") > briefAt);

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
    assert.match(card, /p-3/);
    assert.match(card, /h-14 w-14/);
    if (name === "AI Intellectual Capital") {
      assert.match(card, />Saas</);
      assert.match(card, /Saas training and certification for working with Grok Bot\./);
    } else {
      assert.equal(card.includes(">Saas<"), false);
    }
  }

  assert.equal(html.includes("AppDemo"), false);
  assert.equal(html.includes("MinutePush"), false);
  assert.equal(html.includes('href="/apps"'), false);
});

test("the nav label is App / Saas and page titles stay Apps / Saas", () => {
  const nav = NAV.find((item) => item.href === "/apps");
  assert.ok(nav);
  assert.equal(nav.href, "/apps");
  assert.equal(nav.label, "App / Saas");
  assert.equal(metadata.title, "Apps / Saas Portfolio");
  assert.equal(metadata.openGraph && "title" in metadata.openGraph ? metadata.openGraph.title : "", "Apps / Saas | Pragvance");
  assert.equal(metadata.alternates && "canonical" in metadata.alternates ? metadata.alternates.canonical : "", "/apps");

  const header = renderToStaticMarkup(createElement(Header));
  const footer = renderToStaticMarkup(createElement(Footer));
  assert.match(header, /href="\/apps"[^>]*>App \/ Saas</);
  assert.match(footer, /href="\/apps"[^>]*>App \/ Saas</);
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
