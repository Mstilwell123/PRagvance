# Pragvance.ai (DRAFT)

Interactive marketing site draft for [pragvance.ai](https://pragvance.ai).

**Status:** Draft only — not production. Do not point DNS / replace live until Mark approves via Chief.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Locked offers
- AI Workforce: $99/mo → https://www.skool.com/aiworkforce
- Shadow Lab: $497 seat / $997 month → /contact
- Tagline: Practical AI. Built to advance your business.

## Public assets (required)

Binary MCP upload corrupts PNG bytes. Copy these from the build box into `public/` before run/deploy:

- `public/hero-banner.png` ← `/workspace/pragvance-site/web/public/hero-banner.png`
- `public/logo-lockup.png` ← `/workspace/pragvance-site/web/public/logo-lockup.png`

Optional: `src/app/favicon.ico` from the same source tree.

## package-lock.json

If missing from this repo, copy from `/workspace/pragvance-site/web/package-lock.json` (or regenerate with `npm install` from the committed `package.json`). MCP `push_files` / `create_or_update_file` could not embed the ~224KB lockfile in a single tool call from this agent.

## Contact form → CRM lead handoff

The `/contact` form (preselected via `?interest=shadow-lab|done-for-you|consultation|aiworkforce|custom`, default General) POSTs to `src/app/api/lead/route.ts`. The route validates input, checks a honeypot field, applies a simple per-IP rate limit, then server-side upserts the contact in the CRM (offer custom field + `New - Lead` tag + a note with the message and any `utm_*` params). No CRM scripts, iframes, or URLs ship to the browser.

Server-only env vars (Vercel; currently set for **Preview** only):

| Var | Purpose |
| --- | --- |
| `GHL_PRIVATE_TOKEN` | CRM private integration token (never expose to the client) |
| `GHL_LOCATION_ID` | CRM sub-account/location id |

Before going live, add both to the Production environment. Tests: `npm test`; typecheck: `npm run typecheck`.
