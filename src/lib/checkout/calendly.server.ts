/**
 * Single-use Calendly scheduling links (API v2).
 * A reusable public event URL is never accepted or returned.
 */

const SCHEDULING_LINKS = "https://api.calendly.com/scheduling_links";
const EVENT_TYPE_URI = /^https:\/\/api\.calendly\.com\/event_types\/[A-Za-z0-9-]+$/;
const CALL_TIMEOUT_MS = 8_000;

export type CalendlyConfig = { token: string; eventTypeUri: string };

export type IssuedLink =
  | { delivery: "link"; bookingUrl: string }
  | { delivery: "email" };

/** Both vars must be set, and the event type must be a Calendly API URI. Otherwise fail closed. */
export function calendlyConfig(env: NodeJS.ProcessEnv = process.env): CalendlyConfig | null {
  const token = env.CALENDLY_API_TOKEN?.trim() ?? "";
  const eventTypeUri = env.CALENDLY_EVENT_TYPE_URI?.trim() ?? "";
  if (!token || !EVENT_TYPE_URI.test(eventTypeUri)) return null;
  return { token, eventTypeUri };
}

/**
 * https://calendly.com/d/{id}/... only.
 * Public event pages (/owner/event-slug) and anything else return null.
 */
export function singleUseBookingUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.hostname !== "calendly.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "d" || parts.length < 2) return null;
  if (parts.some((part) => !/^[A-Za-z0-9-]+$/.test(part))) return null;
  return `https://calendly.com/${parts.join("/")}`;
}

/** POST /scheduling_links with max_event_count 1. Throws if the response is not a single-use URL. */
export async function createSingleUseLink(cfg: CalendlyConfig, post: typeof fetch = fetch): Promise<string> {
  const res = await post(SCHEDULING_LINKS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      max_event_count: 1,
      owner: cfg.eventTypeUri,
      owner_type: "EventType",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
  });
  if (!res.ok) {
    await res.body?.cancel().catch(() => undefined);
    throw new Error(`calendly scheduling_links ${res.status}`);
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error("calendly scheduling_links invalid json");
  }
  const bookingUrl = singleUseBookingUrl(
    (body as { resource?: { booking_url?: unknown } } | null)?.resource?.booking_url,
  );
  if (!bookingUrl) throw new Error("calendly scheduling_links returned no single-use url");
  return bookingUrl;
}
