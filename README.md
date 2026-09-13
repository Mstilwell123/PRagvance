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
- Agent Swarm: $99/mo → https://www.skool.com/the-swarm-2120
- Shadow Lab: $497 seat / $997 month → /contact
- Tagline: Practical AI. Built to advance your business.

## Public assets (required)

Binary MCP upload corrupts PNG bytes. Copy these from the build box into `public/` before run/deploy:

- `public/hero-banner.png` ← `/workspace/pragvance-site/web/public/hero-banner.png`
- `public/logo-lockup.png` ← `/workspace/pragvance-site/web/public/logo-lockup.png`

Optional: `src/app/favicon.ico` from the same source tree.

## package-lock.json

If missing from this repo, copy from `/workspace/pragvance-site/web/package-lock.json` (or regenerate with `npm install` from the committed `package.json`). MCP `push_files` / `create_or_update_file` could not embed the ~224KB lockfile in a single tool call from this agent.
