import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deletePage } from "@/lib/pages";
import { delDoc } from "@/lib/store";
import { deleteAllShorts } from "@/lib/owned";
import { getAdminAuth, recentlySignedIn, revokeSessions, SESSION_COOKIE, GUEST_COOKIE, cookieOptions } from "@/lib/isdead-auth/server";
export const runtime = "nodejs";
// PATCH { email }: change the sign-in email (shared across IsDead apps). DELETE: remove this app's data for the account and sign out.
export async function PATCH(req: NextRequest) {
  const u = await currentUser(); if (!u || u.guest || u.demo) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  // Changing the sign-in email needs a sign-in from the last 5 minutes (a stolen cookie alone can't take the account over).
  if (!(await recentlySignedIn(req.cookies.get(SESSION_COOKIE)?.value))) return NextResponse.json({ error: "For your security, sign in again to change your email.", reauth: true }, { status: 401 });
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  try { await (await getAdminAuth()).updateUser(u.id, { email: email.trim().toLowerCase() }); } catch (e: any) { return NextResponse.json({ error: e?.code === "auth/email-already-exists" ? "That email already has an account." : "Couldn't change your email." }, { status: 400 }); }
  // Every session for the account (other devices and this one) ends; the owner signs in again with the new email.
  await revokeSessions(u.id);
  const res = NextResponse.json({ ok: true, signedOut: true }); res.cookies.set(SESSION_COOKIE, "", cookieOptions(0)); return res;
}
export async function DELETE() {
  const u = await currentUser(); if (!u || u.demo) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  await deletePage(u.id); await delDoc("planner", u.id); await deleteAllShorts(u.id);
  const res = NextResponse.json({ ok: true }); res.cookies.set(SESSION_COOKIE, "", cookieOptions(0)); res.cookies.set(GUEST_COOKIE, "", cookieOptions(0)); return res;
}
