import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { ensurePage, getInsights, getContacts } from "@/lib/pages";
import { today } from "@/lib/model";
export const runtime = "nodejs";
// Insights for the signed-in owner's page over the last `days` days (and the period before, for comparisons).
export async function GET(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const days = Math.min(400, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 7));
  const p = await ensurePage(u); const ins = await getInsights(p.pid); const contacts = await getContacts(p.pid);
  const now = Date.now(); const day = (i: number) => today(new Date(now - i * 864e5));
  const series = Array.from({ length: days }, (_, k) => { const d = day(days - 1 - k); const s = ins.days[d]; const legacy = p.daily[d];
    return { day: d, v: s?.v ?? legacy?.v ?? 0, c: s?.c ?? legacy?.c ?? 0, uv: s?.uv ?? 0, links: s?.links ?? {} }; });
  const sum = (from: number, to: number) => { let v = 0, c = 0, uv = 0; for (let i = from; i < to; i++) { const d = day(i); v += ins.days[d]?.v ?? p.daily[d]?.v ?? 0; c += ins.days[d]?.c ?? p.daily[d]?.c ?? 0; uv += ins.days[d]?.uv ?? 0; } return { views: v, clicks: c, uv, ctr: v ? Math.round((c / v) * 1000) / 10 : 0 }; };
  const agg = (k: "ref" | "geo" | "dev" | "links") => { const m: Record<string, number> = {}; for (let i = 0; i < days; i++) for (const [a, n] of Object.entries(ins.days[day(i)]?.[k] ?? {})) m[a] = (m[a] ?? 0) + n; return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const since = new Date(now - days * 864e5).toISOString();
  const lifetimeClicks = p.links.reduce((a, l) => a + l.clicks, 0);
  return NextResponse.json({
    days, series, totals: { ...sum(0, days), contacts: contacts.items.filter(c => c.at >= since).length }, prev: sum(days, days * 2),
    refs: agg("ref").slice(0, 10), geo: agg("geo").slice(0, 10), dev: agg("dev"),
    links: agg("links").map(([id, n]) => ({ id, clicks: n, title: p.links.find(l => l.id === id)?.title ?? "Deleted link" })).slice(0, 20),
    lifetime: { views: p.views, clicks: lifetimeClicks, ctr: p.views ? Math.round((lifetimeClicks / p.views) * 1000) / 10 : 0, contacts: contacts.items.length },
  });
}
