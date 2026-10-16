import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { ensurePage, getContacts, removeContact } from "@/lib/pages";
export const runtime = "nodejs";
const csvCell = (v: string) => /[",\n]/.test(v) || /^[=+\-@]/.test(v) ? `"${(/^[=+\-@]/.test(v) ? "'" : "") + v.replace(/"/g, '""')}"` : v;
// Audience contacts (subscribers + form responses). ?format=csv downloads them; ?box=inbox reads visitor messages.
export async function GET(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const p = await ensurePage(u); const box = req.nextUrl.searchParams.get("box") === "inbox" ? "inbox" : "contacts"; const b = await getContacts(p.pid, box);
  if (req.nextUrl.searchParams.get("format") === "csv") {
    const rows = [["Date", "Source", "Name", "Email", "Phone", "Company", "Choice", "Message"], ...b.items.map(c => [c.at, c.kind, c.name, c.email, c.phone, c.company, c.choice, c.message])];
    return new NextResponse(rows.map(r => r.map(x => csvCell(x ?? "")).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${p.handle}-${box}.csv"` } });
  }
  return NextResponse.json({ items: b.items, blocks: Object.fromEntries(p.links.filter(l => l.type === "form").map(l => [l.id, l.title])) });
}
export async function DELETE(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const p = await ensurePage(u); const { id, box } = await req.json().catch(() => ({}));
  await removeContact(p.pid, String(id ?? ""), box === "inbox" ? "inbox" : "contacts"); return NextResponse.json({ ok: true });
}
