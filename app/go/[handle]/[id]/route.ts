import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/pages";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Counts a click, then redirects to the URL we stored (never to a URL taken from the request, so this can't be an open redirect).
export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string; id: string }> }) {
  const { handle, id } = await params; const url = await recordClick(handle, id);
  return NextResponse.redirect(url ?? new URL(`${BP}/u/${encodeURIComponent(handle)}`, req.url), 302);
}
