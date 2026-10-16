import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getPlanner, savePlanner, cleanPosts } from "@/lib/owned";
export const runtime = "nodejs";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ posts: await getPlanner(u.id) }); }
export async function PUT(req: NextRequest) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const posts = cleanPosts(b.posts); await savePlanner(u.id, posts); return NextResponse.json({ posts }); }
