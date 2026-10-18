import { redirect } from "next/navigation";
import { currentUser, entryRedirect, requestedAppPath } from "@/lib/session";
import { ensurePage, withCounts } from "@/lib/pages";
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
  const page = await withCounts(await ensurePage(user, wanted));
  return <AdminProvider initial={page} user={{ id: user.id, name: user.name, email: user.email, demo: user.demo, guest: user.guest }}><AdminChrome>{children}</AdminChrome></AdminProvider>;
}
