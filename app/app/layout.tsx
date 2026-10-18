import { redirect } from "next/navigation";
import { currentUser, entryRedirect, requestedAppPath } from "@/lib/session";
import { ensurePage, withCounts, PageUnavailable } from "@/lib/pages";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { AdminChrome } from "@/components/admin/AdminChrome";
export const dynamic = "force-dynamic";
export const metadata = { title: "LinktreeIsDead Admin" };
// Guests land straight in the editor (no sign-up wall); their page moves to their account when they sign in.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const asked = await requestedAppPath("/app");
  if (!user) redirect(entryRedirect(asked));
  // ?handle= from the claim form names a brand-new page (ignored when the visitor already has one, or it's taken).
  const wanted = new URLSearchParams(asked.split("?")[1] ?? "").get("handle") ?? undefined;
  let page;
  try { page = await withCounts(await ensurePage(user, wanted)); }
  catch (e) {
    if (!(e instanceof PageUnavailable)) throw e;
    // A page mid-write (large pages are stored in chunks): ask for a retry instead of a 500.
    return <main className="ids-root" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui" }}><div style={{ textAlign: "center", maxWidth: 360 }}><h1 style={{ fontSize: 22 }}>Your page is busy</h1><p>It's being saved right now. Try again in a moment.</p><a href="" style={{ display: "inline-block", marginTop: 12, padding: "10px 18px", borderRadius: 999, background: "#254F1A", color: "#D2E823", textDecoration: "none", fontWeight: 600 }}>Try again</a></div></main>;
  }
  return <AdminProvider initial={page} user={{ id: user.id, name: user.name, email: user.email, demo: user.demo, guest: user.guest }}><AdminChrome>{children}</AdminChrome></AdminProvider>;
}
