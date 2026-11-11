#!/usr/bin/env node
/**
 * Local checklist before a Stripe test-mode run of the booking gate.
 * Reads environment variables and prints the manual steps.
 * Does not call Stripe, Calendly, or GoHighLevel, and does not print secret values.
 *
 *   node scripts/booking-gate-preflight.mjs
 *
 * The steps themselves are in docs/booking-gate-test-mode.md.
 */

const checks = [
  ["PRAGVANCE_STRIPE_SECRET_KEY", (value) => value.startsWith("sk_test_"), "must start with sk_test_"],
  ["STRIPE_WEBHOOK_SECRET", (value) => value.startsWith("whsec_"), "must start with whsec_"],
  ["CALENDLY_API_TOKEN", (value) => value.length > 0, "required"],
  [
    "CALENDLY_EVENT_TYPE_URI",
    (value) => /^https:\/\/api\.calendly\.com\/event_types\/[A-Za-z0-9-]+$/.test(value),
    "must be https://api.calendly.com/event_types/{id}",
  ],
  ["GHL_PRIVATE_TOKEN", (value) => value.length > 0, "required"],
  ["GHL_LOCATION_ID", (value) => value.length > 0, "must be the AI Workforce location id"],
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const stripeKey = process.env.PRAGVANCE_STRIPE_SECRET_KEY?.trim() ?? "";
const stripeFallback = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
if (stripeKey.startsWith("sk_live_") || stripeFallback.startsWith("sk_live_")) {
  fail("Refusing live Stripe key. Use a test key (sk_test_) only.");
}

if (process.env.CONSULTATION_BOOKING_URL?.trim()) {
  fail("CONSULTATION_BOOKING_URL is set. Unset it before the test run. The app ignores it.");
}

let bad = false;
for (const [name, ok, hint] of checks) {
  const value = process.env[name]?.trim() ?? "";
  if (!value) {
    console.error(`${name}: missing (${hint})`);
    bad = true;
    continue;
  }
  if (!ok(value)) {
    console.error(`${name}: invalid (${hint})`);
    bad = true;
    continue;
  }
  console.log(`${name}: set`);
}

if (bad || process.exitCode) {
  process.exit(process.exitCode || 1);
}

console.log("");
console.log("Test-mode preflight passed. No network calls were made.");
console.log("Follow docs/booking-gate-test-mode.md. Use a name and email that contain TEST.");
console.log("The run has to show three things:");
console.log("1. A one-time Calendly link is issued after the simulated payment.");
console.log("2. The booking page accepts that link, a second use is refused, and the public link stays unusable.");
console.log("3. The contact and paid tags reach GoHighLevel at the AI Workforce location.");
console.log("Clean up the TEST contact and the TEST booking when you are done.");
