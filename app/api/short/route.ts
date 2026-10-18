import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { listShorts, createShort, deleteShort } from "@/lib/owned";
import { limited } from "@/lib/ratelimit";
export const runtime = "nodejs";
// Short links are public redirects on our domain, so making one needs an account (guests get a sign-in prompt: signIn: true).
const signIn = () => NextResponse.json({ error: "Sign in to create short links.", signIn: true }, { status: 401 });
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ items: await listShorts(u.id), signIn: u.guest }); }
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u || u.guest) return signIn();
  if (limited(req, "short", 20)) return NextResponse.json({ error: "Too many short links at once. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({})); const r = await createShort(u.id, String(b.url ?? ""), b.code ? String(b.code) : undefined, b.title ? String(b.title) : undefined);
  return r.error ? NextResponse.json({ error: r.error }, { status: 400 }) : NextResponse.json({ item: r.short });
}
export async function DELETE(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (limited(req, "short-del", 60)) return NextResponse.json({ error: "Too many requests. Wait a minute." }, { status: 429 });
  const { code } = await req.json().catch(() => ({})); return NextResponse.json({ ok: await deleteShort(u.id, String(code ?? "")) });
}
