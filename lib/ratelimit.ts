// Tiny per-instance rate limiter for public POST endpoints (forms, unlock). Best effort: Fluid Compute reuses instances.
import type { NextRequest } from "next/server";
const hits = new Map<string, number[]>();
export function limited(req: NextRequest, bucket: string, perMinute: number): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim(); const k = bucket + "|" + ip; const now = Date.now();
  const arr = (hits.get(k) ?? []).filter(t => now - t < 60_000); arr.push(now); hits.set(k, arr);
  if (hits.size > 5000) for (const [key, v] of hits) if (now - (v.at(-1) ?? 0) > 60_000) hits.delete(key);
  return arr.length > perMinute;
}
