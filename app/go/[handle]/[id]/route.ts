import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/pages";
import { visitFrom } from "@/lib/visit";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Counts a click, then redirects to the URL we stored (never to a URL taken from the request, so this can't be an open redirect).
// Locked links need ?code= (code lock) or ?ok=1 (age / sensitive confirmation); otherwise the visitor goes back to the page.
export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string; id: string }> }) {
  const { handle, id } = await params; const q = req.nextUrl.searchParams;
  const r = await recordClick(handle, id, { code: q.get("code") ?? undefined, ok: q.get("ok") === "1" }, visitFrom(req.headers, req.nextUrl.hostname) ?? undefined);
  const back = new URL(`${BP}/u/${encodeURIComponent(handle)}`, req.url);
  if (!r || typeof r !== "string") return NextResponse.redirect(back, 302);
  return NextResponse.redirect(r, 302);
}
