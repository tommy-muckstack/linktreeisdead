import { NextRequest, NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/model";
export const runtime = "nodejs";
const cache = new Map<string, { at: number; items: unknown[] }>();
const PRIVATE = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1|\[?f[cd])/i;
const dec = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();
// Latest items from an RSS/Atom feed for the RSS block. Public feeds only; cached for 15 minutes.
export async function GET(req: NextRequest) {
  const url = normalizeUrl(req.nextUrl.searchParams.get("url") ?? ""); const n = Math.min(10, Math.max(1, Number(req.nextUrl.searchParams.get("n")) || 3));
  if (!url || !/^https?:/.test(url) || PRIVATE.test(new URL(url).hostname)) return NextResponse.json({ items: [] }, { status: 400 });
  const hit = cache.get(url); if (hit && Date.now() - hit.at < 15 * 60_000) return NextResponse.json({ items: hit.items.slice(0, n) });
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" }, redirect: "follow" });
    const xml = (await r.text()).slice(0, 2_000_000);
    const items = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/g)].slice(0, 10).map(m => { const x = m[0];
      const title = dec(x.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ""); const link = dec(x.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? "") || (x.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? "");
      const date = dec(x.match(/<(pubDate|published|updated)>([\s\S]*?)<\/\1>/)?.[2] ?? ""); return { title, link: normalizeUrl(link) ?? "", date: Number.isNaN(Date.parse(date)) ? "" : new Date(date).toISOString() }; }).filter(i => i.title && i.link);
    cache.set(url, { at: Date.now(), items }); return NextResponse.json({ items: items.slice(0, n) });
  } catch { return NextResponse.json({ items: [] }); }
}
