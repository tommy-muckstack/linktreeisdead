"use client";
// Renders a link-in-bio page: the editor's live preview (mode "preview": links are inert) and the public page (mode "live").
import { useEffect, useMemo, useState } from "react";
import { BP } from "@/lib/basepath";
import { isLive, isComplete, SUPPORT_CAUSES, type Block, type Page } from "@/lib/model";
import { toEmbed, mapEmbed, mapLink, posterFor } from "@/lib/embeds";
import { fontStack, googleFontsHref } from "@/lib/fonts";
import { STICKER_EMOJI } from "@/lib/stickers";
import { I, SocialIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { track, EVENTS } from "@/lib/analytics";
import "@/app/page-view.css";

export type PublicPage = Omit<Page, "ownerId" | "daily" | "views">;
type Mode = "preview" | "live";

const hexA = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const RADII = ["0px", "8px", "16px", "999px"];
const SHADOW: Record<string, string> = { none: "none", soft: "0 4px 14px rgba(0,0,0,.12)", strong: "0 8px 24px rgba(0,0,0,.28)", hard: "4px 4px 0 #000" };
const PATTERN: Record<string, (a: string, b: string) => string> = {
  dots: (a, b) => `radial-gradient(${b} 2px, transparent 2.5px) 0 0/22px 22px, ${a}`,
  grid: (a, b) => `linear-gradient(${b} 1.5px, transparent 1.5px) 0 0/28px 28px, linear-gradient(90deg, ${b} 1.5px, transparent 1.5px) 0 0/28px 28px, ${a}`,
  lines: (a, b) => `repeating-linear-gradient(135deg, ${b} 0 3px, transparent 3px 18px), ${a}`,
  waves: (a, b) => `radial-gradient(circle at 50% 120%, ${b} 0 30%, transparent 31%) 0 0/60px 40px, radial-gradient(circle at 50% -20%, ${a} 0 30%, ${b} 31%) 30px 20px/60px 40px, ${a}`,
  zigzag: (a, b) => `linear-gradient(135deg, ${b} 25%, transparent 25%) -20px 0/40px 40px, linear-gradient(225deg, ${b} 25%, transparent 25%) -20px 0/40px 40px, ${a}`,
  checks: (a, b) => `conic-gradient(${b} 25%, transparent 0 50%, ${b} 0 75%, transparent 0) 0 0/36px 36px, ${a}`,
};
export function wallpaperCss(d: Page["design"]): React.CSSProperties {
  const w = d.wallpaper;
  if (w.style === "gradient") return { background: w.dir === "radial" ? `radial-gradient(circle at 50% 30%, ${w.color}, ${w.color2})` : `linear-gradient(${w.dir === "up" ? "0deg" : "180deg"}, ${w.color}, ${w.color2})` };
  if (w.style === "pattern") return { background: (PATTERN[w.pattern] ?? PATTERN.dots!)(w.color, w.color2) };
  if (w.style === "blur") return { background: `radial-gradient(40% 35% at 25% 20%, ${w.color2}, transparent 70%), radial-gradient(45% 40% at 80% 70%, ${hexA(w.color2, 0.8)}, transparent 70%), ${w.color}` };
  if (w.style === "image" && w.image) return { background: `center/cover no-repeat url("${w.image}"), ${w.color}` };
  return { background: w.color };
}
export function buttonCss(d: Page["design"]): React.CSSProperties {
  const b = d.button; const base: React.CSSProperties = { borderRadius: RADII[b.radius], boxShadow: SHADOW[b.shadow], color: b.text };
  if (b.style === "outline") return { ...base, background: "transparent", border: `2px solid ${b.color}` };
  if (b.style === "glass") return { ...base, background: hexA(b.color, 0.18), border: `1px solid ${hexA(b.color, 0.35)}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" };
  return { ...base, background: b.color, border: `2px solid ${b.color}` };
}

export function PageView({ page, mode, frame = "page" }: { page: PublicPage; mode: Mode; frame?: "page" | "phone" }) {
  const d = page.design; const live = mode === "live";
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t); }, []);
  const [dialog, setDialog] = useState<null | { kind: "lock"; block: Block } | { kind: "share" } | { kind: "subscribe" } | { kind: "message" }>(null);
  const [acked, setAcked] = useState(!page.settings.sensitive || !live);
  const btn = buttonCss(d);
  const fonts = googleFontsHref([d.font, d.altTitleFont ? d.titleFont : d.font]);
  const visible = useMemo(() => page.links.filter(l => isLive(l, now) && isComplete(l)), [page.links, now]);
  const top = visible.filter(l => !l.parent).sort((a, b) => Number(b.prioritize) - Number(a.prioritize));
  const kids = (id: string) => visible.filter(l => l.parent === id);
  const socials = page.socials.filter(s => s.enabled);
  const cause = SUPPORT_CAUSES.find(c => c.id === page.settings.support);
  const [origin, setOrigin] = useState(""); useEffect(() => setOrigin(location.origin), []); const url = `${origin}${BP}/u/${page.handle}`;
  const go = (l: Block) => `${BP}/go/${page.handle}/${l.id}`;
  useEffect(() => { if (live) track(EVENTS.app_profile_viewed, { blocks: page.links.length, has_video: page.links.some(l => l.type === "video") }); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  const onLink = (e: React.MouseEvent, l: Block) => {
    if (!live) { e.preventDefault(); return; }
    track(EVENTS.app_profile_link_clicked, { block_type: l.type, locked: l.lock.kind !== "none" });
    if (l.lock.kind !== "none") { e.preventDefault(); setDialog({ kind: "lock", block: l }); }
  };
  const titleFont = fontStack(d.altTitleFont ? d.titleFont : d.font);
  const vars = { "--pv-text": d.textColor, "--pv-title": d.titleColor, "--pv-btn": d.button.color, "--pv-btn-text": d.button.text, "--pv-radius": RADII[d.button.radius], fontFamily: fontStack(d.font), color: d.textColor } as React.CSSProperties;

  const socialRow = socials.length > 0 && <div className="pv-socials">{socials.map(s => <a key={s.kind} href={live ? s.url : undefined} target="_blank" rel="noopener noreferrer me" aria-label={s.kind} onClick={live ? undefined : e => e.preventDefault()}><SocialIcon kind={s.kind} s={28} /></a>)}</div>;
  const avatar = page.avatar ? <img className="pv-avatar__img" src={page.avatar} alt="" /> : <span className="pv-avatar__ph" style={{ background: hexA(d.textColor, 0.12), color: d.textColor }}>{(page.title.replace(/^@/, "")[0] ?? "?").toUpperCase()}</span>;

  const linkBtn = (l: Block) => {
    const featured = l.layout === "featured" && !!l.thumb;
    const cls = "pv-btn pv-anim-" + l.anim + (featured ? " pv-btn--featured" : "") + (l.thumb || l.icon ? " pv-btn--thumb" : "");
    return <a key={l.id} className={cls} style={btn} href={live ? go(l) : undefined} onClick={e => onLink(e, l)} rel="noopener noreferrer" data-link-id={l.id}>
      {featured ? <img className="pv-btn__feat" src={l.thumb} alt="" /> : l.thumb ? <img className="pv-btn__th" src={l.thumb} alt="" /> : l.icon ? <span className="pv-btn__ic"><SocialIcon kind={l.icon} s={22} /></span> : null}
      <span className="pv-btn__t">{l.title || l.url}</span>
      {l.lock.kind !== "none" && <span className="pv-btn__lock"><I n="lock" s={16} /></span>}
    </a>;
  };
  const frameH = (src: string, h: number, ratio?: number, title?: string) => !live && posterFor(src) ? <div className="pv-embed pv-embed--poster" style={{ aspectRatio: String(ratio ?? 16 / 9), backgroundImage: `url("${posterFor(src)}")` }}><I n="play" s={36} /></div> : <div className="pv-embed" style={ratio ? { aspectRatio: String(ratio) } : { height: h }}><iframe src={live ? src : undefined} srcDoc={live ? undefined : `<div style="display:grid;place-items:center;height:100%;font:600 13px system-ui;color:#555;background:#eee">${title ?? "Embed"} preview</div>`} title={title ?? "Embedded content"} loading="lazy" allow="autoplay; encrypted-media; fullscreen; clipboard-write" referrerPolicy="strict-origin-when-cross-origin" /></div>;

  const block = (l: Block): React.ReactNode => {
    switch (l.type) {
      case "header": return <h2 key={l.id} className="pv-h">{l.title}</h2>;
      case "text": return <p key={l.id} className="pv-text" style={{ textAlign: (l.data.align as "left" | "center") ?? "center" }}>{String(l.data.body ?? "")}</p>;
      case "collection": { const c = kids(l.id); if (!c.length) return null; const lay = (l.data.layout as string) ?? "stack";
        return <section key={l.id} className={"pv-col pv-col--" + lay}>{l.title && <h3 className="pv-col__t">{l.title}</h3>}<div className="pv-col__in">{c.map(x => lay === "stack" ? block(x) : <a key={x.id} className="pv-tile" style={btn} href={live && x.url ? go(x) : undefined} onClick={e => onLink(e, x)}>{x.thumb ? <img src={x.thumb} alt="" /> : <span className="pv-tile__ic">{x.icon ? <SocialIcon kind={x.icon} s={28} /> : <I n="link" s={24} />}</span>}<span>{x.title}</span></a>)}</div></section>; }
      case "video": case "music": case "embed": case "pdf": { const e = toEmbed(l.url); if (!e) return linkBtn(l); return <div key={l.id} className="pv-media">{l.title && <h3 className="pv-media__t">{l.title}</h3>}{frameH(e.src, Number(l.data.height) || e.h, e.ratio, e.provider)}</div>; }
      case "gallery": { const imgs = (l.data.images as { src: string; alt: string; url: string }[]) ?? []; return <div key={l.id} className={"pv-gal pv-gal--" + ((l.data.style as string) ?? "carousel")}>{l.title && <h3 className="pv-media__t">{l.title}</h3>}<div className="pv-gal__in">{imgs.map((im, i) => im.url && live ? <a key={i} href={im.url} target="_blank" rel="noopener noreferrer"><img src={im.src} alt={im.alt} /></a> : <img key={i} src={im.src} alt={im.alt} />)}</div></div>; }
      case "map": { const a = String(l.data.address ?? ""); return <div key={l.id} className="pv-media">{l.title && <h3 className="pv-media__t">{l.title}</h3>}{frameH(mapEmbed(a, Number(l.data.zoom) || 14), 240, undefined, "Map")}<a className="pv-btn pv-btn--sm" style={btn} href={live ? mapLink(a) : undefined} target="_blank" rel="noopener noreferrer" onClick={live ? undefined : e => e.preventDefault()}><I n="pin" s={16} /> {a}</a></div>; }
      case "faq": return <div key={l.id} className="pv-faq">{l.title && <h3 className="pv-media__t">{l.title}</h3>}{((l.data.items as { q: string; a: string }[]) ?? []).map((x, i) => <details key={i} style={btn}><summary>{x.q}<I n="down" s={18} /></summary><p>{x.a}</p></details>)}</div>;
      case "contact": { const c = l.data as Record<string, string>; return <div key={l.id} className="pv-card" style={btn}><b>{c.name || l.title}</b>{(c.role || c.org) && <span>{[c.role, c.org].filter(Boolean).join(" · ")}</span>}{c.email && <a href={live ? `mailto:${c.email}` : undefined}>{c.email}</a>}{c.phone && <a href={live ? `tel:${c.phone}` : undefined}>{c.phone}</a>}<a className="pv-pill" href={live ? `${BP}/api/vcard/${page.handle}/${l.id}` : undefined} onClick={live ? undefined : e => e.preventDefault()}><I n="download" s={16} /> Save contact</a></div>; }
      case "discount": return <Discount key={l.id} l={l} btn={btn} />;
      case "events": return <div key={l.id} className="pv-events">{l.title && <h3 className="pv-media__t">{l.title}</h3>}{((l.data.items as { date: string; name: string; venue: string; city: string; url: string; soldOut: boolean }[]) ?? []).map((ev, i) => <div key={i} className="pv-event" style={btn}><span className="pv-event__d"><b>{ev.date ? new Date(ev.date).toLocaleDateString(undefined, { month: "short" }) : ""}</b>{ev.date ? new Date(ev.date).getDate() : ""}</span><span className="pv-event__m"><b>{ev.name}</b><small>{[ev.venue, ev.city].filter(Boolean).join(", ")}</small></span>{ev.soldOut ? <em>Sold out</em> : ev.url && <a className="pv-pill" href={live ? ev.url : undefined} target="_blank" rel="noopener noreferrer">Tickets</a>}</div>)}</div>;
      case "rss": return <Rss key={l.id} l={l} live={live} btn={btn} />;
      case "form": return <FormBlock key={l.id} l={l} handle={page.handle} live={live} btn={btn} />;
      case "messaging": return null;
      default: return linkBtn(l);
    }
  };

  const H = d.header;
  const head = <header className={"pv-head pv-head--" + H}>
    {(H === "hero" || H === "banner") && <div className="pv-hero" style={page.avatar ? { backgroundImage: `url("${page.avatar}")` } : { background: hexA(d.textColor, 0.15) }} />}
    {H !== "hero" && <div className={"pv-avatar pv-avatar--" + H}>{avatar}</div>}
    {d.titleStyle === "logo" && d.logo ? <img className="pv-logo" src={d.logo} alt={page.title} /> : <h1 className="pv-title" style={{ fontFamily: titleFont, color: d.titleColor }}>{page.title}</h1>}
    {page.bio && <p className="pv-bio">{page.bio}</p>}
    {page.settings.socialPosition === "top" && socialRow}
  </header>;

  const body = <div className={"pv pv--" + frame} style={{ ...vars }} data-testid="page-preview">
    {fonts && <link rel="stylesheet" href={fonts} />}
    <div className="pv-bg" style={wallpaperCss(d)}>{d.wallpaper.style === "video" && d.wallpaper.video && <video src={d.wallpaper.video} autoPlay muted loop playsInline />}{d.wallpaper.style === "blur" && <i className="pv-bg__blur" style={{ backdropFilter: `blur(${d.wallpaper.blur || 18}px)` }} />}</div>
    <div className="pv-bar"><span className="pv-bar__mark"><Mark size={frame === "phone" ? 22 : 28} /></span><button className="pv-bar__btn" aria-label="Share" onClick={() => setDialog({ kind: "share" })}><I n="share" s={18} /></button></div>
    {cause && <div className="pv-cause"><I n="heart" s={16} /> {cause.text}</div>}
    <main className="pv-in">
      {head}
      <div className="pv-links">{top.map(block)}</div>
      {page.settings.socialPosition === "bottom" && socialRow}
      {(page.settings.subscribe || page.settings.messages) && <div className="pv-actions">{page.settings.subscribe && <button className="pv-pill" onClick={() => setDialog({ kind: "subscribe" })}><I n="bell" s={16} /> Subscribe</button>}{page.settings.messages && <button className="pv-pill" onClick={() => setDialog({ kind: "message" })}><I n="send" s={16} /> Message</button>}</div>}
      {!d.hideFooter && <footer className="pv-foot"><a className="pv-join" href={live ? `${BP}/` : undefined} onClick={live ? undefined : e => e.preventDefault()}><Mark size={18} /> Join {page.handle} on LinktreeIsDead</a><small>{page.settings.about && <span>{page.settings.about} · </span>}<a href={live ? `${BP}/` : undefined}>Made with LinktreeIsDead</a></small></footer>}
    </main>
    {d.stickers.map(s => <span key={s.id} className="pv-sticker" style={{ left: s.x + "%", top: s.y + "%", transform: `translate(-50%,-50%) rotate(${s.r}deg) scale(${s.s})` }} aria-hidden>{STICKER_EMOJI[s.kind] ?? ""}</span>)}
    {!acked && <div className="pv-gate"><div><h2>Sensitive content</h2><p>This profile may include content that isn't suitable for everyone.</p><button className="pv-pill" onClick={() => setAcked(true)}>Continue</button></div></div>}
    {dialog && <Dialog onClose={() => setDialog(null)}>
      {dialog.kind === "share" && <ShareSheet url={url} title={page.title} />}
      {dialog.kind === "lock" && <LockPrompt l={dialog.block} href={go(dialog.block)} />}
      {dialog.kind === "subscribe" && <SubmitForm handle={page.handle} live={live} kind="subscribe" title={`Subscribe to ${page.title}`} fields={["email"]} button="Subscribe" />}
      {dialog.kind === "message" && <SubmitForm handle={page.handle} live={live} kind="message" title={`Message ${page.title}`} fields={["name", "email", "message"]} button="Send" />}
    </Dialog>}
  </div>;
  return body;
}

function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);
  return <div className="pv-dlg" role="dialog" aria-modal="true" onClick={onClose}><div className="pv-dlg__in" onClick={e => e.stopPropagation()}><button className="pv-dlg__x" aria-label="Close" onClick={onClose}><I n="x" s={18} /></button>{children}</div></div>;
}
function ShareSheet({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url), t = encodeURIComponent(title);
  const targets: [string, string, string][] = [["x", "X", `https://x.com/intent/post?url=${enc}&text=${t}`], ["facebook", "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc}`], ["whatsapp", "WhatsApp", `https://wa.me/?text=${t}%20${enc}`], ["linkedin", "LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`], ["telegram", "Telegram", `https://t.me/share/url?url=${enc}&text=${t}`], ["email", "Email", `mailto:?subject=${t}&body=${enc}`]];
  return <div className="pv-share"><h2>Share this page</h2>
    <div className="pv-share__row">{targets.map(([k, n, h]) => <a key={k} onClick={() => track(EVENTS.app_profile_shared, { method: k })} href={h} target="_blank" rel="noopener noreferrer"><span><SocialIcon kind={k} s={22} /></span>{n}</a>)}</div>
    <button className="pv-share__copy" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }}><span>{url.replace(/^https?:\/\//, "")}</span><b>{copied ? "Copied" : "Copy"}</b></button>
    {typeof navigator !== "undefined" && "share" in navigator && <button className="pv-pill" onClick={() => navigator.share({ title, url }).catch(() => {})}>More options</button>}
  </div>;
}
function LockPrompt({ l, href }: { l: Block; href: string }) {
  const [code, setCode] = useState(""); const [err, setErr] = useState("");
  if (l.lock.kind === "code") return <form className="pv-form" onSubmit={async e => { e.preventDefault(); const r = await fetch(href.replace("/go/", "/api/unlock/"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) }).catch(() => null); if (r?.ok) location.href = href + "?code=" + encodeURIComponent(code); else setErr("That code isn't right."); }}>
    <h2><I n="lock" s={20} /> Enter the code</h2><p>This link is locked. Enter the code to continue.</p><input aria-label="Code" value={code} onChange={e => setCode(e.target.value)} autoFocus />{err && <p className="pv-err">{err}</p>}<button className="pv-pill pv-pill--solid">Unlock</button></form>;
  const age = l.lock.kind === "age";
  return <div className="pv-form"><h2><I n="lock" s={20} /> {age ? "Age check" : "Sensitive content"}</h2><p>{age ? `You must be ${l.lock.age} or older to open this link.` : "This link may contain content that isn't suitable for everyone."}</p><a className="pv-pill pv-pill--solid" href={href + "?ok=1"}>{age ? `I'm ${l.lock.age} or older` : "Continue"}</a></div>;
}
function SubmitForm({ handle, live, kind, title, fields, button, blockId, options }: { handle: string; live: boolean; kind: string; title: string; fields: string[]; button: string; blockId?: string; options?: string[] }) {
  const [v, setV] = useState<Record<string, string>>({}); const [state, setState] = useState<"" | "sending" | "done" | "error">(""); const [err, setErr] = useState("");
  const label: Record<string, string> = { name: "Name", email: "Email", phone: "Phone number", message: "Message", company: "Company" };
  if (state === "done") return <div className="pv-form"><h2>Thanks!</h2><p>{kind === "subscribe" ? "You're subscribed." : "Your submission was sent."}</p></div>;
  return <form className="pv-form" onSubmit={async e => { e.preventDefault(); if (!live) return; setState("sending"); const r = await fetch(`${BP}/api/submit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle, kind, block: blockId, values: v }) }).catch(() => null); if (r?.ok) { setState("done"); track(EVENTS.app_profile_form_submitted, { kind }); } else { setState("error"); setErr((await r?.json().catch(() => null))?.error ?? "Couldn't send. Try again."); } }}>
    {title && <h2>{title}</h2>}
    {options?.length ? <div className="pv-poll">{options.map(o => <label key={o}><input type="radio" name="choice" value={o} checked={v.choice === o} onChange={() => setV({ ...v, choice: o })} required /> {o}</label>)}</div> : null}
    {fields.map(f => f === "message" ? <textarea key={f} aria-label={label[f]} placeholder={label[f]} value={v[f] ?? ""} onChange={e => setV({ ...v, [f]: e.target.value })} required maxLength={1000} /> : <input key={f} aria-label={label[f]} placeholder={label[f]} type={f === "email" ? "email" : f === "phone" ? "tel" : "text"} value={v[f] ?? ""} onChange={e => setV({ ...v, [f]: e.target.value })} required={f === "email" || f === "phone" || f === "name"} maxLength={200} />)}
    {state === "error" && <p className="pv-err">{err}</p>}
    <button className="pv-pill pv-pill--solid" disabled={state === "sending"}>{state === "sending" ? "Sending…" : button}</button>
  </form>;
}
function FormBlock({ l, handle, live, btn }: { l: Block; handle: string; live: boolean; btn: React.CSSProperties }) {
  const k = (l.data.kind as string) ?? "contact";
  const fields = k === "email" ? ["email"] : k === "sms" ? ["phone"] : k === "poll" ? [] : ((l.data.fields as string[])?.length ? (l.data.fields as string[]) : ["name", "email", "message"]);
  return <div className="pv-card pv-card--form" style={{ ...btn, color: undefined }}><SubmitForm handle={handle} live={live} kind={k} blockId={l.id} title={l.title} fields={fields} button={String(l.data.button || "Submit")} options={k === "poll" ? (l.data.options as string[]) : undefined} /></div>;
}
function Discount({ l, btn }: { l: Block; btn: React.CSSProperties }) {
  const [copied, setCopied] = useState(false); const code = String(l.data.code ?? "");
  return <div className="pv-card pv-disc" style={btn}><span className="pv-disc__k"><I n="percent" s={18} /> {l.title || "Discount"}</span>{Boolean(l.data.details) && <small>{String(l.data.details)}</small>}<button className="pv-disc__c" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }}><code>{code}</code><b>{copied ? "Copied" : "Copy"}</b></button></div>;
}
function Rss({ l, live, btn }: { l: Block; live: boolean; btn: React.CSSProperties }) {
  const [items, setItems] = useState<{ title: string; link: string; date: string }[] | null>(null);
  useEffect(() => { let off = false; fetch(`${BP}/api/rss?url=${encodeURIComponent(l.url)}&n=${Number(l.data.count) || 3}`).then(r => r.ok ? r.json() : { items: [] }).then(j => { if (!off) setItems(j.items ?? []); }).catch(() => !off && setItems([])); return () => { off = true; }; }, [l.url, l.data.count]);
  return <div className="pv-events">{l.title && <h3 className="pv-media__t">{l.title}</h3>}{items === null ? <div className="pv-card" style={btn}>Loading…</div> : items.length === 0 ? <a className="pv-btn" style={btn} href={live ? l.url : undefined}>{l.title || l.url}</a> : items.map((it, i) => <a key={i} className="pv-btn pv-btn--rss" style={btn} href={live ? it.link : undefined} target="_blank" rel="noopener noreferrer" onClick={live ? undefined : e => e.preventDefault()}><span className="pv-btn__t">{it.title}{it.date && <small>{new Date(it.date).toLocaleDateString()}</small>}</span></a>)}</div>;
}
