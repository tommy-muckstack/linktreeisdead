"use client";
// Floating pill nav with Linktree-style mega menus (desktop) and a full-screen menu (mobile). Every item is a real link.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SmartLink } from "@/components/SmartLink";
import { NAV, type MLink } from "@/lib/marketing-links";
import { BP } from "@/lib/basepath";

const ICON: Record<string, string> = {
  music: "M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z", play: "M3 6h18v12H3zM10 9l5 3-5 3z", mic: "M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4",
  star: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z", store: "M4 9l1-5h14l1 5M4 9h16v11H4zM4 9a3 3 0 006 0 3 3 0 006 0 3 3 0 004 0", users: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21a7 7 0 0114 0M17 11a3 3 0 100-6M18 14a6 6 0 014 7",
  tree: "M12 3v18M12 8l-5 5M12 8l5 5M12 13l-3 3M12 13l3 3", chart: "M4 20V10M10 20V4M16 20v-8M22 20H2", code: "M8 6l-6 6 6 6M16 6l6 6-6 6", link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM18 18h3v3h-3z", brush: "M14 4l6 6-8 8H6v-6zM4 20h6", chat: "M4 5h16v11H8l-4 4z", spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18",
  calendar: "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4", pin: "M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12zM12 11a2 2 0 100-4 2 2 0 000 4z", grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  help: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01", flag: "M5 21V4h12l-2 4 2 4H5", info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7h.01", mail: "M3 5h18v14H3zM3 6l9 7 9-7",
};
const Ic = ({ n, s = 22 }: { n?: string; s?: number }) => n ? <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICON[n] ?? ICON.grid} /></svg> : null;
const Arrow = () => <span aria-hidden>{"\u00a0→"}</span>;

export function LpNav({ active }: { active?: "pricing" }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mob, setMob] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMob(false); } };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, []);
  useEffect(() => { document.documentElement.style.overflow = mob ? "hidden" : ""; }, [mob]);
  const close = () => { setOpen(null); setMob(false); };
  const item = (l: MLink, cls = "lp-mi") => <SmartLink key={l.label + l.href} href={l.href} className={cls} onClick={close}><Ic n={l.icon} /><span>{l.label}{l.desc && <small>{l.desc}</small>}</span></SmartLink>;
  const menu = NAV.find(m => m.label === open);
  return <nav className="lp-nav" ref={ref} aria-label="Main">
    <Link href="/" className="lp-logo" onClick={close}><Mark size={30} />LinktreeIsDead</Link>
    <div className="lp-links">
      {NAV.map(m => <button key={m.label} type="button" aria-expanded={open === m.label} aria-haspopup="true" className={open === m.label ? "on" : ""} onClick={() => setOpen(open === m.label ? null : m.label)}>{m.label}</button>)}
      <Link href="/pricing" className={active === "pricing" ? "on" : ""} onClick={close}>Pricing</Link>
    </div>
    <div className="lp-navcta"><Link className="lp-login" href="/login">Log in</Link><Link className="lp-signup" href="/login?mode=signup">Sign up free</Link>
      <button type="button" className="lp-burger" aria-label={mob ? "Close menu" : "Open menu"} aria-expanded={mob} onClick={() => setMob(!mob)}>{mob ? <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}</button></div>
    {menu && <div className="lp-mega" role="menu" aria-label={menu.label}>
      {menu.top && <div className="lp-mega__top">{menu.top.map(l => item(l, "lp-mt"))}</div>}
      <div className="lp-mega__cols">{menu.groups.map(g => <div key={g.title} className="lp-mega__col"><h5>{g.title}</h5>{g.links.map(l => item(l))}</div>)}</div>
      {menu.foot && <div className="lp-mega__foot"><SmartLink href={menu.foot.href} className="lp-mega__all" onClick={close}>{menu.foot.label}<Arrow /></SmartLink></div>}
    </div>}
    {mob && <div className="lp-mob" role="dialog" aria-label="Menu">
      {NAV.map(m => <details key={m.label}><summary>{m.label}<svg width="14" height="8" viewBox="0 0 14 8" aria-hidden><path d="M1 1l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></summary>
        <div>{[...(m.top ?? []), ...m.groups.flatMap(g => g.links)].filter((l, i, a) => a.findIndex(x => x.label === l.label) === i).map(l => item(l))}{m.foot && <SmartLink href={m.foot.href} className="lp-mi lp-mi--all" onClick={close}><span>{m.foot.label}<Arrow /></span></SmartLink>}</div></details>)}
      <Link href="/pricing" className="lp-mob__link" onClick={close}>Pricing</Link>
      <div className="lp-mob__cta"><Link className="lp-login" href="/login" onClick={close}>Log in</Link><Link className="lp-signup" href="/login?mode=signup" onClick={close}>Sign up free</Link></div>
    </div>}
  </nav>;
}

export function LpPromo() {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  return <div className="lp-promo"><span>Make your LinktreeIsDead the best it can be. <a href={BP + "/app"}>Claim yours today.</a></span><button type="button" aria-label="Dismiss" onClick={() => setShown(false)}>×</button></div>;
}
