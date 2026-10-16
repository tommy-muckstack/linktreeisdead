import type { Page } from "@/lib/model";
import type { AdminUser } from "@/components/admin/AdminProvider";
/** The six-step setup checklist shown in the sidebar and on the home dashboard. */
export function setupSteps(p: Page, u: AdminUser): { id: string; label: string; done: boolean; href: string }[] {
  const links = p.links.filter(l => !l.archived && l.type !== "header");
  return [
    { id: "account", label: "Save your page to an account", done: !u.guest, href: "/app/account" },
    { id: "avatar", label: "Add a profile image", done: !!p.avatar, href: "/app/header" },
    { id: "bio", label: "Add a bio", done: !!p.bio.trim(), href: "/app/header" },
    { id: "socials", label: "Add your social icons", done: p.socials.length > 0, href: "/app/links#socials" },
    { id: "links", label: "Add 3 links", done: links.length >= 3, href: "/app/links" },
    { id: "design", label: "Pick a theme", done: p.design.theme !== "air", href: "/app/design#theme" },
  ];
}
