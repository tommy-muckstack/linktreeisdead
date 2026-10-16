import Link from "next/link";
import { BP } from "@/lib/basepath";
import { isApp, isExternal } from "@/lib/marketing-links";

/** One link component for marketing copy: next/link for site pages, a full page load for /app (it may bounce through
 *  the guest-session redirect, which client navigation can't follow), and a new tab for external sites. */
export function SmartLink({ href, className, children, onClick }: { href: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  if (isExternal(href)) return <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>{children}</a>;
  if (isApp(href)) return <a href={BP + href} className={className} onClick={onClick}>{children}</a>;
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}
