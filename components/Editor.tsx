"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { THEME_IDS, THEMES, BUTTON_STYLES, SHAPES, SOCIAL_KINDS, SOCIAL_LABEL, LIMITS, validateHandle, type Page, type LinkItem, type SocialKind } from "@/lib/model";
import { PagePreview } from "@/components/PagePreview";
import { BP } from "@/lib/basepath";
type Stats = { views: number; clicks: number; ctr: number; series: { day: string; v: number; c: number }[]; top: LinkItem[] };
type Tab = "links" | "appearance" | "analytics" | "settings";
const newId = () => Math.random().toString(36).slice(2, 10);

export function Editor({ initial, initialStats }: { initial: Page; initialStats: Stats }) {
  const [page, setPage] = useState<Page>(initial); const [stats, setStats] = useState<Stats>(initialStats);
  const [tab, setTab] = useState<Tab>("links"); const [saved, setSaved] = useState<"saved" | "saving" | "error">("saved"); const [err, setErr] = useState("");
  const [handle, setHandle] = useState(initial.handle); const [hNote, setHNote] = useState(""); const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState<string | null>(null); const [showPreview, setShowPreview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const dirty = useRef(false); const latest = useRef(page); latest.current = page;

  const save = useCallback(async (extra?: Record<string, unknown>) => {
    setSaved("saving");
    const r = await fetch(`${BP}/api/page`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...latest.current, ...extra }) });
    const j = await r.json().catch(() => ({})); if (!r.ok) { setSaved("error"); setErr(j.error ?? "Could not save"); return false; }
    setErr(""); setStats(j.stats); setSaved("saved"); dirty.current = false;
    if (extra?.handle) { setPage(j.page); setHandle(j.page.handle); } return true;
  }, []);
  const edit = (f: (p: Page) => Page) => { setPage(p => f(p)); dirty.current = true; setSaved("saving"); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => save(), 500); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, []);

  const setLink = (id: string, patch: Partial<LinkItem>) => edit(p => ({ ...p, links: p.links.map(l => (l.id === id ? { ...l, ...patch } : l)) }));
  const addLink = (kind: "link" | "header") => edit(p => p.links.length >= LIMITS.links ? p : ({ ...p, links: [{ id: newId(), kind, title: kind === "header" ? "New header" : "", url: "", enabled: true, clicks: 0 }, ...p.links] }));
  const move = (id: string, d: -1 | 1) => edit(p => { const i = p.links.findIndex(l => l.id === id), j = i + d; if (i < 0 || j < 0 || j >= p.links.length) return p; const a = [...p.links]; [a[i], a[j]] = [a[j]!, a[i]!]; return { ...p, links: a }; });
  const dropOn = (target: string) => { if (!drag || drag === target) return; edit(p => { const a = [...p.links]; const from = a.findIndex(l => l.id === drag), to = a.findIndex(l => l.id === target); const [m] = a.splice(from, 1); a.splice(to, 0, m!); return { ...p, links: a }; }); setDrag(null); };
  const url = typeof window === "undefined" ? "" : `${location.origin}${BP}/u/${page.handle}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); } catch { /* ignore */ } setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const onAvatar = (f: File | undefined) => { if (!f) return; const img = new Image(); const u = URL.createObjectURL(f); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 192; const x = c.getContext("2d")!; const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 192, 192); URL.revokeObjectURL(u); edit(p => ({ ...p, avatar: c.toDataURL("image/jpeg", 0.8) })); }; img.src = u; };
  const checkHandle = async (h: string) => { setHandle(h); const bad = h === page.handle ? "" : validateHandle(h); if (bad) return setHNote(bad); if (h === page.handle) return setHNote(""); const r = await (await fetch(`${BP}/api/handle?h=${encodeURIComponent(h)}`)).json(); setHNote(r.available ? "Available" : r.reason); };
  const max = Math.max(1, ...stats.series.map(s => s.v));

  return <div className="lt-app">
    <div className="lt-app__main">
      <div className="lt-share"><div><b>Your page</b> <a href={`${BP}/u/${page.handle}`} target="_blank" rel="noreferrer" data-testid="public-url">{url || `${BP}/u/${page.handle}`}</a></div>
        <div className="tb"><button className="iconbtn" onClick={copy}>{copied ? "Copied!" : "Copy link"}</button><span className="ids-muted lt-save" role="status" data-testid="save-state">{saved === "saving" ? "Saving…" : saved === "error" ? "Not saved" : "All changes saved"}</span></div></div>
      {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "0 0 12px" }}>{err}</p>}
      <div className="lt-tabs" role="tablist">{(["links", "appearance", "analytics", "settings"] as Tab[]).map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t[0]!.toUpperCase() + t.slice(1)}</button>)}</div>

      {tab === "links" && <section data-testid="tab-links">
        <div className="tb" style={{ marginBottom: 14 }}><button className="ids-btn ids-btn--primary" onClick={() => addLink("link")}>+ Add link</button><button className="ids-btn ids-btn--outline" onClick={() => addLink("header")}>+ Add header</button></div>
        {page.links.length === 0 && <div className="ids-card lt-empty">No links yet. Add your first one and it shows up on the right.</div>}
        <ul className="lt-list">{page.links.map((l, i) => <li key={l.id} className={"ids-card lt-item" + (drag === l.id ? " drag" : "")} draggable onDragStart={() => setDrag(l.id)} onDragOver={e => e.preventDefault()} onDrop={() => dropOn(l.id)} onDragEnd={() => setDrag(null)} data-testid="link-row">
          <span className="lt-grip" aria-hidden title="Drag to reorder">⋮⋮</span>
          <div className="lt-item__f">
            <input className="ids-input" aria-label="Title" placeholder={l.kind === "header" ? "Header text" : "Title"} value={l.title} maxLength={LIMITS.linkTitle} onChange={e => setLink(l.id, { title: e.target.value })} />
            {l.kind === "link" && <input className="ids-input" aria-label="URL" placeholder="https://" value={l.url} onChange={e => setLink(l.id, { url: e.target.value })} />}
            <div className="lt-item__m"><span className="ids-pill">{l.kind === "header" ? "Header" : `${l.clicks} clicks`}</span>
              <button className="iconbtn" aria-label="Move up" disabled={i === 0} onClick={() => move(l.id, -1)}>↑</button><button className="iconbtn" aria-label="Move down" disabled={i === page.links.length - 1} onClick={() => move(l.id, 1)}>↓</button>
              <button className="iconbtn" aria-label="Delete link" onClick={() => edit(p => ({ ...p, links: p.links.filter(x => x.id !== l.id) }))}>Delete</button></div></div>
          <label className="lt-switch" title={l.enabled ? "Visible" : "Hidden"}><input type="checkbox" aria-label="Show on page" checked={l.enabled} onChange={e => setLink(l.id, { enabled: e.target.checked })} /><span /></label>
        </li>)}</ul></section>}

      {tab === "appearance" && <section data-testid="tab-appearance">
        <h3 className="ids-h3">Profile</h3>
        <div className="ids-card lt-form"><div className="lt-prof"><label className="iconbtn" style={{ cursor: "pointer" }}>Upload photo<input type="file" accept="image/*" hidden onChange={e => onAvatar(e.target.files?.[0])} /></label>{page.avatar && <button className="iconbtn" onClick={() => edit(p => ({ ...p, avatar: "" }))}>Remove</button>}</div>
          <label className="ids-label">Profile title</label><input className="ids-input" value={page.title} maxLength={LIMITS.title} onChange={e => edit(p => ({ ...p, title: e.target.value }))} />
          <label className="ids-label">Bio</label><textarea className="ids-input lt-ta" value={page.bio} maxLength={LIMITS.bio} onChange={e => edit(p => ({ ...p, bio: e.target.value }))} /></div>
        <h3 className="ids-h3" style={{ marginTop: 28 }}>Themes</h3>
        <div className="lt-themes">{THEME_IDS.map(id => <button key={id} aria-label={`Theme ${THEMES[id].name}`} aria-pressed={page.theme === id} className={"lt-theme" + (page.theme === id ? " on" : "")} onClick={() => edit(p => ({ ...p, theme: id }))}>
          <span className="lt-theme__sw" style={{ background: THEMES[id].bg }}><i style={{ background: THEMES[id].btnBg }} /><i style={{ background: THEMES[id].btnBg }} /></span>{THEMES[id].name}</button>)}</div>
        <h3 className="ids-h3" style={{ marginTop: 28 }}>Buttons</h3>
        <div className="tb">{BUTTON_STYLES.map(b => <button key={b} className={"iconbtn" + (page.buttonStyle === b ? " on" : "")} aria-pressed={page.buttonStyle === b} onClick={() => edit(p => ({ ...p, buttonStyle: b }))}>{b[0]!.toUpperCase() + b.slice(1)}</button>)}<span style={{ width: 12 }} />{SHAPES.map(s => <button key={s} className={"iconbtn" + (page.shape === s ? " on" : "")} aria-pressed={page.shape === s} onClick={() => edit(p => ({ ...p, shape: s }))}>{s[0]!.toUpperCase() + s.slice(1)}</button>)}</div>
        <h3 className="ids-h3" style={{ marginTop: 28 }}>Social icons</h3>
        <div className="ids-card lt-form">{page.socials.map((s, i) => <div key={i} className="lt-soc"><select className="ids-input" aria-label="Network" value={s.kind} onChange={e => edit(p => ({ ...p, socials: p.socials.map((x, j) => j === i ? { ...x, kind: e.target.value as SocialKind } : x) }))}>{SOCIAL_KINDS.map(k => <option key={k} value={k}>{k} ({SOCIAL_LABEL[k]})</option>)}</select>
          <input className="ids-input" aria-label="Social URL" placeholder="https://" value={s.url} onChange={e => edit(p => ({ ...p, socials: p.socials.map((x, j) => j === i ? { ...x, url: e.target.value } : x) }))} /><button className="iconbtn" aria-label="Remove social" onClick={() => edit(p => ({ ...p, socials: p.socials.filter((_, j) => j !== i) }))}>×</button></div>)}
          {page.socials.length < LIMITS.socials && <button className="iconbtn" onClick={() => edit(p => ({ ...p, socials: [...p.socials, { kind: "website", url: "" }] }))}>+ Add social icon</button>}</div></section>}

      {tab === "analytics" && <section data-testid="tab-analytics">
        <div className="mk-stats" style={{ marginTop: 0 }}><div className="ids-card"><b data-testid="stat-views">{stats.views}</b><span className="ids-muted">Page views</span></div><div className="ids-card"><b data-testid="stat-clicks">{stats.clicks}</b><span className="ids-muted">Link clicks</span></div><div className="ids-card"><b>{stats.ctr}%</b><span className="ids-muted">Click-through rate</span></div></div>
        <h3 className="ids-h3" style={{ margin: "28px 0 12px" }}>Last 14 days</h3>
        <div className="ids-card lt-chart" role="img" aria-label="Page views per day">{stats.series.map(s => <div key={s.day} title={`${s.day}: ${s.v} views, ${s.c} clicks`}><i style={{ height: `${(s.v / max) * 100}%` }} /><span>{s.day.slice(8)}</span></div>)}</div>
        <h3 className="ids-h3" style={{ margin: "28px 0 12px" }}>Top links</h3>
        <div className="ids-card" style={{ padding: 8 }}><table className="mk-table"><tbody>{stats.top.map(l => <tr key={l.id}><td>{l.title || "(untitled)"}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{l.clicks}</td></tr>)}{stats.top.length === 0 && <tr><td className="ids-muted">No links yet.</td></tr>}</tbody></table></div></section>}

      {tab === "settings" && <section data-testid="tab-settings"><div className="ids-card lt-form">
        <label className="ids-label" htmlFor="handle" style={{ marginTop: 0 }}>Your handle</label>
        <div className="lt-handle"><span className="ids-muted">{BP}/u/</span><input id="handle" className="ids-input" value={handle} onChange={e => checkHandle(e.target.value.toLowerCase())} /></div>
        <p className="ids-muted" role="status" style={{ fontSize: 13, margin: "6px 0 14px" }} data-testid="handle-note">{hNote}</p>
        <button className="ids-btn ids-btn--primary" disabled={handle === page.handle || (hNote !== "Available")} onClick={() => save({ handle })}>Change handle</button>
        <p className="ids-muted" style={{ fontSize: 13, marginTop: 20 }}>Changing your handle changes your link. The old one is released right away.</p></div></section>}
    </div>
    <aside className={"lt-app__side" + (showPreview ? " open" : "")}><div className="lt-phone"><div className="lt-phone__scr"><PagePreview page={page} hrefFor={null} /></div></div></aside>
    <button className="ids-btn ids-btn--primary lt-fab" onClick={() => setShowPreview(v => !v)}>{showPreview ? "Close preview" : "Preview"}</button>
  </div>;
}
