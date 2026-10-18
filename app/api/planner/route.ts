import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getPlanner, savePlanner, cleanPosts } from "@/lib/owned";
import { externalizeDataUrl } from "@/lib/images";
import { cleanupImages } from "@/lib/pages";
export const runtime = "nodejs";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ posts: await getPlanner(u.id) }); }
export async function PUT(req: NextRequest) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const posts = cleanPosts(b.posts); for (const p of posts) if (p.image.startsWith("data:")) p.image = await externalizeDataUrl(u.id, p.image); await savePlanner(u.id, posts); void cleanupImages(u.id); return NextResponse.json({ posts }); }
