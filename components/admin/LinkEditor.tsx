"use client";
// One block's editor: Details (per type), Power-ups (schedule, lock, animation, prioritize, redirect) and Insights.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BP } from "@/lib/basepath";
import { ANIMS, COLLECTION_LAYOUTS, LIMITS, SOCIAL_IDS, SOCIAL_NAMES, isComplete, normalizeUrl, type Block, type Anim } from "@/lib/model";
import { toEmbed } from "@/lib/embeds";
import { I, SocialIcon } from "@/components/icons";
import { useAdmin, uploadImage } from "@/components/admin/AdminProvider";
import { Btn, Choice, Field, IconBtn, Menu, Modal, PanelHead, Row, Switch, plural, Empty } from "@/components/admin/ui";
import { TYPE_META } from "@/components/admin/catalog";
import { blockIcon } from "@/components/admin/ContentPanel";
import { track, EVENTS } from "@/lib/analytics";


const LINKISH = new Set(["link"]);
const ANIM_LABEL: Record<Anim, string> = { none: "None", buzz: "Buzz", wobble: "Wobble", pop: "Pop", swipe: "Swipe", spotlight: "Spotlight" };
const local = (iso: string) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : "");

export function LinkEditor({ id }: { id: string }) {
  const { page, setBlock, edit, toast } = useAdmin(); const router = useRouter();
  const l = page.links.find(x => x.id === id); const [tab, setTab] = useState<"details" | "power" | "insights">("details");
  if (!l) return <><PanelHead title="Not found" back={() => router.push("/app/links")} /><Empty icon="link" title="This block doesn't exist" text="It may have been deleted." /></>;
  const set = (patch: Partial<Block>) => setBlock(l.id, patch); const setData = (patch: Record<string, unknown>) => setBlock(l.id, b => ({ data: { ...b.data, ...patch } }));
  const done = isComplete(l); const linkish = LINKISH.has(l.type);
  return <>
    <PanelHead title={l.title || TYPE_META[l.type].label} back={() => router.push("/app/links")} right={<>
      <IconBtn n={l.enabled ? "eye" : "eyeoff"} label={l.enabled ? "Visible: click to hide" : "Hidden: click to show"} onClick={() => set({ enabled: !l.enabled })} />
      {l.url && <IconBtn n="share" label="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(l.url); toast("Link copied"); } catch { /* ignore */ } }} />}
      <Menu trigger={open => <IconBtn n="hmore" label="More" onClick={open} />} items={[
        { icon: "copy", label: "Duplicate", onClick: () => { const c = { ...l, id: Math.random().toString(36).slice(2, 10), clicks: 0, title: l.title ? l.title + " (copy)" : "" }; edit(p => { const a = [...p.links]; a.splice(a.findIndex(x => x.id === l.id) + 1, 0, c); return { ...p, links: a }; }); router.push(`/app/links/edit/${c.id}`); } },
        { icon: "archive", label: "Archive", onClick: () => { set({ archived: true }); toast("Archived"); router.push("/app/links"); } },
        { icon: "trash", label: "Delete", danger: true, onClick: () => { if (confirm("Delete this for good?")) { edit(p => ({ ...p, links: p.links.filter(x => x.id !== l.id).map(x => x.parent === l.id ? { ...x, parent: "" } : x) })); router.push("/app/links"); } } },
      ]} /></>} />
    {l.type !== "header" && l.type !== "text" && <div className="ad-seg" role="tablist">{([["details", "Details", "content"], ["power", "Power-ups", "wand"], ["insights", "Insights", "chart"]] as const).map(([k, label, n]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><I n={n} s={16} />{label}</button>)}</div>}
    {!done && tab === "details" && <div className="ad-note"><I n="wand" s={18} /><div><b>Setup required</b><br />Finish setting up this {TYPE_META[l.type].label.toLowerCase()} to make it visible on your page.</div></div>}
    {tab === "details" && <Details l={l} set={set} setData={setData} />}
    {tab === "power" && <PowerUps l={l} set={set} linkish={linkish} />}
    {tab === "insights" && <BlockInsights l={l} />}
  </>;
}

function UrlField({ l, set, label = "URL", hint }: { l: Block; set: (p: Partial<Block>) => void; label?: string; hint?: string }) {
  const [v, setV] = useState(l.url); const [err, setErr] = useState(""); useEffect(() => setV(l.url), [l.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Field label={label} value={v} placeholder={hint ?? "Paste link URL…"} onChange={x => { setV(x); setErr(""); }} onBlur={() => { if (!v.trim()) return set({ url: "" }); const n = normalizeUrl(v); if (!n) setErr("That doesn't look like a link."); else { setV(n); set({ url: n }); } }} error={err} />;
}

function Details({ l, set, setData }: { l: Block; set: (p: Partial<Block>) => void; setData: (p: Record<string, unknown>) => void }) {
  const { page, toast, setBlock } = useAdmin(); const d = l.data as Record<string, any>;
  const [iconPick, setIconPick] = useState(false);
  const title = <Field label="Title" value={l.title} max={LIMITS.linkTitle} onChange={v => set({ title: v })} />;
  const upThumb = async (f?: File) => { if (!f) return; try { set({ thumb: await uploadImage(f, l.layout === "featured" ? 1400 : 600, { square: l.layout !== "featured" }) }); } catch (e) { toast((e as Error).message); } };
  switch (l.type) {
    case "header": return <Field label="Header text" value={l.title} max={80} onChange={v => set({ title: v })} autoFocus />;
    case "text": return <><Field label="Text" value={String(d.body ?? "")} max={LIMITS.text} multiline onChange={v => setData({ body: v })} autoFocus /><Row label="Alignment"><Choice label="Alignment" options={["left", "center"] as const} value={(d.align as "left" | "center") ?? "center"} onChange={v => setData({ align: v })} render={v => v === "left" ? "Left" : "Center"} /></Row></>;
    case "link": return <>
      {title}<UrlField l={l} set={set} />
      <hr className="ad-hr" /><h3 className="ad-sec">Button layout</h3><p className="ad-sub">How you display your content</p>
      <Choice label="Button layout" options={["classic", "featured"] as const} value={l.layout} onChange={v => set({ layout: v })} cols={2} render={v => <><span style={{ display: "block", width: 120, height: 44, borderRadius: 10, background: "rgba(4,4,3,.06)", position: "relative" }}>{v === "classic" ? <><i style={{ position: "absolute", left: 10, top: 14, width: 16, height: 16, borderRadius: 4, background: "rgba(4,4,3,.2)" }} /><i style={{ position: "absolute", left: 34, right: 12, top: 19, height: 6, borderRadius: 3, background: "rgba(4,4,3,.2)" }} /></> : <i style={{ position: "absolute", inset: 6, borderRadius: 6, background: "rgba(4,4,3,.2)" }} />}</span>{v === "classic" ? "Classic" : "Featured"}</>} />
      {l.layout === "featured" && !l.thumb && <p className="ad-help">Featured links show your thumbnail as a large image. Add one below.</p>}
      <Row label={l.layout === "featured" ? "Image" : "Thumbnail"} sub="An image or an icon next to your title">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label className="ad-upload" aria-label="Upload thumbnail">{l.thumb ? <img src={l.thumb} alt="" /> : l.icon ? <SocialIcon kind={l.icon} s={28} /> : <I n="image" s={24} />}<em><I n="plus" s={14} /></em><input type="file" accept="image/*" hidden onChange={e => upThumb(e.target.files?.[0])} /></label>
          <Menu trigger={open => <IconBtn n="hmore" label="Thumbnail options" onClick={open} />} items={[{ icon: "smile", label: "Choose an icon", onClick: () => setIconPick(true) }, l.thumb || l.icon ? { icon: "trash", label: "Remove", onClick: () => set({ thumb: "", icon: "" }) } : null]} />
        </div></Row>
      {iconPick && <Modal title="Choose an icon" onClose={() => setIconPick(false)}><div className="ad-stickers">{SOCIAL_IDS.map(k => <button key={k} type="button" title={SOCIAL_NAMES[k]} aria-label={SOCIAL_NAMES[k]} onClick={() => { set({ icon: k, thumb: "" }); setIconPick(false); }}><SocialIcon kind={k} s={26} /></button>)}</div></Modal>}
    </>;
    case "video": case "music": case "embed": case "pdf": { const e = l.url ? toEmbed(l.url) : null;
      const hint = l.type === "video" ? "https://youtube.com/watch?v=…" : l.type === "music" ? "https://open.spotify.com/track/…" : l.type === "pdf" ? "https://example.com/menu.pdf" : "https://calendly.com/you/30min";
      return <>{title}<UrlField l={l} set={set} label={l.type === "pdf" ? "PDF URL" : "URL"} hint={hint} />
        {l.url && (e ? <p className="ad-help">✓ {e.provider} will play right on your page.</p> : <div className="ad-note"><I n="link" s={18} />We can't embed this one, so it shows as a regular button. {l.type === "video" ? "YouTube, Vimeo and TikTok videos embed." : l.type === "music" ? "Spotify, Apple Music, SoundCloud and Audiomack embed." : "Calendly, Cal.com, Typeform, Google Forms, Canva and PDF links embed."}</div>)}
        {(l.type === "embed" || l.type === "pdf") && <Row label="Height" sub="In pixels"><input className="ad-input" style={{ width: 110 }} type="number" min={80} max={900} value={Number(d.height) || ""} placeholder="Auto" onChange={x => setData({ height: Number(x.target.value) || undefined })} /></Row>}</>; }
    case "rss": return <>{title}<UrlField l={l} set={set} label="Feed URL" hint="https://example.com/feed.xml" /><Row label="Posts to show"><Choice label="Posts to show" options={[1, 3, 5] as const} value={(Number(d.count) || 3) as 1 | 3 | 5} onChange={v => setData({ count: v })} render={v => String(v)} /></Row></>;
    case "collection": { const kids = page.links.filter(x => x.parent === l.id && !x.archived);
      return <>{title}<h3 className="ad-sec">Layout</h3><Choice label="Collection layout" options={COLLECTION_LAYOUTS} value={(d.layout as "stack") ?? "stack"} onChange={v => setData({ layout: v })} cols={3} render={v => <><I n={v === "stack" ? "buttons" : v === "grid" ? "grid" : "hmore"} s={22} />{v[0]!.toUpperCase() + v.slice(1)}</>} />
        <h3 className="ad-sec">In this collection</h3>{kids.length ? <div className="ad-list2">{kids.map(k => <div key={k.id} className="ad-card"><span className="ad-card__ic">{blockIcon(k)}</span><span className="ad-card__m"><span className="ad-card__t">{k.title || TYPE_META[k.type].label}</span></span><Btn small kind="secondary" onClick={() => setBlock(k.id, { parent: "" })}>Remove</Btn></div>)}</div> : <p className="ad-muted">Drag links onto this collection in Content, or use a link's ⋮ menu → Move into collection.</p>}</>; }
    case "gallery": { const imgs = (d.images as { src: string; alt: string; url: string }[]) ?? [];
      const add = async (files: FileList | null) => { if (!files) return; const out = [...imgs]; for (const f of [...files].slice(0, LIMITS.gallery - imgs.length)) { try { out.push({ src: await uploadImage(f, 1600), alt: "", url: "" }); } catch (e) { toast((e as Error).message); } } setData({ images: out }); };
      return <>{title}<Row label="Style"><Choice label="Gallery style" options={["carousel", "grid"] as const} value={(d.style as "carousel") ?? "carousel"} onChange={v => setData({ style: v })} render={v => v === "carousel" ? "Carousel" : "Grid"} /></Row>
        <div className="ad-list2">{imgs.map((im, i) => <div key={i} className="ad-card"><span className="ad-upload" style={{ width: 56, height: 56 }}><img src={im.src} alt="" /></span><div style={{ flex: 1, display: "grid", gap: 6 }}><input className="ad-input" placeholder="Description (alt text)" value={im.alt} onChange={e => setData({ images: imgs.map((x, j) => j === i ? { ...x, alt: e.target.value } : x) })} /><input className="ad-input" placeholder="Link (optional)" value={im.url} onChange={e => setData({ images: imgs.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })} /></div><IconBtn n="trash" label="Remove image" onClick={() => setData({ images: imgs.filter((_, j) => j !== i) })} /></div>)}</div>
        {imgs.length < LIMITS.gallery && <label className="ad-btn ad-btn--secondary" style={{ marginTop: 12 }}><I n="plus" s={18} />Add images<input type="file" accept="image/*" multiple hidden onChange={e => add(e.target.files)} /></label>}<p className="ad-help">Up to {LIMITS.gallery} images. They're resized in your browser before upload.</p></>; }
    case "map": return <>{title}<Field label="Address or place" value={String(d.address ?? "")} onChange={v => setData({ address: v })} placeholder="123 Main St, Springfield" /><Row label="Zoom"><input type="range" min={3} max={20} value={Number(d.zoom) || 14} onChange={e => setData({ zoom: Number(e.target.value) })} aria-label="Map zoom" /></Row></>;
    case "faq": { const items = (d.items as { q: string; a: string }[]) ?? [];
      return <>{title}{items.map((it, i) => <div key={i} className="ad-tile" style={{ marginBottom: 10 }}><Field label={`Question ${i + 1}`} value={it.q} onChange={v => setData({ items: items.map((x, j) => j === i ? { ...x, q: v } : x) })} /><Field label="Answer" multiline value={it.a} onChange={v => setData({ items: items.map((x, j) => j === i ? { ...x, a: v } : x) })} /><Btn small kind="ghost" icon="trash" onClick={() => setData({ items: items.filter((_, j) => j !== i) })}>Remove</Btn></div>)}<Btn kind="secondary" icon="plus" onClick={() => setData({ items: [...items, { q: "", a: "" }] })}>Add question</Btn></>; }
    case "contact": return <>{title}{(["name", "role", "org", "email", "phone", "site", "address"] as const).map(k => <Field key={k} label={{ name: "Name", role: "Job title", org: "Company", email: "Email", phone: "Phone", site: "Website", address: "Address" }[k]} value={String(d[k] ?? "")} onChange={v => setData({ [k]: v })} type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} />)}<Field label="Note" multiline value={String(d.note ?? "")} onChange={v => setData({ note: v })} /><p className="ad-help">Visitors get a "Save contact" button that adds you to their phone.</p></>;
    case "form": { const kind = (d.kind as string) ?? "contact"; const opts = (d.options as string[]) ?? []; const fields = (d.fields as string[]) ?? ["name", "email", "message"];
      return <>{title}<h3 className="ad-sec">Form type</h3><Choice label="Form type" options={["contact", "email", "sms", "poll"] as const} value={kind as "contact"} onChange={v => setData({ kind: v })} cols={4} render={v => ({ contact: "Contact", email: "Email signup", sms: "SMS signup", poll: "Poll" })[v]} />
        {kind === "contact" && <><h3 className="ad-sec">Fields</h3>{(["name", "email", "phone", "company", "message"] as const).map(f => <Row key={f} label={f[0]!.toUpperCase() + f.slice(1)}><Switch on={fields.includes(f)} label={`Ask for ${f}`} onChange={v => setData({ fields: v ? [...fields, f] : fields.filter(x => x !== f) })} /></Row>)}</>}
        {kind === "poll" && <><h3 className="ad-sec">Options</h3>{opts.map((o, i) => <div key={i} className="ad-mini" style={{ marginBottom: 8 }}><input className="ad-input" value={o} aria-label={`Option ${i + 1}`} onChange={e => setData({ options: opts.map((x, j) => j === i ? e.target.value : x) })} /><IconBtn n="trash" label="Remove option" onClick={() => setData({ options: opts.filter((_, j) => j !== i) })} /></div>)}{opts.length < 8 && <Btn small kind="secondary" icon="plus" onClick={() => setData({ options: [...opts, ""] })}>Add option</Btn>}</>}
        <hr className="ad-hr" /><Field label="Button text" value={String(d.button ?? "Submit")} max={40} onChange={v => setData({ button: v })} /><p className="ad-help">Responses appear in <a href={`${BP}/app/audience`}>Audience</a>.</p></>; }
    case "discount": return <>{title}<Field label="Code" value={String(d.code ?? "")} max={40} onChange={v => setData({ code: v.toUpperCase() })} placeholder="SAVE20" /><Field label="Details" multiline value={String(d.details ?? "")} onChange={v => setData({ details: v })} placeholder="20% off your first order" /><Row label="Expires" sub="The block hides itself after this date"><input className="ad-input" style={{ width: 220 }} type="datetime-local" value={local(String(d.expires ?? ""))} onChange={e => { setData({ expires: fromLocal(e.target.value) }); set({ schedule: { ...l.schedule, end: fromLocal(e.target.value) } }); }} /></Row></>;
    case "events": { const items = (d.items as { date: string; name: string; venue: string; city: string; url: string; soldOut: boolean }[]) ?? [];
      const up = (i: number, p: Record<string, unknown>) => setData({ items: items.map((x, j) => j === i ? { ...x, ...p } : x) });
      return <>{title}{items.map((ev, i) => <div key={i} className="ad-tile" style={{ marginBottom: 10, display: "grid", gap: 8 }}><input className="ad-input" type="datetime-local" aria-label="Date" value={local(ev.date)} onChange={e => up(i, { date: fromLocal(e.target.value) })} /><input className="ad-input" placeholder="Event name" value={ev.name} onChange={e => up(i, { name: e.target.value })} /><div className="ad-mini"><input className="ad-input" placeholder="Venue" value={ev.venue} onChange={e => up(i, { venue: e.target.value })} /><input className="ad-input" placeholder="City" value={ev.city} onChange={e => up(i, { city: e.target.value })} /></div><input className="ad-input" placeholder="Tickets link" value={ev.url} onChange={e => up(i, { url: e.target.value })} /><div className="ad-mini"><Row label="Sold out"><Switch on={ev.soldOut} label="Sold out" onChange={v => up(i, { soldOut: v })} /></Row><span style={{ flex: 1 }} /><Btn small kind="ghost" icon="trash" onClick={() => setData({ items: items.filter((_, j) => j !== i) })}>Remove</Btn></div></div>)}<Btn kind="secondary" icon="plus" onClick={() => setData({ items: [...items, { date: "", name: "", venue: "", city: "", url: "", soldOut: false }] })}>Add event</Btn></>; }
    default: return title;
  }
}

function PowerUps({ l, set: rawSet, linkish }: { l: Block; set: (p: Partial<Block>) => void; linkish: boolean }) {
  const { page, edit } = useAdmin();
  const set = (patch: Partial<Block>) => { const k = Object.keys(patch)[0]; const name = k === "anim" ? "animation" : k; if (k && k !== "lock" || patch.lock?.kind !== l.lock.kind) track(EVENTS.link_powerup_set, { powerup: name, value: k === "schedule" ? Boolean(patch.schedule?.start || patch.schedule?.end) : k === "lock" ? patch.lock!.kind : String(Object.values(patch)[0]) }); rawSet(patch); }; const [code, setCode] = useState(l.lock.code);
  return <>
    <h3 className="ad-sec"><I n="clock" s={16} /> Schedule</h3><p className="ad-sub">Show this only between these times (your local time).</p>
    <div className="ad-mini" style={{ marginBottom: 8 }}><label className="ad-row__l" style={{ flex: 1 }}><small>Starts</small><input className="ad-input" type="datetime-local" value={local(l.schedule.start)} onChange={e => set({ schedule: { ...l.schedule, start: fromLocal(e.target.value) } })} /></label><label className="ad-row__l" style={{ flex: 1 }}><small>Ends</small><input className="ad-input" type="datetime-local" value={local(l.schedule.end)} onChange={e => set({ schedule: { ...l.schedule, end: fromLocal(e.target.value) } })} /></label></div>
    {(l.schedule.start || l.schedule.end) && <Btn small kind="ghost" onClick={() => set({ schedule: { start: "", end: "" } })}>Clear schedule</Btn>}
    <hr className="ad-hr" />
    <Row label="Prioritize" sub="Pin this to the top of your page"><Switch on={l.prioritize} label="Prioritize" onChange={v => set({ prioritize: v })} /></Row>
    {linkish && <>
      <hr className="ad-hr" /><h3 className="ad-sec"><I n="spark" s={16} /> Animation</h3><p className="ad-sub">Draw attention to this link.</p>
      <Choice label="Animation" options={ANIMS} value={l.anim} onChange={v => set({ anim: v })} cols={3} render={v => <span className={"ad-animdemo pv-anim-" + v}>{ANIM_LABEL[v]}</span>} />
      <hr className="ad-hr" /><h3 className="ad-sec"><I n="lock" s={16} /> Lock</h3><p className="ad-sub">Ask visitors for something before they open this link.</p>
      <Choice label="Lock" options={["none", "code", "age", "sensitive"] as const} value={l.lock.kind === "subscribe" ? "none" : l.lock.kind} onChange={v => set({ lock: { ...l.lock, kind: v } })} cols={4} render={v => ({ none: "Off", code: "Code", age: "Age", sensitive: "Sensitive" })[v]} />
      {l.lock.kind === "code" && <Field label="Code (letters or numbers)" value={code} max={32} onChange={v => { setCode(v); set({ lock: { ...l.lock, code: v } }); }} />}
      {l.lock.kind === "age" && <Row label="Minimum age"><select className="ad-input" style={{ width: 120 }} value={l.lock.age} onChange={e => set({ lock: { ...l.lock, age: Number(e.target.value) } })}>{[13, 16, 18, 21, 25].map(a => <option key={a} value={a}>{a}+</option>)}</select></Row>}
      <hr className="ad-hr" />
      <Row label="Redirect" sub="Send everyone who opens your page straight to this link"><Switch on={l.redirect} label="Redirect" onChange={v => { track(EVENTS.link_powerup_set, { powerup: "redirect", value: String(v) }); edit(p => ({ ...p, links: p.links.map(x => x.id === l.id ? { ...x, redirect: v } : { ...x, redirect: v ? false : x.redirect }) })); }} /></Row>
      {l.redirect && <div className="ad-note"><I n="external" s={18} />While this is on, visiting {page.handle}'s page opens this link instead. Turn it off to show your page again.</div>}
    </>}
  </>;
}

function BlockInsights({ l }: { l: Block }) {
  const [days, setDays] = useState(28); const [data, setData] = useState<{ series: { day: string; links: Record<string, number> }[] } | null>(null);
  useEffect(() => { fetch(`${BP}/api/insights?days=${days}`).then(r => r.json()).then(setData).catch(() => setData({ series: [] })); }, [days]);
  const s = (data?.series ?? []).map(d => ({ day: d.day, c: d.links?.[l.id] ?? 0 })); const total = s.reduce((a, b) => a + b.c, 0); const max = Math.max(1, ...s.map(x => x.c));
  return <>
    <Row label="Range"><Choice label="Range" options={[7, 28, 90] as const} value={days as 7} onChange={v => setDays(v)} render={v => `${v} days`} /></Row>
    <div className="ad-tiles" style={{ margin: "12px 0 20px" }}><div className="ad-tile ad-stat"><b>{total}</b><span>Clicks, last {days} days</span></div><div className="ad-tile ad-stat"><b>{l.clicks}</b><span>Lifetime clicks</span></div></div>
    <div className="ad-tile"><div className="ad-bar" role="img" aria-label="Clicks per day">{s.slice(-14).map(x => <div key={x.day} title={`${x.day}: ${plural(x.c, "click")}`}><div className="ad-bar__pair"><i style={{ height: `${(x.c / max) * 100}%` }} /></div><small>{x.day.slice(8)}</small></div>)}</div></div>
  </>;
}
