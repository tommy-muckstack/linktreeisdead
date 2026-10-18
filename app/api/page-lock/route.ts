import { NextRequest, NextResponse } from "next/server";
import { getPage } from "@/lib/pages";
import { pageLockCookie, pageLockValue } from "@/lib/publicpage";
import { limited } from "@/lib/ratelimit";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs";
// Settings > Lock your page: a visitor enters the page code once and gets a cookie for that page. The cookie is named per
// page and scoped to the whole app (not just /u/<handle>) so the media kit and the Save-contact vCard honour it too.
export async function POST(req: NextRequest) {
  if (limited(req, "pagelock", 20)) return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
  const { handle, code } = await req.json().catch(() => ({}));
  const p = typeof handle === "string" ? await getPage(handle) : null;
  if (!p || !p.settings.lock.enabled || String(code ?? "") !== p.settings.lock.code) return NextResponse.json({ error: "That code isn't right." }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(pageLockCookie(p.handle), pageLockValue(p.handle, p.settings.lock.code), { path: BP || "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
