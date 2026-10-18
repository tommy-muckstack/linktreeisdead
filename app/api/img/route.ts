import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { putImage, MAX_IMAGE, GUEST_QUOTA } from "@/lib/images";
import { limited } from "@/lib/ratelimit";
export const runtime = "nodejs";
// Upload one image (or short MP4) as the raw request body. The editor resizes images in the browser first.
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (limited(req, "img", u.guest ? 20 : 60)) return NextResponse.json({ error: "Too many uploads. Wait a minute." }, { status: 429 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_IMAGE) return NextResponse.json({ error: "That file is too big (3.5 MB max)." }, { status: 413 });
  const bytes = Buffer.from(await req.arrayBuffer());
  const r = await putImage(u.id, bytes, u.guest ? GUEST_QUOTA : undefined);
  return r.url ? NextResponse.json({ url: r.url }) : NextResponse.json({ error: r.error, signIn: r.signIn }, { status: r.signIn ? 413 : 400 });
}
