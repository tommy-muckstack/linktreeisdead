// What the public page is allowed to see: no owner id, counters or lock codes.
import crypto from "node:crypto";
import type { Page } from "@/lib/model";
import type { PublicPage } from "@/components/page/PageView";
export function publicView(p: Page): PublicPage {
  const { ownerId: _o, daily: _d, views: _v, ...rest } = p;
  return { ...rest, settings: { ...p.settings, lock: { enabled: p.settings.lock.enabled, code: "" }, pixels: { facebook: "", google: "" } }, links: p.links.filter(l => !l.archived).map(l => ({ ...l, clicks: 0, lock: { ...l.lock, code: "" } })) };
}
export const pageLockCookie = (handle: string) => "ltl_" + handle.replace(/[^a-z0-9_]/g, "_");
export const pageLockValue = (handle: string, code: string) => crypto.createHmac("sha256", process.env.AUTH_SECRET ?? "dev").update(`lock|${handle}|${code}`).digest("base64url").slice(0, 32);
