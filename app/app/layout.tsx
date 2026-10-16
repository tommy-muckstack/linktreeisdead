import { redirect } from "next/navigation";
import { currentUser, entryRedirect, requestedAppPath } from "@/lib/session";
import { ensurePage } from "@/lib/pages";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { AdminChrome } from "@/components/admin/AdminChrome";
export const dynamic = "force-dynamic";
export const metadata = { title: "LinktreeIsDead Admin" };
// Guests land straight in the editor (no sign-up wall); their page moves to their account when they sign in.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect(entryRedirect(await requestedAppPath("/app")));
  const page = await ensurePage(user);
  return <AdminProvider initial={page} user={{ id: user.id, name: user.name, email: user.email, demo: user.demo, guest: user.guest }}><AdminChrome>{children}</AdminChrome></AdminProvider>;
}
