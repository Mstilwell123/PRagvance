import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCrowEntitlementByOwner, getCrowEntitlementBySession, type CrowEntitlement } from "./entitlement.server";
import {
  LOCAL_PREVIEW_OWNER_ID,
  LOCAL_PREVIEW_SESSION_ID,
  localPreviewEntitlement,
  resolveCrowCustomer,
  type CrowCustomer,
} from "./identity.server";
import {
  CROW_CURRENCY,
  CROW_LINK_TTL_MS,
  CROW_PRICE_CENTS,
  CROW_PRODUCT_KEY,
  crowDraftSurfaceEnabled,
  localPreviewAllowed,
} from "./product";
import { LOCAL_PREVIEW_TOKEN_SECRET, crowDownloadSecret, issueCrowToken, readCrowToken, type TokenRead } from "./token.server";

export type CrowJson = { status: number; body: Record<string, unknown>; bytes?: Uint8Array };

export type AccessDeps = {
  env?: NodeJS.ProcessEnv;
  now?: number;
  resolveCustomer?: (env: NodeJS.ProcessEnv) => Promise<CrowCustomer | null>;
  readTemplate?: () => Promise<Uint8Array>;
};

export type AccessDenial = { ok: false; status: number; reason: string };
export type AccessGrant = { ok: true; entitlement: CrowEntitlement };

/** Server-only path. Never under `public/` and never imported into a client bundle. */
export function crowTemplatePath(): string {
  return path.join(process.cwd(), "storage", "crow", "crow-template.md");
}

export async function readCrowTemplate(): Promise<Uint8Array> {
  return new Uint8Array(await readFile(crowTemplatePath()));
}

export function crowEntitlementDecision(
  ent: CrowEntitlement,
  identity: CrowCustomer,
  env: NodeJS.ProcessEnv,
): AccessDenial | AccessGrant {
  if (ent.source === "local_fixture") {
    if (!localPreviewAllowed(env) || ent.checkout_session_id !== LOCAL_PREVIEW_SESSION_ID) {
      return { ok: false, status: 403, reason: "fixture_blocked" };
    }
  } else if (ent.source !== "stripe_webhook") {
    return { ok: false, status: 403, reason: "not_entitled" };
  }
  if (ent.product_key !== CROW_PRODUCT_KEY) return { ok: false, status: 403, reason: "not_entitled" };
  if (!ent.owner_id) return { ok: false, status: 403, reason: "unbound_owner" };
  if (ent.owner_id !== identity.id) return { ok: false, status: 403, reason: "wrong_owner" };
  if (ent.status === "revoked" && ent.revoke_reason === "refund") return { ok: false, status: 403, reason: "refunded" };
  if (ent.status === "revoked" && ent.revoke_reason === "failed") return { ok: false, status: 403, reason: "failed" };
  if (ent.status !== "active") return { ok: false, status: 403, reason: "not_entitled" };
  if (ent.amount_total !== CROW_PRICE_CENTS || ent.currency !== CROW_CURRENCY) {
    return { ok: false, status: 403, reason: "not_entitled" };
  }
  return { ok: true, entitlement: ent };
}

export async function decideCrowAccess(identity: CrowCustomer | null, env: NodeJS.ProcessEnv): Promise<AccessDenial | AccessGrant> {
  if (!identity) return { ok: false, status: 401, reason: "unauthenticated" };
  if (!identity.verified) return { ok: false, status: 403, reason: "unverified" };
  if (localPreviewAllowed(env) && identity.id === LOCAL_PREVIEW_OWNER_ID) {
    return { ok: true, entitlement: localPreviewEntitlement(new Date().toISOString()) };
  }
  if (identity.id === LOCAL_PREVIEW_OWNER_ID) return { ok: false, status: 403, reason: "fixture_blocked" };
  const ent = await getCrowEntitlementByOwner(identity.id);
  if (!ent) return { ok: false, status: 403, reason: "not_entitled" };
  return crowEntitlementDecision(ent, identity, env);
}

/** Always refuses. Client price, amount, and success flags are ignored. Never calls Stripe. */
export async function handleCrowCheckout(raw: unknown, env: NodeJS.ProcessEnv = process.env): Promise<CrowJson> {
  void raw;
  if (!crowDraftSurfaceEnabled(env)) return { status: 404, body: { error: "Not found" } };
  return { status: 403, body: { error: "Live checkout is disabled", checkout: "disabled", charged: false } };
}

