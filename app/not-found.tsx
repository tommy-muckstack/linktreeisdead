import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SmartLink } from "@/components/SmartLink";
import "@/app/landing.css";

export const metadata = { title: "Page not found | LinktreeIsDead" };
// Branded 404 for any unknown route (and /u/<unknown handle> via notFound()).
export default function NotFound() {
  return <div className="lp lp-404">
    <Link href="/" className="lp-404__logo" aria-label="LinktreeIsDead home"><Mark size={40} /><span>LinktreeIsDead</span></Link>
    <div className="lp-404__body"><h1>The page you&rsquo;re looking for doesn&rsquo;t exist.</h1><p>Want this to be your handle? Claim it now, it&rsquo;s free.</p>
      <div className="lp-404__cta"><SmartLink className="lp-btn lp-btn--green" href="/app">Claim your page</SmartLink><Link className="lp-btn lp-404__home" href="/">Go to the homepage</Link></div></div>
  </div>;
}
