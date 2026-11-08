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

## Abuse limits (env, all optional)

| Var | Default | Meaning |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) | unset | Shared store for limits + dedupe across serverless instances. Unset = per-instance memory (OK for preview, **set for production**). |
| `LEAD_RL_PER_IP` | 5 | `/api/lead` posts per IP (Vercel `x-real-ip`) per 10 min |
| `LEAD_RL_PER_EMAIL` | 3 | `/api/lead` posts per email per 10 min |

## Gated Stripe checkout

Off by default. Set `CHECKOUT_ENABLED=true` to enable; otherwise pricing/summary buttons go to `/contact` and `POST /api/checkout` returns 403.

- `POST /api/checkout` body `{ "product": "shadow_lab_group" | "shadow_lab_monthly" | "consulting_1hr" }` → `{ url }`. The price ID is looked up server-side from `STRIPE_PRICE_*`; the client never sends a price or amount. Unknown product → 400.
- `POST /api/webhooks/stripe` verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET` (bad/missing → 400). Each event id is processed once. A paid `checkout.session.completed` for an allowlisted product writes an entitlement record. A `crow_template` event is recorded on its own key prefix and is not an allowlisted checkout product. Other products are unchanged. Refunds revoke only a matching CROW entitlement.
- Env vars: see `.env.example`. Keys only via env. Test keys only on previews.
- Store: Upstash/Vercel KV if configured, else in-memory. Reference Postgres schema: `db/migrations/0001_checkout.{up,down}.sql` (not applied).

## CROW Template (draft, not for sale)

Route `/crow-template` is a noindex draft. It is not in the header, footer, or sitemap. `robots.txt` disallows `/crow-template` and `/api/crow-template`. `VERCEL_ENV=production` returns 404 for the page and its APIs.

- The only purchase CTA is `Buy & download — $99`. It posts to `/api/crow-template/checkout`, which always refuses. It does not call Stripe.
- `crow_template` is not in the checkout allowlist. `POST /api/checkout` cannot sell it. The client never sends the price.
- The Markdown file is `storage/crow/crow-template.md`, read by the server file route. It is not in `public/`.
- Download is deny-by-default. A short-lived link is issued only for a verified customer whose id matches the owner on an entitlement written by the signed, idempotent webhook for a paid $99 USD session. A success redirect or a client flag does not grant the file. Refunds and failed payments revoke later links, and redemption checks the entitlement again. Links expire after 5 minutes.
- There is no customer login in this repo. `resolveCrowCustomer` returns no identity except a local fixture. That fixture requires `CROW_LOCAL_PREVIEW=1`, a non-production `NODE_ENV`, `VERCEL_ENV` other than `preview` or `production`, and no live Stripe secret. Production and preview ignore the fixture.

Not done, and required before any sale:

1. Approve license, duration, update, and refund terms. The page marks them as proposed.
2. Owner approval to leave draft. Do not enable checkout until then.
3. Create the $99 one-time Price on the existing Pragvance Stripe account and store only the Price ID in server env.
4. Create Checkout Sessions server-side for that Price, with `client_reference_id` taken from the verified customer id. Set payment-intent metadata `product_key=crow_template` so a refund can be matched if it arrives before the paid event.
5. Replace `resolveCrowCustomer` with the real verified-customer provider. Do not add a second login system here.
6. Set `CROW_DOWNLOAD_TOKEN_SECRET` on the server (16+ characters, not the local sentinel).
7. Keep the existing webhook secret for this same account. No new Stripe account, product, or price is created by this draft.
8. Use Redis/KV for the shared store in production. The reference SQL migration is not applied and does not list this product.
