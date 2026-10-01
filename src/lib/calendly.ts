import {
  type OfferId,
  calendlyEventUriEnvKey,
  calendlyUrlEnvKey,
} from "@/lib/offers";

/**
 * Resolve a booking URL for a paid offer.
 * Prefer Calendly single-use scheduling link when API token + event URI are set;
 * otherwise fall back to CALENDLY_URL_* env stubs. Never hardcode public URLs.
 */
export async function resolveCalendlyBookingUrl(
  offerId: OfferId,
): Promise<string | null> {
  const token = process.env.CALENDLY_API_TOKEN?.trim();
  const eventUriKey = calendlyEventUriEnvKey(offerId);
  const eventUri = process.env[eventUriKey]?.trim();

  if (token && eventUri) {
    try {
      const singleUse = await createCalendlySingleUseLink(token, eventUri);
      if (singleUse) return singleUse;
    } catch (err) {
      console.error("Calendly single-use link failed; trying URL fallback:", err);
    }
  }

  const urlKey = calendlyUrlEnvKey(offerId);
  const fallback = process.env[urlKey]?.trim();
  return fallback || null;
}

async function createCalendlySingleUseLink(
  token: string,
  eventTypeUri: string,
): Promise<string | null> {
  const res = await fetch("https://api.calendly.com/scheduling_links", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      max_event_start_time: null,
      owner: eventTypeUri,
      owner_type: "EventType",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Calendly scheduling_links error:", res.status, text);
    return null;
  }

  const data = (await res.json()) as {
    resource?: { booking_url?: string };
  };
  return data.resource?.booking_url?.trim() || null;
}
