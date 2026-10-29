import { claimOnce, release } from "./kv.server";

const TTL_SEC = 7 * 24 * 60 * 60; // Stripe retries for up to 3 days

/**
 * Run `fn` at most once per Stripe event.id. Repeats (Stripe retries, replays,
 * parallel duplicate deliveries) return "duplicate" without side effects.
 * If `fn` throws, the claim is released so Stripe's retry can process it.
 */
export async function oncePerEvent(eventId: string, fn: () => Promise<void>): Promise<"done" | "duplicate"> {
  const key = `stripe:evt:${eventId}`;
  if (!(await claimOnce(key, TTL_SEC))) return "duplicate";
  try {
    await fn();
    return "done";
  } catch (e) {
    await release(key);
    throw e;
  }
}
