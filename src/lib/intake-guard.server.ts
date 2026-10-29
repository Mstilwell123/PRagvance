import { createHash } from "node:crypto";
import { claimOnce, incrWindow } from "./kv.server";

const DEDUPE_TTL_SEC = 24 * 60 * 60;
const WINDOW_SEC = 10 * 60;
const MAX_PER_IP = Number(process.env.INTAKE_RL_PER_IP) > 0 ? Number(process.env.INTAKE_RL_PER_IP) : 10;

/** Stable fingerprint: who (Stripe session, else IP) + the exact answers. */
export function intakeFingerprint(data: unknown, sessionId: string, ip: string): string {
  const canon = JSON.stringify(data, Object.keys((data as object) || {}).sort());
  return createHash("sha256").update(`${sessionId || `ip:${ip}`}\n${canon}`).digest("hex").slice(0, 40);
}

export type IntakeGate = { kind: "ok" } | { kind: "duplicate" } | { kind: "limited"; retryAfter: number };

export async function gateIntake(data: unknown, sessionId: string, ip: string): Promise<IntakeGate> {
  const rl = await incrWindow(`intake:ip:${ip}`, WINDOW_SEC);
  if (rl.count > MAX_PER_IP) return { kind: "limited", retryAfter: rl.ttl };
  const first = await claimOnce(`intake:fp:${intakeFingerprint(data, sessionId, ip)}`, DEDUPE_TTL_SEC);
  return first ? { kind: "ok" } : { kind: "duplicate" };
}
