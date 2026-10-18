// Who's visiting a public page, reduced to the aggregate buckets Insights shows. Nothing personal is stored:
// the visitor id is a salted daily hash used only to count unique visitors, and is dropped after two days.
import crypto from "node:crypto";
import type { Visit } from "@/lib/pages";
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|headless|lighthouse|monitor/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);
export function sourceOf(ref: string, self: string): string {
  if (!ref) return "direct";
  let h = ""; try { h = new URL(ref).hostname.replace(/^www\.|^m\.|^l\.|^lm\./, ""); } catch { return "direct"; }
  if (!h || h === self) return "direct";
  const map: Record<string, string> = { "instagram.com": "instagram", "tiktok.com": "tiktok", "youtube.com": "youtube", "youtu.be": "youtube", "t.co": "x", "x.com": "x", "twitter.com": "x", "facebook.com": "facebook", "threads.net": "threads", "linkedin.com": "linkedin", "lnkd.in": "linkedin", "reddit.com": "reddit", "pinterest.com": "pinterest", "snapchat.com": "snapchat", "google.com": "google", "bing.com": "bing", "duckduckgo.com": "duckduckgo", "bsky.app": "bluesky" };
  return map[h] ?? (h.length > 40 ? h.slice(0, 40) : h);
}
export const deviceOf = (ua: string) => /ipad|tablet/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
export function visitFrom(h: Headers, self: string): Visit | null {
  const ua = h.get("user-agent") ?? ""; if (isBot(ua)) return null;
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]!.trim();
  const salt = process.env.AUTH_SECRET ?? "dev"; const day = new Date().toISOString().slice(0, 10);
  return { ref: sourceOf(h.get("referer") ?? "", self), country: (h.get("x-vercel-ip-country") ?? "").toUpperCase().slice(0, 2) || "??", device: deviceOf(ua), visitor: crypto.createHmac("sha256", salt).update(`${day}|${ip}|${ua}`).digest("base64url").slice(0, 16) };
}
