import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { listShorts, createShort, deleteShort } from "@/lib/owned";
export const runtime = "nodejs";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ items: await listShorts(u.id) }); }
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const b = await req.json().catch(() => ({})); const r = await createShort(u.id, String(b.url ?? ""), b.code ? String(b.code) : undefined, b.title ? String(b.title) : undefined);
  return r.error ? NextResponse.json({ error: r.error }, { status: 400 }) : NextResponse.json({ item: r.short });
}
export async function DELETE(req: NextRequest) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const { code } = await req.json().catch(() => ({})); return NextResponse.json({ ok: await deleteShort(u.id, String(code ?? "")) }); }
