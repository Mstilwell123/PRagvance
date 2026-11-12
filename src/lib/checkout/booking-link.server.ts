import { claimOnce, getJson, release, setJson } from "../kv.server";
import {
  calendlyConfig,
  createSingleUseLink,
  singleUseBookingUrl,
  type CalendlyConfig,
  type IssuedLink,
} from "./calendly.server";
import type { ProductKey } from "./products";

type Stored = { bookingUrl: string; at: string };

const storeKey = (sessionId: string) => `booking-link:${sessionId}`;
const lockKey = (sessionId: string) => `booking-link:lock:${sessionId}`;
const LOCK_TTL_SEC = 30;

async function readStored(sessionId: string): Promise<string | null> {
  const stored = await getJson<Stored>(storeKey(sessionId));
  return singleUseBookingUrl(stored?.bookingUrl);
}

/**
 * One single-use link per Checkout Session.
 * A refresh or a second Stripe delivery returns the stored URL and does not call Calendly again.
 * Missing or invalid Calendly env returns "email" and does not invent a public URL.
 */
export async function getOrCreateBookingLink(
  sessionId: string,
  deps: {
    env?: NodeJS.ProcessEnv;
    create?: (cfg: CalendlyConfig) => Promise<string>;
    productKey?: ProductKey;
  } = {},
): Promise<IssuedLink> {
  const existing = await readStored(sessionId);
  if (existing) return { delivery: "link", bookingUrl: existing };

  const cfg = calendlyConfig(deps.env ?? process.env, deps.productKey);
  if (!cfg) return { delivery: "email" };

  const lock = lockKey(sessionId);
  if (!(await claimOnce(lock, LOCK_TTL_SEC))) {
    const raced = await readStored(sessionId);
    if (raced) return { delivery: "link", bookingUrl: raced };
    throw new Error(`booking link busy session=${sessionId}`);
  }

  try {
    const again = await readStored(sessionId);
    if (again) return { delivery: "link", bookingUrl: again };
    const created = await (deps.create ?? ((c: CalendlyConfig) => createSingleUseLink(c)))(cfg);
    const bookingUrl = singleUseBookingUrl(created);
    if (!bookingUrl) throw new Error("calendly scheduling_links returned no single-use url");
    await setJson(storeKey(sessionId), { bookingUrl, at: new Date().toISOString() } satisfies Stored);
    return { delivery: "link", bookingUrl };
  } finally {
    await release(lock);
  }
}
