/**
 * Tiny shared store for rate limits and dedupe.
 * - Production / multi-instance: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   (or Vercel KV's KV_REST_API_URL + KV_REST_API_TOKEN). Uses the REST API, no SDK.
 * - Otherwise: in-memory per instance (fine locally / on a single preview instance).
 */
type Mem = { v: number; exp: number };
const mem = new Map<string, Mem>();

function restCfg() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function kvBackend(): "redis" | "memory" {
  return restCfg() ? "redis" : "memory";
}

async function pipeline(cmds: (string | number)[][]): Promise<unknown[]> {
  const c = restCfg()!;
  const res = await fetch(`${c.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`kv ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

function sweep(now: number) {
  if (mem.size < 10_000) return;
  for (const [k, e] of mem) if (e.exp <= now) mem.delete(k);
  if (mem.size >= 10_000) mem.clear();
}

/** Fixed-window counter. Returns the count after this hit and seconds left. */
export async function incrWindow(key: string, windowSec: number): Promise<{ count: number; ttl: number }> {
  if (restCfg()) {
    try {
      const [count, , ttl] = (await pipeline([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
        ["TTL", key],
      ])) as number[];
      return { count: Number(count), ttl: Math.max(1, Number(ttl)) };
    } catch (e) {
      console.error("[kv] incr failed, using memory", e instanceof Error ? e.message : e);
    }
  }
  const now = Date.now();
  sweep(now);
  const e = mem.get(key);
  if (!e || e.exp <= now) {
    mem.set(key, { v: 1, exp: now + windowSec * 1000 });
    return { count: 1, ttl: windowSec };
  }
  e.v += 1;
  return { count: e.v, ttl: Math.max(1, Math.ceil((e.exp - now) / 1000)) };
}

/** Set key only if absent. true = we claimed it (first time). */
export async function claimOnce(key: string, ttlSec: number): Promise<boolean> {
  if (restCfg()) {
    try {
      const [r] = await pipeline([["SET", key, "1", "NX", "EX", ttlSec]]);
      return r === "OK";
    } catch (e) {
      console.error("[kv] claim failed, using memory", e instanceof Error ? e.message : e);
    }
  }
  const now = Date.now();
  sweep(now);
  const e = mem.get(key);
  if (e && e.exp > now) return false;
  mem.set(key, { v: 1, exp: now + ttlSec * 1000 });
  return true;
}

export async function release(key: string): Promise<void> {
  if (restCfg()) {
    try {
      await pipeline([["DEL", key]]);
      return;
    } catch {}
  }
  mem.delete(key);
}

/** For tests. */
export function _resetMemory() {
  mem.clear();
}
