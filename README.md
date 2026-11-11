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

Before going live, add both to the Production environment. Paid checkout uses the same two variables (see below). Tests: `npm test`; typecheck: `npm run typecheck`.

## Abuse limits (env, all optional)

| Var | Default | Meaning |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) | unset | Shared store for limits, Stripe event dedupe, entitlements, and paid-CRM markers. Unset = per-instance memory (OK for preview, **set for production**). |
| `LEAD_RL_PER_IP` | 5 | `/api/lead` posts per IP (Vercel `x-real-ip`) per 10 min |
| `LEAD_RL_PER_EMAIL` | 3 | `/api/lead` posts per email per 10 min |

## Gated Stripe checkout

Off by default. Set `CHECKOUT_ENABLED=true` to enable; otherwise pricing/summary buttons go to `/contact` and `POST /api/checkout` returns 403.

- `POST /api/checkout` body `{ "product": "shadow_lab_group" | "shadow_lab_monthly" | "consulting_1hr" }` → `{ url }`. The price ID is looked up server-side from `STRIPE_PRICE_*`; the client never sends a price or amount. Unknown product → 400. Shadow Lab prices fall back to the live IDs `price_1UXucA83KSR7xg0bY4hd5r6H` ($497, payment) and `price_1UXucC83KSR7xg0bzvpdDk9f` ($997/month, subscription) when that env var is unset. Env values starting with `price_1UXufc` or `price_1UXufe` ($1 test prices) are ignored.
- Shadow Lab signup also sends `name`, `email`, `interest` (required, ≤500), and `message` (optional, ≤500). Other fields are rejected. The route trims them, upserts a GoHighLevel contact (tags `Shadow Lab lead` plus `Shadow Lab - $497 single` or `Shadow Lab - $997 monthly`, source `pragvance.ai Shadow Lab form`, interest and message as a note), then creates Checkout with `customer_email` and that metadata. Monthly copies the metadata onto `subscription_data`. A CRM failure or the 4s timeout does not block checkout. `consulting_1hr` stays a product-key checkout with no signup form.
- Success URL for `consulting_1hr`, `shadow_lab_group`, and `shadow_lab_monthly`: `{SITE}/access/book?session_id={CHECKOUT_SESSION_ID}`. Cancel stays `/summary?checkout=canceled`.
- `POST /api/webhooks/stripe` verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET` (bad or missing → 400). Each event id is processed once.
- On `checkout.session.completed` or `checkout.session.async_payment_succeeded`, a known `metadata.product_key` with `payment_status` `paid` or `no_payment_required` writes an idempotent KV entitlement `entitlement:{session_id}`.
- A **paid** known product also upserts the buyer in GoHighLevel through the same CRM client as the contact form. Email and name come from `customer_details`. Unknown products, including Done-for-You payment-link checkouts (they have no known product key), do not get an entitlement or a CRM write.
- Tags (both, in one request): `paid` and a product tag.
  - `consulting_1hr`: `paid - consulting (60 min 1:1)`
  - `shadow_lab_group`: `paid - shadow lab (session)`
  - `shadow_lab_monthly`: `paid - shadow lab (monthly)`
- Note, written once, exact lines:

  ```
  Amount: 199.00 USD
  Product: consulting_1hr
  Stripe session: cs_...
  ```

  Amount is `amount_total` converted out of Stripe minor units, plus the uppercase currency. Product is the product key.
- Idempotency: KV marker `crm:{session_id}` (`{ at }`) is set only after the upsert, the tags, and the note all succeed. A second event for that session, or a Stripe retry of one that already succeeded, does not add another note. Overlapping deliveries take a short lock `crm:lock:{session_id}` (30s). The one that loses the lock gets a 500 so Stripe retries.
- Failure: the entitlement is written first. If GoHighLevel errors, times out, or the lock is busy, the marker stays unset, the lock is released, and the webhook returns **500**. Stripe retries. The entitlement overwrite is the same record. Each CRM request aborts after 8s; the paid sync gives up after a 12s budget.
- Missing `GHL_PRIVATE_TOKEN` or `GHL_LOCATION_ID`: CRM is skipped, a warning is logged with no token and no email, the entitlement is kept, and the webhook returns **200**. Stripe will not retry that event, and a resend of the same event id is ignored. Set both variables before checkout is enabled in that environment.
- A paid session with no usable `customer_details.email` skips CRM the same way (200, entitlement kept). `no_payment_required` records the entitlement and does not call CRM or Calendly.
- A **paid** booking product (`consulting_1hr`, `shadow_lab_group`, `shadow_lab_monthly`) then asks Calendly API v2 `POST /scheduling_links` for one link: `max_event_count` 1, `owner_type` `EventType`, `owner` = `CALENDLY_EVENT_TYPE_URI`. The link is stored at `booking-link:{session_id}`. A Stripe retry or a second event for that session returns the stored link and does not create another. A Calendly error returns **500** so Stripe retries; the CRM marker still prevents a second note. Missing or invalid Calendly env does not fail the webhook.
- Logs for the paid path are status and session id only. Response bodies are discarded.
- Env vars: see `.env.example`. Keys only via env. Test keys only on previews. Do not change live Stripe prices, payment links, or Dashboard objects from this app.
- Store: Upstash/Vercel KV if configured, else in-memory. Without a shared store, CRM dedupe is per instance, so production needs KV. Reference Postgres schema: `db/migrations/0001_checkout.{up,down}.sql` (not applied).

## Consultation booking page

`/access/book` is server-rendered and `noindex` (page metadata and `X-Robots-Tag`). It is not in the nav or the sitemap. `/access` is disallowed in `robots.txt`. No redirect in `next.config` points at Calendly.

The page loads the Checkout Session with the server Stripe secret. It confirms the payment only when the id matches `cs_test_` or `cs_live_` plus 8–200 letters or digits, `payment_status` is `paid`, and the product is `consulting_1hr`, `shadow_lab_group`, or `shadow_lab_monthly`. The confirmation shows the amount, the product name, and the buyer email with the local part masked (`b***@example.com`). A confirmed page shows the single-use scheduling link stored for that session (or creates it if the webhook has not yet) and redirects the browser to that link. The link is a `https://calendly.com/d/...` URL. A public event page is rejected and is not rendered.

The old `CONSULTATION_BOOKING_URL` variable is not read. Remove it from the host. Do not point any env var at a public Calendly page.

| Var | Purpose |
| --- | --- |
| `CALENDLY_API_TOKEN` | Server-only Calendly personal access token. Never expose it to the client. |
| `CALENDLY_EVENT_TYPE_URI` | `https://api.calendly.com/event_types/{id}` for the **60-minute** event. |

If either variable is missing, or the event type URI is not that API shape, the page says we'll email the booking link. It does not show a Calendly URL and it does not promise a reply time. Nothing in this app sends that email; send it by hand, or set the two variables so the page can show the link.

Missing, invalid, unpaid, or wrong-product sessions get one message — we couldn't confirm a paid session — and a link to `/contact`. The page does not say the payment succeeded unless Stripe says it was paid. Forged or unsigned webhook bodies do not create a link or a CRM contact.

Paid buyers still reach GoHighLevel only through the existing checkout sync (`GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID`). Set the location id to the AI Workforce location. This app does not add a second CRM workflow. A manual test-mode runbook is in `docs/booking-gate-test-mode.md`.
