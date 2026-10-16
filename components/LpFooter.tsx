import Link from "next/link";
import { ClaimBar } from "@/components/ClaimBar";
import { SmartLink } from "@/components/SmartLink";
import { FOOTER, GH, HUB } from "@/lib/marketing-links";

// Purple footer from the original's layout. Every link goes to a real page of ours, GitHub or the IsDead hub.
const GhIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 015 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0012 2z" /></svg>;
const HubIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>;

export function LpFooter() {
  return <footer className="lp-ft"><div className="lp-ft__blob" aria-hidden /><div className="lp-ft__cta"><h2 className="lp-h2 lp-h2--pink">Jumpstart your corner of the internet today</h2><ClaimBar placeholder="yourname" cta="Claim your LinktreeIsDead" btn="lp-btn--lime" /></div>
    <div className="lp-ft__card"><div className="lp-ft__cols">{FOOTER.map(([h, ls]) => <div key={h}><h4>{h}</h4>{ls.map(l => <SmartLink key={l.label} href={l.href}>{l.label}</SmartLink>)}</div>)}</div>
      <div className="lp-ft__bar"><div><Link className="lp-login" href="/login">Log in</Link><SmartLink className="lp-btn lp-btn--lime lp-btn--sm" href="/app">Get started for free</SmartLink></div>
        <div className="lp-ft__soc"><a href={GH} target="_blank" rel="noopener noreferrer" aria-label="LinktreeIsDead on GitHub"><GhIcon /></a><a href={HUB} aria-label="More IsDead apps"><HubIcon /></a></div></div></div>
    <p className="lp-ft__ack">LinktreeIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Linktree Pty Ltd. Linktree is a trademark of its owner. <a href={GH}>View on GitHub</a></p></footer>;
}
