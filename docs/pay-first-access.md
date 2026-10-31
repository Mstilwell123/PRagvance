# Pay-first access (Stripe Checkout → Calendly gate)

Scaffold for Pragvance pay-first booking. Public CTA pages are owned by Webster — this work does **not** flip live CTAs.

## Public CTA routes (ROUTE LOCK)

| Path | `offer_id` |
|---|---|
| `/shadow-lab-group` | `shadow_lab_group` |
| `/shadow-lab-monthly` | `shadow_lab_monthly` |
| `/consulting` | `consulting_1hr` |

Drop `/access` as a public chooser. Keep `/access/book` as the post-pay gate only. Retire nested `/shadow-lab/group` and `/shadow-lab/monthly`.

## Locked offers

| `offer_id` | Amount | Mode | Duration | Notes |
|---|---|---|---|---|
| `shadow_lab_group` | $497 | `payment` | 120 min | Group Meet, max 10 |
| `shadow_lab_monthly` | $997/mo | `subscription` | 60 min | 1:1 |
| `consulting_1hr` | $100 | `payment` | 60 min | 1:1 |

Amounts live in `src/lib/offers.ts` for documentation. Checkout charges via **stub Stripe Price IDs** in env (`STRIPE_PRICE_*`).

## Holds (must obey)

1. **Do not** create Stripe Products or Prices via API or Dashboard from this scaffold. Stub `price_…` IDs in `.env` only; replace when ready.
2. **Do not** invent Calendly URLs in code. Use `CALENDLY_EVENT_URI_*` / `CALENDLY_URL_*` env stubs.
3. **Do not** redesign the three public CTA pages or flip marketing CTAs until greenlit.
4. **Stripe Tax OFF** — Checkout sets `automatic_tax: { enabled: false }`. Confirmation-from stub: `CONFIRM_FROM_EMAIL=support@pragvance.ai`.

## URL contract

- **success_url:** `${NEXT_PUBLIC_SITE_URL}/access/book?session_id={CHECKOUT_SESSION_ID}&offer={offer_id}`  
  (`{CHECKOUT_SESSION_ID}` is the Stripe literal placeholder.)
- **cancel_url:** `${NEXT_PUBLIC_SITE_URL}{cancelPath}?canceled=1`  
  (`/shadow-lab-group`, `/shadow-lab-monthly`, or `/consulting` — not `/access`)

## Flow

1. Client `POST /api/checkout` with `{ "offer_id": "shadow_lab_group" }` (etc.).
2. Server creates a Checkout Session (`metadata.offer_id`, no `payment_method_types`, tax off) → `{ url }`.
3. Customer pays on Stripe; redirect to `/access/book`.
4. Book page retrieves the Session; **requires `payment_status === "paid"`** before resolving Calendly.
5. Calendly resolve order:
   - If `CALENDLY_API_TOKEN` + offer event URI → single-use scheduling link API.
   - Else `CALENDLY_URL_*` fallback.
   - Else show “Calendly not configured”.
6. Webhook `POST /api/webhooks/stripe` verifies signature; on `checkout.session.completed` logs + stub confirm; subscription/invoice events logged/stubbed.

## Env

See `.env.example` for:

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`
- `STRIPE_PRICE_SHADOW_LAB_GROUP` / `MONTHLY` / `CONSULTING`
- `CALENDLY_*` stubs
- `CONFIRM_FROM_EMAIL=support@pragvance.ai`

## Local webhook

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Files

- `src/lib/offers.ts` — offer map
- `src/lib/stripe.ts` — Stripe client + site URL
- `src/lib/calendly.ts` — single-use / URL fallback
- `src/app/api/checkout/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/access/book/page.tsx` — paid gate
- `src/app/access/page.tsx` — non-public stub only (not a chooser); cancel returns to CTA slugs
