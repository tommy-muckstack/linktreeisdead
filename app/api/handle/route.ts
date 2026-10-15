import { NextRequest, NextResponse } from "next/server";
import { handleAvailable } from "@/lib/pages";
import { validateHandle } from "@/lib/model";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const h = (req.nextUrl.searchParams.get("h") ?? "").toLowerCase(); const bad = validateHandle(h);
  if (bad) return NextResponse.json({ available: false, reason: bad });
  const ok = await handleAvailable(h); return NextResponse.json({ available: ok, reason: ok ? "" : "That handle is taken." });
}
