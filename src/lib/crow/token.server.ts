import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Well-known local sentinel. Accepted only while `localPreviewAllowed` is true.
 * A deployment that copies this value into `CROW_DOWNLOAD_TOKEN_SECRET` still
 * fails closed, because the configured-secret path rejects the sentinel.
 */
export const LOCAL_PREVIEW_TOKEN_SECRET = "local-preview-only-not-a-credential";

type TokenPayload = { v: 1; sid: string; owner: string; exp: number };

export type TokenRead =
  | { ok: true; sid: string; owner: string; exp: number }
  | { ok: false; reason: "invalid" | "expired" };

export function crowDownloadSecret(env: NodeJS.ProcessEnv, preview: boolean): string | null {
  if (preview) return LOCAL_PREVIEW_TOKEN_SECRET;
  const configured = env.CROW_DOWNLOAD_TOKEN_SECRET?.trim() ?? "";
  if (!configured || configured === LOCAL_PREVIEW_TOKEN_SECRET || configured.length < 16) return null;
  return configured;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function issueCrowToken(payload: TokenPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function readCrowToken(token: string, secret: string, now: number): TokenRead {
  if (token.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    return { ok: false, reason: "invalid" };
  }
  const dot = token.indexOf(".");
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "invalid" };
  let parsed: TokenPayload;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (parsed.v !== 1 || typeof parsed.sid !== "string" || typeof parsed.owner !== "string" || typeof parsed.exp !== "number") {
    return { ok: false, reason: "invalid" };
  }
  if (parsed.exp <= now) return { ok: false, reason: "expired" };
  return { ok: true, sid: parsed.sid, owner: parsed.owner, exp: parsed.exp };
}
