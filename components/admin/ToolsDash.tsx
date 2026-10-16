"use client";
// Media kit, Business cards, Social planner (offline: plan and track, publish yourself) and Link shortener.
import { useEffect, useMemo, useState } from "react";
import { BP } from "@/lib/basepath";
import { renderQrSvg, DEFAULT_STYLE } from "@/lib/qr";
import type { Post, Short } from "@/lib/owned";
import { I, SocialIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { DashHead } from "@/components/admin/AdminChrome";
import { useAdmin, useOrigin, uploadImage } from "@/components/admin/AdminProvider";
import { useInsights } from "@/components/admin/useInsights";
import { QrModal } from "@/components/admin/QrModal";
import { Btn, ColorField, Empty, Field, IconBtn, Modal, Row, Switch, plural } from "@/components/admin/ui";
import { track, EVENTS } from "@/lib/analytics";


export function MediaKitDash() {
  const { page, edit } = useAdmin(); const k = page.kit; const d = useInsights(28);
  const set = (patch: Partial<typeof k>) => edit(p => ({ ...p, kit: { ...p.kit, ...patch } }));
  const url = useOrigin() + `${BP}/u/${page.handle}/media-kit`;
  return <>
    <DashHead title="Media kit">{k.public && <a className="ad-pillbtn" href={`${BP}/u/${page.handle}/media-kit`} target="_blank" rel="noreferrer"><I n="external" s={16} />View</a>}</DashHead>
    <div className="ad-dbody">
      <div className="ad-kithero"><div><h2>Show off your stats to brands</h2><p>Create your media kit and make it easy for brands to find you for partnerships. It uses your page's own numbers. Nothing is shared until you publish.</p></div></div>
      <div className="ad-tile" style={{ marginTop: 20 }}>
        <Row label="Publish media kit" sub={k.public ? url.replace(/^https?:\/\//, "") : "Off: only you can see it"}><Switch on={k.public} label="Publish media kit" onChange={v => { track(EVENTS.app_media_kit_published, { published: v }); set({ public: v }); }} /></Row>
        <Field label="Headline" value={k.headline} max={80} placeholder={`${page.title} × your brand`} onChange={v => set({ headline: v })} />
        <Field label="About you" multiline value={k.about} max={600} onChange={v => set({ about: v })} placeholder="Who you are, what you make and who your audience is." />
        <Field label="Business contact (email or link)" value={k.contact} onChange={v => set({ contact: v })} />
        <Row label="Show page stats" sub="Views, clicks and click rate from the last 28 days"><Switch on={k.showStats} label="Show page stats" onChange={v => set({ showStats: v })} /></Row>
        <Row label="Show social icons"><Switch on={k.showLinks} label="Show social icons" onChange={v => set({ showLinks: v })} /></Row>
        <h3 className="ad-sec">Rates</h3>{k.rates.map((r, i) => <div key={i} className="ad-mini" style={{ marginBottom: 8 }}><input className="ad-input" placeholder="e.g. Instagram reel" value={r.label} onChange={e => set({ rates: k.rates.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} /><input className="ad-input" style={{ maxWidth: 140 }} placeholder="$500" value={r.price} onChange={e => set({ rates: k.rates.map((x, j) => j === i ? { ...x, price: e.target.value } : x) })} /><IconBtn n="trash" label="Remove rate" onClick={() => set({ rates: k.rates.filter((_, j) => j !== i) })} /></div>)}
        {k.rates.length < 10 && <Btn small kind="secondary" icon="plus" onClick={() => set({ rates: [...k.rates, { label: "", price: "" }] })}>Add a rate</Btn>}
      </div>
      {d && k.showStats && <div className="ad-tiles" style={{ marginTop: 16 }}><div className="ad-tile ad-stat"><b>{d.totals.views}</b><span>Views (28 days)</span></div><div className="ad-tile ad-stat"><b>{d.totals.clicks}</b><span>Clicks</span></div><div className="ad-tile ad-stat"><b>{d.totals.ctr}%</b><span>Click rate</span></div></div>}
    </div>
  </>;
}

export function BusinessCardDash() {
  const { page, edit } = useAdmin(); const c = page.card; const [tab, setTab] = useState<"digital" | "print">("digital"); const [qr, setQr] = useState(false);
  const set = (patch: Partial<typeof c>) => edit(p => ({ ...p, card: { ...p.card, ...patch } }));
  const url = useOrigin() + `${BP}/u/${page.handle}`; const svg = useMemo(() => url ? renderQrSvg(url, { ...DEFAULT_STYLE, fg: "#000000", bg: "#FFFFFF" }, { width: 180 }) : "", [url]);
  const name = c.name || page.title || "@" + page.handle; const dark = parseInt(c.color.slice(1, 3), 16) * 0.299 + parseInt(c.color.slice(3, 5), 16) * 0.587 + parseInt(c.color.slice(5, 7), 16) * 0.114 < 140;
  const vcard = () => { track(EVENTS.app_business_card_downloaded, { format: "vcf" }); const v = ["BEGIN:VCARD", "VERSION:3.0", `FN:${name}`, c.phone && `TEL;TYPE=CELL:${c.phone}`, c.email && `EMAIL:${c.email}`, `URL:${url}`, "END:VCARD"].filter(Boolean).join("\r\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([v], { type: "text/vcard" })); a.download = `${page.handle}.vcf`; a.click(); };
  const png = () => { track(EVENTS.app_business_card_downloaded, { format: "png" }); const W = 1050, H = 600, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const x = cv.getContext("2d")!; x.fillStyle = c.color; x.beginPath(); x.roundRect(0, 0, W, H, 48); x.fill(); x.fillStyle = dark ? "#fff" : "#111"; x.font = "600 30px system-ui"; x.fillText("NAME", 64, 120); x.font = "700 64px system-ui"; x.fillText(name.slice(0, 26), 64, 200); x.font = "600 30px system-ui"; x.fillText("URL", 64, 300); x.font = "500 38px system-ui"; x.fillText(url.replace(/^https?:\/\//, "").slice(0, 44), 64, 350); const img = new Image(); img.onload = () => { x.fillStyle = "#fff"; x.beginPath(); x.roundRect(W - 330, H - 330, 280, 280, 24); x.fill(); x.drawImage(img, W - 320, H - 320, 260, 260); cv.toBlob(b => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${page.handle}-card.png`; a.click(); }); }; img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); };
  return <>
    <DashHead title="Business cards" />
    <div className="ad-dbody">
      <div className="ad-seg">{(["digital", "print"] as const).map(t => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t === "digital" ? "Digital card" : "Print-ready card"}</button>)}</div>
      <div className="ad-bcard" style={{ background: c.color, color: dark ? "#fff" : "#111" }}><Mark size={28} /><small>NAME</small><b>{name}</b><small>URL</small><span>{url.replace(/^https?:\/\//, "")}</span><div className="ad-bcard__qr" dangerouslySetInnerHTML={{ __html: svg }} /></div>
      {tab === "digital" ? <div className="ad-tile" style={{ marginTop: 20 }}>
        <h3 className="ad-sec">Card style</h3><p className="ad-sub">Set your display name and colour. People scan the QR code to open your page.</p>
        <Field label="Display name" value={c.name} max={60} placeholder={page.title} onChange={v => set({ name: v })} />
        <ColorField label="Background color" value={c.color} onChange={v => set({ color: v })} />
        <Row label="Let visitors save your contact" sub="Adds your phone and email to the downloadable contact card"><Switch on={c.saveContact} label="Let visitors save your contact" onChange={v => set({ saveContact: v })} /></Row>
        {c.saveContact && <><Field label="Phone" type="tel" value={c.phone} onChange={v => set({ phone: v })} /><Field label="Email" type="email" value={c.email} onChange={v => set({ email: v })} /></>}
        <div className="ad-mini" style={{ flexWrap: "wrap", marginTop: 8 }}><Btn icon="qr" onClick={() => setQr(true)}>QR code</Btn><Btn kind="secondary" icon="contact" onClick={vcard}>Download contact (.vcf)</Btn><Btn kind="secondary" icon="share" onClick={async () => { if (navigator.share) await navigator.share({ title: name, url }).catch(() => {}); else { await navigator.clipboard.writeText(url); } }}>Share</Btn></div>
        <p className="ad-help">Wallet passes need an Apple/Google developer account, so this project gives you a QR code, a contact file and an image to save instead.</p>
      </div> : <div className="ad-tile" style={{ marginTop: 20 }}><h3 className="ad-sec">Print it yourself</h3><p className="ad-muted" style={{ marginBottom: 16 }}>Download a 3.5 × 2 in card at 300 dpi and print it anywhere.</p><Btn icon="download" onClick={png}>Download card (PNG)</Btn></div>}
      {qr && <QrModal url={url} name={page.handle} onClose={() => setQr(false)} />}
    </div>
  </>;
}

const PLATFORMS = ["instagram", "tiktok", "youtube", "x", "facebook", "threads", "linkedin", "pinterest", "bluesky"] as const;
export function PlannerDash() {
  const { toast } = useAdmin(); const [posts, setPosts] = useState<Post[] | null>(null); const [edit, setEdit] = useState<Post | null>(null); const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; }); const [view, setView] = useState<"calendar" | "list">("calendar");
  useEffect(() => { fetch(`${BP}/api/planner`).then(r => r.json()).then(j => setPosts(j.posts ?? [])).catch(() => setPosts([])); }, []);
  const save = async (next: Post[]) => { setPosts(next); const r = await fetch(`${BP}/api/planner`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ posts: next }) }).catch(() => null); if (!r?.ok) toast("Couldn't save. Try again."); };
  const blank = (date?: Date): Post => ({ id: Math.random().toString(36).slice(2, 10), date: (date ?? new Date(Date.now() + 864e5)).toISOString(), platforms: ["instagram"], caption: "", image: "", link: "", status: "scheduled" });
  const days = useMemo(() => { const first = new Date(month); const start = new Date(first); start.setDate(1 - first.getDay()); return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; }); }, [month]);
  const on = (d: Date) => (posts ?? []).filter(p => p.date && new Date(p.date).toDateString() === d.toDateString());
  return <>
    <DashHead title="Social planner"><div className="ad-seg" style={{ margin: 0, width: 220 }}>{(["calendar", "list"] as const).map(v => <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)} style={{ height: 32 }}>{v === "calendar" ? "Calendar" : "List"}</button>)}</div><Btn icon="plus" onClick={() => setEdit(blank())}>New post</Btn></DashHead>
    <div className="ad-dbody ad-dbody--wide">
      <div className="ad-note ad-note--info"><I n="planner" s={18} /><div>Plan posts for every platform in one place. This planner doesn't post for you: when it's time, copy the caption, download the image and publish, then mark it posted.</div></div>
      {posts === null ? <p className="ad-muted">Loading…</p> : view === "calendar" ? <div className="ad-tile">
        <div className="ad-row" style={{ minHeight: 0, marginBottom: 12 }}><IconBtn n="left" label="Previous month" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} /><b>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</b><IconBtn n="right" label="Next month" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} /></div>
        <div className="ad-cal">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span key={d} className="ad-cal__h">{d}</span>)}{days.map(d => <div key={d.toISOString()} className={"ad-cal__d" + (d.getMonth() !== month.getMonth() ? " out" : "") + (d.toDateString() === new Date().toDateString() ? " today" : "")} onDoubleClick={() => { const x = new Date(d); x.setHours(10); setEdit(blank(x)); }}><small>{d.getDate()}</small>{on(d).map(p => <button key={p.id} type="button" className={"ad-cal__p " + p.status} onClick={() => setEdit(p)}>{p.platforms[0] && <SocialIcon kind={p.platforms[0]} s={12} />}{p.caption.slice(0, 24) || "Untitled"}</button>)}</div>)}</div>
        <p className="ad-help">Double-click a day to plan a post on it.</p></div>
        : posts.length === 0 ? <div className="ad-tile"><Empty icon="planner" title="Nothing planned yet" text="Add your first post idea or schedule one."><Btn icon="plus" onClick={() => setEdit(blank())}>New post</Btn></Empty></div>
        : <div className="ad-list2">{[...posts].sort((a, b) => a.date.localeCompare(b.date)).map(p => <button key={p.id} type="button" className="ad-card" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setEdit(p)}>{p.image ? <span className="ad-card__ic"><img src={p.image} alt="" /></span> : <span className="ad-card__ic"><I n="image" s={18} /></span>}<span className="ad-card__m"><span className="ad-card__t">{p.caption.slice(0, 80) || "Untitled"}</span><span className="ad-card__s">{p.date ? new Date(p.date).toLocaleString() : "No date"} · <span className="tag">{p.status}</span>{p.platforms.map(x => <SocialIcon key={x} kind={x} s={12} />)}</span></span></button>)}</div>}
    </div>
    {edit && <Modal title="Post" onClose={() => setEdit(null)}>
      <h3 className="ad-sec">Platforms</h3><div className="ad-mini" style={{ flexWrap: "wrap" }}>{PLATFORMS.map(k => <button key={k} type="button" className={"ad-chip" + (edit.platforms.includes(k) ? " on" : "")} onClick={() => setEdit({ ...edit, platforms: edit.platforms.includes(k) ? edit.platforms.filter(x => x !== k) : [...edit.platforms, k] })}><SocialIcon kind={k} s={14} />{k}</button>)}</div>
      <Field label="Caption" multiline value={edit.caption} max={2200} onChange={v => setEdit({ ...edit, caption: v })} />
      <Row label="When"><input className="ad-input" style={{ width: 230 }} type="datetime-local" value={edit.date ? new Date(new Date(edit.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} onChange={e => setEdit({ ...edit, date: e.target.value ? new Date(e.target.value).toISOString() : "" })} /></Row>
      <Row label="Status"><select className="ad-input" style={{ width: 160 }} value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value as Post["status"] })}><option value="idea">Idea</option><option value="scheduled">Scheduled</option><option value="posted">Posted</option></select></Row>
      <Field label="Link in bio for this post (optional)" value={edit.link} onChange={v => setEdit({ ...edit, link: v })} />
      <Row label="Image"><label className="ad-upload">{edit.image ? <img src={edit.image} alt="" /> : <I n="image" s={22} />}<em><I n="plus" s={14} /></em><input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { setEdit({ ...edit, image: await uploadImage(f, 1600) }); } catch (err) { toast((err as Error).message); } }} /></label></Row>
      <div className="ad-mini" style={{ marginTop: 16, flexWrap: "wrap" }}>
        {posts?.some(p => p.id === edit.id) && <Btn kind="danger" icon="trash" onClick={() => { void save((posts ?? []).filter(p => p.id !== edit.id)); setEdit(null); }}>Delete</Btn>}
        <Btn kind="secondary" icon="copy" onClick={async () => { await navigator.clipboard.writeText(edit.caption).catch(() => {}); toast("Caption copied"); }}>Copy caption</Btn>
        {edit.image && <a className="ad-btn ad-btn--secondary" href={edit.image} download={`post-${edit.id}.jpg`}><I n="download" s={16} />Image</a>}
        <span style={{ flex: 1 }} /><Btn onClick={() => { track(EVENTS.app_planner_post_saved, { status: edit.status, platforms: edit.platforms.length }); const list = posts ?? []; void save(list.some(p => p.id === edit.id) ? list.map(p => p.id === edit.id ? edit : p) : [...list, edit]); setEdit(null); }}>Save</Btn>
      </div>
    </Modal>}
  </>;
}

