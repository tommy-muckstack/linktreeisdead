import { NextRequest, NextResponse } from "next/server";
import { getImage } from "@/lib/images";
export const runtime = "nodejs";
// Serves an uploaded file. Ids are random and files never change, so browsers and the CDN can cache them for a year.
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const f = await getImage((await params).id); if (!f) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(f.bytes), { headers: { "content-type": f.type, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", "content-length": String(f.bytes.length) } });
}
