// What the public page is allowed to see: no owner id, counters or lock codes. Only live links (enabled, not archived,
// inside their schedule window) are sent, and a locked link's URL is blanked: visitors go through /go, which checks the lock.
import crypto from "node:crypto";
import { isLive, URL_BLOCKS, type Page } from "@/lib/model";
import type { PublicPage } from "@/components/page/PageView";
export function publicView(p: Page, now = Date.now()): PublicPage {
  const { ownerId: _o, daily: _d, views: _v, ...rest } = p;
  const links = p.links.filter(l => isLive(l, now)).map(l => ({ ...l, clicks: 0, url: l.lock.kind !== "none" && URL_BLOCKS.includes(l.type) ? "" : l.url, lock: { ...l.lock, code: "" } }));
  return { ...rest, settings: { ...p.settings, lock: { enabled: p.settings.lock.enabled, code: "" }, pixels: { facebook: "", google: "" } }, links };
}
export const pageLockCookie = (handle: string) => "ltl_" + handle.replace(/[^a-z0-9_]/g, "_");
export const pageLockValue = (handle: string, code: string) => crypto.createHmac("sha256", process.env.AUTH_SECRET ?? "dev").update(`lock|${handle}|${code}`).digest("base64url").slice(0, 32);
/** Is this page locked for the visitor holding `cookie` (the value of pageLockCookie(handle))? */
export const pageLockedFor = (p: Page, cookie: string | undefined) => !!(p.settings.lock.enabled && p.settings.lock.code) && cookie !== pageLockValue(p.handle, p.settings.lock.code);
