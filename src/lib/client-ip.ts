/**
 * Client IP a caller can't spoof. On Vercel, x-real-ip is set by the edge and
 * x-forwarded-for is overwritten; we never trust a client-supplied first XFF hop.
 * Local/dev (no proxy): falls back to "unknown" (one shared bucket).
 */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip") || headers.get("x-vercel-forwarded-for")?.split(",")[0];
  return (real || "unknown").trim().slice(0, 64) || "unknown";
}
