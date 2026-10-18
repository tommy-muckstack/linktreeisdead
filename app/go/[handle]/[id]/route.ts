import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/pages";
import { visitFrom } from "@/lib/visit";
import { limited } from "@/lib/ratelimit";
import { BP } from "@/lib/basepath";
import { pageLockCookie, pageLockedFor } from "@/lib/publicpage";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Counts a click, then redirects to the URL we stored (never to a URL taken from the request, so this can't be an open redirect).
// Locked links need ?code= (code lock) or ?ok=1 (age / sensitive confirmation); otherwise the visitor goes back to the page.
// A locked page (Settings > Lock your page) sends visitors without its cookie back to the page.
// Code tries share the /api/unlock rate limit so a code can't be brute-forced here instead.
// The way back is a relative Location: behind the yourappisdead.com rewrite req.url carries the *.vercel.app origin.
export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string; id: string }> }) {
  const { handle, id } = await params; const q = req.nextUrl.searchParams;
  const back = () => new NextResponse(null, { status: 302, headers: { Location: `${BP}/u/${encodeURIComponent(handle)}` } });
  const code = q.get("code") ?? undefined;
  if (code !== undefined && limited(req, "unlock", 20)) return new NextResponse("Too many tries. Wait a minute.", { status: 429, headers: { "retry-after": "60" } });
  const r = await recordClick(handle, id, { code, ok: q.get("ok") === "1" }, visitFrom(req.headers, req.nextUrl.hostname) ?? undefined, p => pageLockedFor(p, req.cookies.get(pageLockCookie(p.handle))?.value));
  if (!r || typeof r !== "string") return back();
  return NextResponse.redirect(r, 302);
}