export function ShortenerDash() {
  const { toast } = useAdmin(); const [items, setItems] = useState<Short[] | null>(null); const [url, setUrl] = useState(""); const [code, setCode] = useState(""); const [err, setErr] = useState(""); const [qr, setQr] = useState<Short | null>(null);
  useEffect(() => { fetch(`${BP}/api/short`).then(r => r.json()).then(j => setItems(j.items ?? [])).catch(() => setItems([])); }, []);
  const origin = useOrigin(); const short = (c: string) => `${origin}${BP}/s/${c}`;
  const create = async (e: React.FormEvent) => { e.preventDefault(); setErr(""); const r = await fetch(`${BP}/api/short`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, code }) }); const j = await r.json(); if (!r.ok) return setErr(j.error); track(EVENTS.app_short_link_created, { custom: !!code }); setItems(x => [j.item, ...(x ?? [])]); setUrl(""); setCode(""); await navigator.clipboard.writeText(short(j.item.code)).catch(() => {}); toast("Short link copied"); };
  return <>
    <DashHead title="Link shortener" />
    <div className="ad-dbody">
      <form className="ad-tile" onSubmit={create}><h3 className="ad-sec">Shorten, share and track your links</h3>
        <Field label="Long URL" value={url} onChange={v => { setUrl(v); setErr(""); }} placeholder="https://example.com/a/very/long/link" error={err} />
        <div className="ad-mini"><span className="ad-muted" style={{ whiteSpace: "nowrap" }}>{BP}/s/</span><input className="ad-input" placeholder="custom back-half (optional)" value={code} onChange={e => setCode(e.target.value)} aria-label="Custom back-half" /><Btn type="submit" icon="shortener" disabled={!url.trim()}>Shorten</Btn></div></form>
      <h3 className="ad-sec" style={{ marginTop: 28 }}>Your links</h3>
      {items === null ? <p className="ad-muted">Loading…</p> : items.length === 0 ? <div className="ad-tile"><Empty icon="shortener" title="No short links yet" text="Short links track clicks in real time, without cookies, and every one gets a QR code." /></div>
        : <div className="ad-list2">{items.map(s => <div key={s.code} className="ad-card"><span className="ad-card__ic"><I n="link" s={18} /></span><span className="ad-card__m"><span className="ad-card__t">{short(s.code).replace(/^https?:\/\//, "")}</span><span className="ad-card__s">{s.url}</span></span><span className="ad-muted" style={{ whiteSpace: "nowrap" }}>{plural(s.clicks, "click")}</span>
          <IconBtn n="copy" label="Copy short link" onClick={async () => { await navigator.clipboard.writeText(short(s.code)).catch(() => {}); toast("Copied"); }} /><IconBtn n="qr" label="QR code" onClick={() => setQr(s)} /><IconBtn n="trash" label="Delete" onClick={async () => { if (!confirm("Delete this short link? It will stop working.")) return; await fetch(`${BP}/api/short`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: s.code }) }); setItems(x => x?.filter(y => y.code !== s.code) ?? null); }} /></div>)}</div>}
      {qr && <QrModal url={short(qr.code)} name={qr.code} onClose={() => setQr(null)} />}
    </div>
  </>;
}
