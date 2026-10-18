import { NextRequest, NextResponse } from "next/server";
import { hitShort } from "@/lib/owned";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Short links made in Link shortener: count the click, then redirect to the stored URL. Unknown codes go to the home page
// with a relative Location (req.url is the *.vercel.app origin behind the yourappisdead.com rewrite).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const url = await hitShort((await params).code);
  return url ? NextResponse.redirect(url, 302) : new NextResponse(null, { status: 307, headers: { Location: BP || "/" } });
}
