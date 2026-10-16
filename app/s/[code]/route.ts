import { NextRequest, NextResponse } from "next/server";
import { hitShort } from "@/lib/owned";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Short links made in Link shortener: count the click, then redirect to the stored URL.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const url = await hitShort((await params).code); return NextResponse.redirect(url ?? new URL(`${BP}/`, req.url), url ? 302 : 307);
}
