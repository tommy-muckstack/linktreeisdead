import { NextRequest, NextResponse } from "next/server";
import { checkCode } from "@/lib/pages";
import { limited } from "@/lib/ratelimit";
export const runtime = "nodejs";
// Checks a link's lock code before the visitor is sent through /go (so a wrong code shows an error instead of bouncing).
export async function POST(req: NextRequest, { params }: { params: Promise<{ handle: string; id: string }> }) {
  if (limited(req, "unlock", 20)) return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
  const { handle, id } = await params; const { code } = await req.json().catch(() => ({}));
  return (await checkCode(handle, id, String(code ?? ""))) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Wrong code" }, { status: 403 });
}
