import { randomUUID } from "node:crypto";
import type Stripe from "stripe";

export const GIFT_TIERS = ["starter", "headstart", "builder"] as const;
export type GiftTier = (typeof GIFT_TIERS)[number];

export const GIFT_PATHS = ["gift", "direct"] as const;
export type GiftPath = (typeof GIFT_PATHS)[number];

export const GIFT_PRICE_ENV: Record<GiftTier, "STRIPE_PRICE_STARTER" | "STRIPE_PRICE_HEADSTART" | "STRIPE_PRICE_BUILDER"> = {
  starter: "STRIPE_PRICE_STARTER",
  headstart: "STRIPE_PRICE_HEADSTART",
  builder: "STRIPE_PRICE_BUILDER",
};

export const GIFT_TIER_LABEL: Record<GiftTier, string> = {
  starter: "Starter",
  headstart: "Head Start",
  builder: "Builder",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function giftCheckoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.STRIPE_CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}

/** True when a secret or restricted live key is present and live charges are not allowed. Never log the key. */
export function liveStripeKeyBlocked(secretKey: string | undefined, env: NodeJS.ProcessEnv): boolean {
  const key = secretKey?.trim() ?? "";
  const live = key.startsWith("sk_live_") || key.startsWith("rk_live_");
  return live && env.STRIPE_ALLOW_LIVE !== "1";
}

export function isGiftTier(v: unknown): v is GiftTier {
  return typeof v === "string" && (GIFT_TIERS as readonly string[]).includes(v);
}

export function isGiftPath(v: unknown): v is GiftPath {
  return typeof v === "string" && (GIFT_PATHS as readonly string[]).includes(v);
}

export function isGiftCheckoutRequest(raw: unknown): boolean {
  return !!raw && typeof raw === "object" && "tier" in (raw as object) && "path" in (raw as object);
}

export function isGiftSessionMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
): boolean {
  return metadata?.kind === "education_gift" && isGiftTier(metadata.gift_tier) && isGiftPath(metadata.gift_path);
}

export type GiftRecipient = {
  recipientName: string;
  recipientEmail: string;
  message: string;
  deliveryDate: string;
};

export type GiftCheckoutInput = {
  tier: GiftTier;
  path: GiftPath;
  recipient?: GiftRecipient;
};

export function isValidIsoDate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

export function isIsoDateTodayOrFuture(value: string, todayIso?: string): boolean {
  if (!isValidIsoDate(value)) return false;
  const today = todayIso ?? new Date().toISOString().slice(0, 10);
  return value >= today;
}

export function validateGiftCheckout(raw: unknown): { ok: true; value: GiftCheckoutInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request" };
  const body = raw as Record<string, unknown>;
  if (!isGiftTier(body.tier)) return { ok: false, error: "Unknown tier" };
  if (!isGiftPath(body.path)) return { ok: false, error: "Unknown path" };

  if (body.path === "direct") {
    return { ok: true, value: { tier: body.tier, path: body.path } };
  }

  const name = typeof body.recipientName === "string" ? body.recipientName.trim() : "";
  const email = typeof body.recipientEmail === "string" ? body.recipientEmail.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const deliveryDate = typeof body.deliveryDate === "string" ? body.deliveryDate.trim() : "";

  if (!name || name.length > 120) return { ok: false, error: "Recipient name is required" };
  if (!EMAIL.test(email) || email.length > 254) return { ok: false, error: "Recipient email is invalid" };
  if (message.length > 500) return { ok: false, error: "Message is too long" };
  if (!isIsoDateTodayOrFuture(deliveryDate)) return { ok: false, error: "Delivery date is invalid" };

  return {
    ok: true,
    value: {
      tier: body.tier,
      path: body.path,
      recipient: { recipientName: name, recipientEmail: email, message, deliveryDate },
    },
  };
}

export function priceIdForGiftTier(tier: GiftTier, env: NodeJS.ProcessEnv): string | null {
  const id = env[GIFT_PRICE_ENV[tier]]?.trim() || "";
  return id.startsWith("price_") ? id : null;
}

export type GiftCheckoutDeps = {
  env?: NodeJS.ProcessEnv;
  siteUrl: () => string;
  secretKey?: () => string | undefined;
  nowIsoDate?: () => string;
  idempotencyKey?: string;
  createSession: (
    params: Stripe.Checkout.SessionCreateParams,
    options: { idempotencyKey: string },
  ) => Promise<{ url: string | null }>;
};

type Json = { status: number; body: Record<string, unknown> };

function giftMetadata(input: GiftCheckoutInput): Stripe.MetadataParam {
  const meta: Stripe.MetadataParam = {
    kind: "education_gift",
    gift_tier: input.tier,
    gift_path: input.path,
  };
  if (input.path === "gift" && input.recipient) {
    meta.recipient_name = input.recipient.recipientName;
    meta.recipient_email = input.recipient.recipientEmail;
    meta.gift_message = input.recipient.message;
    meta.delivery_date = input.recipient.deliveryDate;
  }
  return meta;
}

/** POST { tier, path, ...gift fields } -> { url }. Client amounts and price ids are ignored. */
export async function handleGiftCheckout(raw: unknown, deps: GiftCheckoutDeps): Promise<Json> {
  const env = deps.env ?? process.env;
  const parsed = validateGiftCheckout(raw);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };

  if (!giftCheckoutEnabled(env)) return { status: 403, body: { error: "Checkout is not enabled" } };

  const secret = deps.secretKey ? deps.secretKey() : env.PRAGVANCE_STRIPE_SECRET_KEY?.trim() || env.STRIPE_SECRET_KEY?.trim();
  if (!secret || liveStripeKeyBlocked(secret, env)) {
    return { status: 503, body: { error: "Checkout not configured" } };
  }

  const price = priceIdForGiftTier(parsed.value.tier, env);
  if (!price) return { status: 503, body: { error: "Price not configured" } };

  let site: string;
  try {
    site = deps.siteUrl();
  } catch {
    return { status: 503, body: { error: "Checkout not configured" } };
  }

  const coupon = env.STRIPE_COUPON_BLACKFRIDAY?.trim() || "";
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: `${site}/gift?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/gift?checkout=canceled`,
    metadata: giftMetadata(parsed.value),
  };
  if (coupon) params.discounts = [{ coupon }];

  const idempotencyKey = deps.idempotencyKey?.trim() || `gift_${parsed.value.tier}_${parsed.value.path}_${randomUUID()}`;
  const session = await deps.createSession(params, { idempotencyKey });
  if (!session.url) return { status: 502, body: { error: "Checkout session missing url" } };
  return { status: 200, body: { url: session.url } };
}
