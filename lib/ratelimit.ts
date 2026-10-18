// Tiny per-instance rate limiter for public endpoints (forms, unlock, uploads). Best effort: Fluid Compute reuses instances.
import type { NextRequest } from "next/server";
const hits = new Map<string, number[]>();
export const clientIp = (req: NextRequest) => (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
/** More than `perMinute` hits on `key` in the last minute? (Counts this hit.) */
export function limitedKey(key: string, perMinute: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter(t => now - t < 60_000); arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - (v.at(-1) ?? 0) > 60_000) hits.delete(k);
  return arr.length > perMinute;
}
/** Per client IP within a bucket. */
export const limited = (req: NextRequest, bucket: string, perMinute: number): boolean => limitedKey(bucket + "|" + clientIp(req), perMinute);
