"use client";
// The two admin layouts, as on Linktree: the page editor (icon rail + panel + phone preview, /app/links, /header, /design,
// /enhance, /settings) and the dashboard (sidebar + content, everything else). The hamburger in the editor opens the sidebar.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BP } from "@/lib/basepath";
import { I, SocialIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { PageView } from "@/components/page/PageView";
import { useAdmin, useOrigin } from "@/components/admin/AdminProvider";
import { QrModal } from "@/components/admin/QrModal";
import { Menu } from "@/components/admin/ui";
import { setupSteps } from "@/components/admin/setup";
import { track, EVENTS, resetIdentity } from "@/lib/analytics";
import "@/app/admin.css";

const EDITOR = ["/app/links", "/app/header", "/app/design", "/app/enhance", "/app/settings"];
const RAIL = [{ href: "/app/links", n: "content", label: "Content" }, { href: "/app/header", n: "header", label: "Header" }, { href: "/app/design", n: "design", label: "Design" }, { href: "/app/enhance", n: "enhance", label: "Enhance" }];
export const DASH_NAV = [
  { href: "/app", n: "grid", label: "My LinktreeIsDead", exact: true }, { href: "/app/media-kit", n: "kit", label: "Media kit" }, { href: "/app/audience", n: "users", label: "Audience" },
  { href: "/app/insights", n: "chart", label: "Insights" }, { href: "/app/messaging", n: "send", label: "Messaging" },
];
export const TOOLS_NAV = [{ href: "/app/business-cards", n: "card", label: "Business cards" }, { href: "/app/social-planner", n: "planner", label: "Social planner" }, { href: "/app/link-shortener", n: "shortener", label: "Link shortener" }];

const rel = (p: string) => (p.startsWith(BP) ? p.slice(BP.length) || "/" : p);
export function AdminChrome({ children }: { children: React.ReactNode }) {
  const path = rel(usePathname() || "");
  const editor = EDITOR.some(e => path === e || path.startsWith(e + "/"));
  const { page, user } = useAdmin(); const router = useRouter();
  const onboard = !user.guest && !user.demo && !page.onboarded;
  useEffect(() => { if (onboard && path !== "/app/welcome") router.replace("/app/welcome"); }, [onboard, path, router]);
  if (path === "/app/welcome") return <div className="ad">{children}</div>;
  return editor ? <EditorChrome path={path}>{children}</EditorChrome> : <DashChrome path={path}>{children}</DashChrome>;
}

function AccountChip({ compact }: { compact?: boolean }) {
  const { page, user } = useAdmin(); const router = useRouter();
  return <Menu align={compact ? "left" : "right"} trigger={open => <button type="button" className={"ad-acct" + (compact ? " ad-acct--side" : "")} onClick={open} aria-label="Account menu">
    {page.avatar ? <img src={page.avatar} alt="" /> : <span className="ad-acct__ph"><I n="user" s={14} /></span>}<b>{page.handle}</b><I n="down" s={16} /></button>}
    items={[
      { icon: "external", label: "View my page", onClick: () => window.open(`${BP}/u/${page.handle}`, "_blank") },
      { icon: "user", label: "My account", onClick: () => router.push("/app/account") },
      user.guest ? { icon: "user", label: "Sign in to save your page", onClick: () => location.assign(`${BP}/login?callbackUrl=${encodeURIComponent(BP + "/app/links")}`) } : null,
      user.guest ? { icon: "plus", label: "Create a free account", onClick: () => location.assign(`${BP}/login?mode=signup&callbackUrl=${encodeURIComponent(BP + "/app/links")}`) } : null,
      !user.guest ? { icon: "left", label: "Sign out", onClick: async () => { track(EVENTS.app_signed_out); resetIdentity(); await fetch(`${BP}/api/session/logout`, { method: "POST" }); location.assign(`${BP}/`); } } : null,
    ]} />;
}

function SharePop() {
  const { page } = useAdmin(); const [open, setOpen] = useState(false); const [copied, setCopied] = useState(false); const [qr, setQr] = useState(false);
  const url = useOrigin() + `${BP}/u/${page.handle}`; const enc = encodeURIComponent(url);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open]);
  const opts: { k: string; label: string; icon: React.ReactNode; href?: string; onClick?: () => void }[] = [
    { k: "page", label: "My page", icon: <Mark size={22} />, href: `${BP}/u/${page.handle}` }, { k: "card", label: "Business card", icon: <I n="card" s={20} />, href: `${BP}/app/business-cards` },
    { k: "qr", label: "QR code", icon: <I n="qr" s={20} />, onClick: () => { track(EVENTS.app_page_shared, { method: "qr" }); setQr(true); setOpen(false); } },
    { k: "x", label: "X", icon: <SocialIcon kind="x" s={20} />, href: `https://x.com/intent/post?url=${enc}` }, { k: "facebook", label: "Facebook", icon: <SocialIcon kind="facebook" s={20} />, href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { k: "linkedin", label: "LinkedIn", icon: <SocialIcon kind="linkedin" s={20} />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` }, { k: "whatsapp", label: "WhatsApp", icon: <SocialIcon kind="whatsapp" s={20} />, href: `https://wa.me/?text=${enc}` },
    { k: "email", label: "Email", icon: <SocialIcon kind="email" s={20} />, href: `mailto:?body=${enc}` },
  ];
  return <div className="ad-sharewrap">
    <button type="button" className="ad-pillbtn" onClick={() => setOpen(o => !o)} aria-expanded={open}><I n="share" s={18} />Share</button>
    {open && <><div className="ad-scrim" onClick={() => setOpen(false)} /><div className="ad-share" role="dialog" aria-label="Share your page">
      <div className="ad-share__hd"><b>Share your LinktreeIsDead</b><Link href="/app/design" className="ad-ib" aria-label="Design" onClick={() => setOpen(false)}><I n="design" s={16} /></Link><button className="ad-ib" aria-label="Close" onClick={() => setOpen(false)}><I n="x" s={16} /></button></div>
      <div className="ad-share__url"><Mark size={18} /><span>{url.replace(/^https?:\/\//, "")}</span><button className="ad-btn ad-btn--primary ad-btn--sm" onClick={async () => { try { await navigator.clipboard.writeText(url); track(EVENTS.app_page_shared, { method: "copy" }); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }}>{copied ? "Copied" : "Copy"}</button></div>
      <div className="ad-share__row">{opts.map(o => o.href ? <a key={o.k} onClick={() => track(EVENTS.app_page_shared, { method: o.k })} href={o.href} target={o.href.startsWith("http") || o.k === "page" ? "_blank" : undefined} rel="noreferrer"><span>{o.icon}</span>{o.label}</a> : <button key={o.k} type="button" onClick={o.onClick}><span>{o.icon}</span>{o.label}</button>)}</div>
    </div></>}
    {qr && <QrModal url={url} name={page.handle} onClose={() => setQr(false)} />}
  </div>;
}

function Preview() {
  const { page } = useAdmin();
  return <div className="ad-prev"><div className="ad-phone"><div className="ad-phone__scr"><PageView page={page} mode="preview" frame="phone" /></div></div>
    <div className="ad-prev__tools"><a className="ad-ib" href={`${BP}/u/${page.handle}`} target="_blank" rel="noreferrer" aria-label="Open your page" title="Open your page"><I n="external" s={18} /></a></div></div>;
}

function EditorChrome({ path, children }: { path: string; children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false); const [mobilePrev, setMobilePrev] = useState(false); const { save, error } = useAdmin();
  useEffect(() => setDrawer(false), [path]);
  return <div className="ad ad--editor">
    <header className="ad-top">
      <button type="button" className="ad-ib ad-ib--lg" aria-label="Open menu" onClick={() => setDrawer(true)}><I n="menu" s={20} /></button>
      <div className="ad-top__mid"><AccountChip /></div>
      <div className="ad-top__r"><span className={"ad-save ad-save--" + save} role="status" title={error}>{save === "saving" ? "Saving…" : save === "error" ? "Not saved" : "Saved"}</span><SharePop /></div>
    </header>
    <nav className="ad-rail" aria-label="Editor">
      {RAIL.map(r => { const on = path === r.href || path.startsWith(r.href + "/"); return <Link key={r.href} href={r.href} className={"ad-rail__it" + (on ? " on" : "")} aria-current={on ? "page" : undefined}><span><I n={r.n} s={20} /></span>{r.label}</Link>; })}
      <Link href="/app/settings" className={"ad-rail__it ad-rail__gear" + (path.startsWith("/app/settings") ? " on" : "")} aria-label="Settings"><span><I n="settings" s={20} /></span></Link>
    </nav>
    <main className="ad-ed">
      <section className="ad-panel">{children}</section>
      <aside className={"ad-ed__prev" + (mobilePrev ? " open" : "")}><Preview /></aside>
    </main>
    <button type="button" className="ad-prevbtn" onClick={() => setMobilePrev(v => !v)}><I n={mobilePrev ? "x" : "eye"} s={18} />{mobilePrev ? "Close" : "Preview"}</button>
    {drawer && <><div className="ad-scrim ad-scrim--dark" onClick={() => setDrawer(false)} /><div className="ad-drawer"><SideNav path={path} onClose={() => setDrawer(false)} /></div></>}
  </div>;
}

function SideNav({ path, onClose }: { path: string; onClose?: () => void }) {
  const { page, user } = useAdmin(); const steps = setupSteps(page, user); const done = steps.filter(s => s.done).length; const pct = Math.round((done / steps.length) * 100);
  const item = (it: { href: string; n: string; label: string; exact?: boolean }) => { const on = it.exact ? path === it.href : path === it.href || path.startsWith(it.href + "/"); return <Link key={it.href} href={it.href} className={"ad-nav__it" + (on ? " on" : "")} aria-current={on ? "page" : undefined}><I n={it.n} s={18} /><span>{it.label}</span></Link>; };
  return <div className="ad-side">
    <div className="ad-side__top"><AccountChip compact />{onClose && <button className="ad-ib" aria-label="Close menu" onClick={onClose}><I n="x" s={16} /></button>}</div>
    <nav className="ad-nav">{item({ href: "/app/links", n: "content", label: "Edit my page" })}{DASH_NAV.map(item)}<div className="ad-nav__sec">Tools</div>{TOOLS_NAV.map(item)}</nav>
    {pct < 100 && <div className="ad-setup"><div className="ad-ring" style={{ "--p": pct } as React.CSSProperties}><span>{pct}%</span></div><b>Your setup checklist</b><small>{done} of {steps.length} complete</small><Link href="/app#setup" className="ad-btn ad-btn--purple ad-btn--full">Finish setup</Link></div>}
    <div className="ad-side__foot"><a className="ad-ib" href="https://github.com/tommy-muckstack/linktreeisdead/issues" target="_blank" rel="noreferrer" aria-label="Help" title="Help and feedback"><I n="help" s={18} /></a><a className="ad-side__brand" href={`${BP}/`}><Mark size={20} />LinktreeIsDead</a></div>
  </div>;
}

function DashChrome({ path, children }: { path: string; children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false); useEffect(() => setDrawer(false), [path]);
  return <div className="ad ad--dash">
    <aside className="ad-dash__side"><SideNav path={path} /></aside>
    <button type="button" className="ad-ib ad-ib--lg ad-dash__burger" aria-label="Open menu" onClick={() => setDrawer(true)}><I n="menu" s={20} /></button>
    <main className="ad-dash__main">{children}</main>
    {drawer && <><div className="ad-scrim ad-scrim--dark" onClick={() => setDrawer(false)} /><div className="ad-drawer"><SideNav path={path} onClose={() => setDrawer(false)} /></div></>}
  </div>;
}
export function DashHead({ title, children }: { title: string; children?: React.ReactNode }) { return <header className="ad-dhead"><h1>{title}</h1><div className="ad-dhead__r">{children}</div></header>; }
