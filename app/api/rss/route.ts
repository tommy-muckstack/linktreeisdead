import { NextRequest, NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/model";
import { safeGetText } from "@/lib/safefetch";
import { limited } from "@/lib/ratelimit";
export const runtime = "nodejs";
// Latest items from an RSS/Atom feed for the RSS block. Public feeds only (lib/safefetch blocks private networks on every
// redirect hop); cached for 15 minutes in a small least-recently-used map.
const MAX_CACHE = 200;
const cache = new Map<string, { at: number; items: unknown[] }>();
const remember = (url: string, items: unknown[]) => { cache.delete(url); cache.set(url, { at: Date.now(), items }); while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value!); };
const dec = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();
export async function GET(req: NextRequest) {
  const url = normalizeUrl(req.nextUrl.searchParams.get("url") ?? ""); const n = Math.min(10, Math.max(1, Number(req.nextUrl.searchParams.get("n")) || 3));
  if (!url || !/^https?:/.test(url)) return NextResponse.json({ items: [] }, { status: 400 });
  const hit = cache.get(url); if (hit && Date.now() - hit.at < 15 * 60_000) { cache.delete(url); cache.set(url, hit); return NextResponse.json({ items: hit.items.slice(0, n) }); }
  if (limited(req, "rss", 30)) return NextResponse.json({ items: [] }, { status: 429 });
  try {
    const r = await safeGetText(url, { timeoutMs: 5000, maxBytes: 2_000_000, headers: { accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" } });
    if (r.status < 200 || r.status >= 300) return NextResponse.json({ items: [] });
    const xml = r.text;
    const items = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/g)].slice(0, 10).map(m => { const x = m[0];
      const title = dec(x.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ""); const link = dec(x.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? "") || (x.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? "");
      const date = dec(x.match(/<(pubDate|published|updated)>([\s\S]*?)<\/\1>/)?.[2] ?? ""); return { title, link: normalizeUrl(link) ?? "", date: Number.isNaN(Date.parse(date)) ? "" : new Date(date).toISOString() }; }).filter(i => i.title && i.link);
    remember(url, items); return NextResponse.json({ items: items.slice(0, n) });
  } catch { return NextResponse.json({ items: [] }); }
}
