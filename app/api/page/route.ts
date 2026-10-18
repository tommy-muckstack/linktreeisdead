import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { ensurePage, savePage, withCounts, PageUnavailable } from "@/lib/pages";
export const runtime = "nodejs";
const busy = (e: unknown) => { if (e instanceof PageUnavailable) return NextResponse.json({ error: e.message }, { status: 503, headers: { "retry-after": "2" } }); throw e; };
export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  try { return NextResponse.json({ page: await withCounts(await ensurePage(u)) }); } catch (e) { return busy(e); }
}
export async function PUT(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const body = await req.json().catch(() => null); if (!body || typeof body !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    await ensurePage(u); const r = await savePage(u.id, body);
    if (r.error || !r.page) return NextResponse.json({ error: r.error ?? "Could not save" }, { status: 400 });
    return NextResponse.json({ page: await withCounts(r.page) });
  } catch (e) { return busy(e); }
}
