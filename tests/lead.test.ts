import { test } from "node:test";
import assert from "node:assert/strict";
import { offerFromSlug, validateLead, OFFERS } from "../src/lib/lead.ts";

test("offer mapping", () => {
  assert.equal(offerFromSlug("shadow-lab"), "Shadow Lab");
  assert.equal(offerFromSlug("done-for-you"), "Done-for-You Setup");
  assert.equal(offerFromSlug("consultation"), "One-on-One AI Consultation");
  assert.equal(offerFromSlug("aiworkforce"), "AI Workforce");
  assert.equal(offerFromSlug("ai-workforce"), "AI Workforce");
  assert.equal(offerFromSlug("custom"), "Custom App / SaaS");
  assert.equal(offerFromSlug(null), "General");
  assert.equal(offerFromSlug("bogus"), "General");
  assert.equal(OFFERS.length, 6);
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

import { CUSTOM_BUILD_OPTIONS, CUSTOM_BUILD_URGENT_TAG } from "../src/lib/lead.ts";
import { customBuildEmail, deliverLead, sanitizeSubjectPart } from "../src/lib/custom-build-lead.ts";

test("custom build options validate", () => {
  for (const offer of CUSTOM_BUILD_OPTIONS) {
    const r = validateLead({ ...good, offer });
    assert.equal(r.ok, true, offer);
  }
  assert.equal(CUSTOM_BUILD_OPTIONS.length, 4);
  assert.equal(CUSTOM_BUILD_OPTIONS[0], "Custom App (web or mobile)");
  assert.equal(CUSTOM_BUILD_OPTIONS[3], "Not sure yet, let's talk");
});

test("custom build email subject, body, and reply-to", () => {
  const lead = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    offer: "Custom SaaS product" as const,
    building: "A field-ops\napp",
    message: "Need a quote",
    utm: { utm_source: "pricing" },
  };
  const mail = customBuildEmail(lead, "Pragvance <hello@example.com>");
  assert.equal(mail.to, "support@pragvance.ai");
  assert.equal(mail.replyTo, "ada@example.com");
  assert.equal(mail.from, "Pragvance <hello@example.com>");
  assert.equal(mail.subject, "URGENT: New Custom Build lead — A field-ops app");
  assert.match(mail.text, /Name: Ada Lovelace/);
  assert.match(mail.text, /Email: ada@example.com/);
  assert.match(mail.text, /Interest: Custom SaaS product/);
  assert.match(mail.text, /What are you building: A field-ops/);
  assert.match(mail.text, /Message: Need a quote/);
  assert.match(mail.text, /utm_source: pricing/);
  assert.equal(sanitizeSubjectPart("line\r\nbreak\u0000x"), "line break x");
});

test("custom path emails first and still succeeds if CRM fails", async () => {
  const lead = {
    name: "Ada",
    email: "ada@example.com",
    offer: "Custom App (web or mobile)" as const,
    building: "An app",
    message: "Hello",
    utm: {},
  };
  const emails: unknown[] = [];
  const crm: unknown[] = [];
  await deliverLead(lead, {
    sendEmail: async (item) => {
      emails.push(item.offer);
    },
    sendCrm: async (item, opts) => {
      crm.push(opts?.tags);
      throw new Error("crm down");
    },
  });
  assert.deepEqual(emails, ["Custom App (web or mobile)"]);
  assert.deepEqual(crm, [[CUSTOM_BUILD_URGENT_TAG]]);
});

test("custom path throws when email fails and still does not require CRM success", async () => {
  const lead = {
    name: "Ada",
    email: "ada@example.com",
    offer: "Add AI agents to an existing app" as const,
    building: "Agents",
    message: "Hi",
    utm: {},
  };
  let crmCalled = false;
  await assert.rejects(
    () =>
      deliverLead(lead, {
        sendEmail: async () => {
          throw new Error("resend down");
        },
        sendCrm: async () => {
          crmCalled = true;
          return "id";
        },
      }),
    /resend down/,
  );
  assert.equal(crmCalled, false);
});

test("consulting path stays CRM-only", async () => {
  const lead = {
    name: "Ada",
    email: "ada@example.com",
    offer: "Shadow Lab" as const,
    building: "A team",
    message: "Hi",
    utm: {},
  };
  const emails: unknown[] = [];
  const crm: unknown[] = [];
  await deliverLead(lead, {
    sendEmail: async () => {
      emails.push("sent");
    },
    sendCrm: async (item, opts) => {
      crm.push({ offer: item.offer, tags: opts?.tags ?? null });
      return "id";
    },
  });
  assert.deepEqual(emails, []);
  assert.deepEqual(crm, [{ offer: "Shadow Lab", tags: null }]);
});
