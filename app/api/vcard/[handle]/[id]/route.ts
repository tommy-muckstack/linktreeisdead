import { NextRequest, NextResponse } from "next/server";
import { getPage } from "@/lib/pages";
export const runtime = "nodejs";
const esc = (s: string) => s.replace(/[\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
// "Save contact" on a Contact details block: a vCard built from the block's fields.
export async function GET(_: NextRequest, { params }: { params: Promise<{ handle: string; id: string }> }) {
  const { handle, id } = await params; const p = await getPage(handle); const b = p?.links.find(l => l.id === id && l.type === "contact" && l.enabled);
  if (!p || !b) return new NextResponse("Not found", { status: 404 });
  const d = b.data as Record<string, string>;
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(d.name || b.title || p.title)}`, d.org && `ORG:${esc(d.org)}`, d.role && `TITLE:${esc(d.role)}`, d.phone && `TEL;TYPE=CELL:${esc(d.phone)}`, d.email && `EMAIL:${esc(d.email)}`, d.site && `URL:${esc(d.site)}`, d.address && `ADR:;;${esc(d.address)};;;;`, d.note && `NOTE:${esc(d.note)}`, "END:VCARD"].filter(Boolean).join("\r\n");
  return new NextResponse(lines, { headers: { "content-type": "text/vcard; charset=utf-8", "content-disposition": `attachment; filename="${(d.name || p.handle).replace(/[^a-z0-9]+/gi, "-")}.vcf"` } });
}
