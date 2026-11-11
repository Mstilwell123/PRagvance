# Booking gate — Stripe test-mode run

This is a manual check for after the booking gate is deployed to a preview that uses **test** keys. It does not spend real money.

Do not point it at live Stripe, the live Calendly event, or a production GoHighLevel location. The preflight script only reads local env names and exits. It does not call those APIs:

```bash
node scripts/booking-gate-preflight.mjs
```

Every test buyer must be obvious in the other systems. Use a name and email that contain `TEST`, for example `TEST Buyer` and `test.buyer@example.com`.

## What you need

| Name | What to use |
| --- | --- |
| `PRAGVANCE_STRIPE_SECRET_KEY` | Stripe **test** secret, `sk_test_...`. Refuse `sk_live_`. |
| `STRIPE_PRICE_CONSULTING` | An existing test-mode Price id for the one-hour consultation. Do not create a Price for this check. |
| `CHECKOUT_ENABLED` | `true` on that preview only. |
| `NEXT_PUBLIC_SITE_URL` | The preview origin, no trailing slash. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_...`) of a **test-mode** webhook endpoint. |
| `CALENDLY_API_TOKEN` | Calendly personal access token that can create scheduling links. |
| `CALENDLY_EVENT_TYPE_URI` | `https://api.calendly.com/event_types/{id}` for a **secret** 60-minute event used only for this test. Not the public event page. |
| `GHL_PRIVATE_TOKEN` | GoHighLevel private integration token. |
| `GHL_LOCATION_ID` | The **AI Workforce** location id. The app does not hardcode a location. |
| `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` | Shared store so a refresh does not create a second link. |

Unset `CONSULTATION_BOOKING_URL` on that preview. The app does not read it. If it is still set, the preflight stops.

Stripe webhook endpoint (test mode), URL `https://<preview-host>/api/webhooks/stripe`, events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Do not add a live-mode endpoint for this run.

Before the run, set the real 60-minute Calendly event to secret / unlisted so the old public page cannot take a booking. This check uses a separate secret event type.

## Steps

1. Run the preflight. It must print that each variable is set and then the three checks below.
2. On the preview, start checkout for the one-hour consultation. Pay with Stripe test card `4242 4242 4242 4242`, any future date, any CVC. The buyer name and email must contain `TEST`.
3. Stripe redirects to `/access/book?session_id=cs_test_...`.
4. **Link issued.** The page shows Payment confirmed and a Schedule button whose URL starts with `https://calendly.com/d/`. Refresh the page. The URL stays the same. In Calendly, that is one scheduling link with a max event count of 1.
5. **Booking page.** Open that link and complete one booking. The invitee name must contain `TEST`. Open the same link again. Calendly refuses another booking. Open the old public 60-minute page. It must not accept a booking.
6. **GoHighLevel.** In the AI Workforce location, find the contact by the TEST email. Tags are `paid` and `paid - consulting (60 min 1:1)`. Source is `pragvance.ai checkout`. There is one note with the amount, `consulting_1hr`, and the Checkout Session id.

If `CALENDLY_API_TOKEN` or `CALENDLY_EVENT_TYPE_URI` is missing, the confirmation page says we'll email the booking link and does not show a Calendly URL. That is the closed failure. Fix the env and use a new test payment. Do not paste a public event URL into the env.

## Cleanup

- Cancel or delete the Calendly event whose invitee contains `TEST`.
- Delete or archive the GoHighLevel contact whose email contains `test.buyer` (or the TEST address you used) in the AI Workforce location.
- Leave the Stripe test payment, or refund it in the test dashboard. It did not charge a real card.
- Do not copy the single-use link into the repo, a public page, or `CONSULTATION_BOOKING_URL`.
