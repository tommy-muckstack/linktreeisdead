import "@/vendor/isdead-design/css/linktree.css";
import "@/vendor/isdead-design/css/components.css";
import "./globals.css";
import "./auth-screen.css";
import { site } from "@/site.config";
import { Analytics } from "@/lib/analytics/posthog";
export const metadata = { title: `${site.name}: the free, open-source link in bio`, description: site.hero.subtitle };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-ids-theme="linktree"><body className="ids-root">{children}<Analytics /></body></html>;
}