export async function handleCrowDownload(raw: unknown, deps: AccessDeps = {}): Promise<CrowJson> {
  void raw;
  const env = deps.env ?? process.env;
  if (!crowDraftSurfaceEnabled(env)) return { status: 404, body: { error: "Not found" } };
  const resolve = deps.resolveCustomer ?? resolveCrowCustomer;
  const decision = await decideCrowAccess(await resolve(env), env);
  if (!decision.ok) return { status: decision.status, body: { error: "Download denied", reason: decision.reason } };
  const secret = crowDownloadSecret(env, localPreviewAllowed(env) && decision.entitlement.source === "local_fixture");
  if (!secret || !decision.entitlement.owner_id) {
    return { status: 503, body: { error: "Download signing is not configured", reason: "signing_unconfigured" } };
  }
  const now = deps.now ?? Date.now();
  const token = issueCrowToken(
    { v: 1, sid: decision.entitlement.checkout_session_id, owner: decision.entitlement.owner_id, exp: now + CROW_LINK_TTL_MS },
    secret,
  );
  return {
    status: 200,
    body: { url: `/api/crow-template/file?token=${encodeURIComponent(token)}`, expires_in: CROW_LINK_TTL_MS / 1000 },
  };
}

function downloadSecrets(env: NodeJS.ProcessEnv): string[] {
  const secrets: string[] = [];
  if (localPreviewAllowed(env)) secrets.push(LOCAL_PREVIEW_TOKEN_SECRET);
  const configured = crowDownloadSecret(env, false);
  if (configured) secrets.push(configured);
  return secrets;
}

function readWithSecrets(token: string, secrets: string[], now: number): TokenRead {
  let expired = false;
  for (const secret of secrets) {
    const parsed = readCrowToken(token, secret, now);
    if (parsed.ok) return parsed;
    if (parsed.reason === "expired") expired = true;
  }
  return { ok: false, reason: expired ? "expired" : "invalid" };
}

export async function handleCrowFile(token: string | null, deps: AccessDeps = {}): Promise<CrowJson> {
  const env = deps.env ?? process.env;
  if (!crowDraftSurfaceEnabled(env)) return { status: 404, body: { error: "Not found" } };
  const secrets = downloadSecrets(env);
  if (secrets.length === 0) return { status: 503, body: { error: "Download signing is not configured", reason: "signing_unconfigured" } };
  if (!token) return { status: 403, body: { error: "Download denied", reason: "invalid" } };
  const now = deps.now ?? Date.now();
  const parsed = readWithSecrets(token, secrets, now);
  if (!parsed.ok) return { status: 403, body: { error: "Download denied", reason: parsed.reason } };
  const preview = localPreviewAllowed(env);

  const resolve = deps.resolveCustomer ?? resolveCrowCustomer;
  const identity = await resolve(env);
  if (!identity) return { status: 401, body: { error: "Download denied", reason: "unauthenticated" } };
  if (!identity.verified) return { status: 403, body: { error: "Download denied", reason: "unverified" } };
  if (identity.id !== parsed.owner) return { status: 403, body: { error: "Download denied", reason: "wrong_owner" } };

  let ent = await getCrowEntitlementBySession(parsed.sid);
  if (!ent && preview && parsed.sid === LOCAL_PREVIEW_SESSION_ID && parsed.owner === LOCAL_PREVIEW_OWNER_ID) {
    ent = localPreviewEntitlement(new Date(now).toISOString());
  }
  if (!ent) return { status: 403, body: { error: "Download denied", reason: "not_entitled" } };
  const decision = crowEntitlementDecision(ent, identity, env);
  if (!decision.ok) return { status: decision.status, body: { error: "Download denied", reason: decision.reason } };

  try {
    const bytes = await (deps.readTemplate ?? readCrowTemplate)();
    return {
      status: 200,
      body: { filename: "crow-template.md" },
      bytes,
    };
  } catch {
    return { status: 503, body: { error: "File is not available", reason: "missing_file" } };
  }
}

export const CROW_PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;
