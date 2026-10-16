import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { ensurePage, savePage } from "@/lib/pages";
export const runtime = "nodejs";
export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  return NextResponse.json({ page: await ensurePage(u) });
}
export async function PUT(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const body = await req.json().catch(() => null); if (!body || typeof body !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await ensurePage(u); const r = await savePage(u.id, body);
  if (r.error || !r.page) return NextResponse.json({ error: r.error ?? "Could not save" }, { status: 400 });
  return NextResponse.json({ page: r.page });
}
