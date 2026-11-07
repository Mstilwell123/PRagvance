/** @jsxRuntime automatic */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import CheckoutStatus from "../src/components/CheckoutStatus.tsx";

test("paid without booking URL -> contact page, no mailbox", () => {
  const html = renderToStaticMarkup(<CheckoutStatus state={{ kind: "paid", product: "consulting_1hr", label: "Consulting", bookingUrl: null }} />);
  assert.match(html, /Payment confirmed\. Use our <a[^>]*href="https:\/\/www\.pragvance\.ai\/contact"[^>]*>contact page<\/a> to schedule your session\./);
  assert.doesNotMatch(html, /support@|mailto:/);
  assert.doesNotMatch(html, /data-booking-link/);
});

test("paid with booking URL -> booking link shown", () => {
  const html = renderToStaticMarkup(<CheckoutStatus state={{ kind: "paid", product: "consulting_1hr", label: "Consulting", bookingUrl: "https://calendly.com/pragvance/example" }} />);
  assert.match(html, /href="https:\/\/calendly\.com\/pragvance\/example"/);
});

test("unconfirmed states never show booking or mailbox", () => {
  for (const state of [{ kind: "invalid" }, { kind: "error" }, { kind: "unpaid", product: null }] as const) {
    const html = renderToStaticMarkup(<CheckoutStatus state={state} />);
    assert.doesNotMatch(html, /calendly|support@|mailto:/);
    assert.match(html, /pragvance\.ai\/contact/);
  }
});
