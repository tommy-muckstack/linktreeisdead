import { NextRequest, NextResponse } from "next/server";
import { getPage, addContact } from "@/lib/pages";
import { limited } from "@/lib/ratelimit";
export const runtime = "nodejs";
const s = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
// Public form endpoint: Subscribe button, form blocks (contact / email / SMS / poll) and visitor messages.
export async function POST(req: NextRequest) {
  if (limited(req, "submit", 10)) return NextResponse.json({ error: "Too many submissions. Try again in a minute." }, { status: 429 });
  const b = await req.json().catch(() => null); if (!b) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const p = await getPage(s(b.handle, 40)); if (!p) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  const kind = s(b.kind, 20); const v = b.values ?? {};
  const c = { kind, block: s(b.block, 12), name: s(v.name, 120), email: s(v.email, 200), phone: s(v.phone, 30), message: s(v.message, 1000), company: s(v.company, 120), choice: s(v.choice, 80) };
  if (kind === "message") { if (!p.settings.messages) return NextResponse.json({ error: "Messages are off" }, { status: 403 }); }
  else if (kind === "subscribe") { if (!p.settings.subscribe) return NextResponse.json({ error: "Subscribe is off" }, { status: 403 }); }
  else { const blk = p.links.find(l => l.id === c.block && l.type === "form" && l.enabled && !l.archived); if (!blk) return NextResponse.json({ error: "Form not found" }, { status: 404 }); }
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (c.phone && !/^\+?[0-9 ()-]{6,20}$/.test(c.phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!c.email && !c.phone && !c.message && !c.choice) return NextResponse.json({ error: "Fill in the form first." }, { status: 400 });
  await addContact(p.pid, c, kind === "message" ? "inbox" : "contacts");
  return NextResponse.json({ ok: true });
}
