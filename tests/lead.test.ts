import { test } from "node:test";
import assert from "node:assert/strict";
import { offerFromSlug, validateLead, OFFERS } from "../src/lib/lead.ts";

test("offer mapping", () => {
  assert.equal(offerFromSlug("shadow-lab"), "Shadow Lab");
  assert.equal(offerFromSlug("done-for-you"), "Done-for-You Setup");
  assert.equal(offerFromSlug("consultation"), "One-on-One AI Consultation");
  assert.equal(offerFromSlug("aiworkforce"), "AI Workforce");
  assert.equal(offerFromSlug("ai-workforce"), "AI Workforce");
  assert.equal(offerFromSlug("custom"), "Custom app / SaaS");
  assert.equal(offerFromSlug(null), "General");
  assert.equal(offerFromSlug("bogus"), "General");
  assert.equal(OFFERS.length, 7);
  assert.equal(offerFromSlug("first-agent"), "First Agent");
});

const good = { name: "A B", email: "a@b.co", offer: "Shadow Lab", building: "x", message: "hi" };
test("validation", () => {
  assert.equal(validateLead(good).ok, true);
  assert.equal(validateLead({ ...good, name: "" }).ok, false);
  assert.equal(validateLead({ ...good, email: "nope" }).ok, false);
  assert.equal(validateLead({ ...good, offer: "Other" }).ok, false);
  assert.equal(validateLead({ ...good, message: "x".repeat(5001) }).ok, false);
  const r = validateLead({ ...good, utm: { utm_source: "ig", evil: "x" } });
  assert.ok(r.ok && r.lead.utm.utm_source === "ig" && !("evil" in r.lead.utm));
});
