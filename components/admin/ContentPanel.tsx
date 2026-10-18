"use client";
// Content: profile summary, social icons, the block list (drag to reorder, drop onto a collection to group), archive.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { isComplete, newBlock, type Block } from "@/lib/model";
import { I, SocialIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { useAdmin, publicUrl } from "@/components/admin/AdminProvider";
import { Btn, IconBtn, Menu, PanelHead, Switch, plural, Empty } from "@/components/admin/ui";
import { AddDialog } from "@/components/admin/AddDialog";
import { SocialsDialog } from "@/components/admin/SocialsDialog";
import { TYPE_META } from "@/components/admin/catalog";
import { track, EVENTS } from "@/lib/analytics";


const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
export function blockIcon(l: Block, s = 20) { return l.thumb ? <img src={l.thumb} alt="" /> : l.icon ? <SocialIcon kind={l.icon} s={s} /> : <I n={TYPE_META[l.type].icon} s={s} />; }

export function ContentPanel() {
  const { page, edit, setBlock, toast } = useAdmin(); const router = useRouter(); const sp = useSearchParams();
  const [add, setAdd] = useState<null | { parent: string }>(sp.get("add") ? { parent: "" } : null);
  const [social, setSocial] = useState<null | string>(null); const [view, setView] = useState<"list" | "archive">("list");
  const [select, setSelect] = useState(false); const [picked, setPicked] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<string | null>(null); const [over, setOver] = useState<string | null>(null);
  const live = page.links.filter(l => !l.archived); const archived = page.links.filter(l => l.archived);
  const top = live.filter(l => !l.parent); const kids = (id: string) => live.filter(l => l.parent === id);
  const suggested = useMemo(() => (["instagram", "tiktok", "whatsapp", "email"] as const).filter(k => !page.socials.some(s => s.kind === k)), [page.socials]);

  const move = (id: string, target: string, into = false) => edit(p => {
    if (id === target) return p; const a = [...p.links]; const from = a.findIndex(l => l.id === id); if (from < 0) return p;
    const [m] = a.splice(from, 1); const tgt = a.find(l => l.id === target);
    if (into && tgt?.type === "collection" && m!.type !== "collection") { m!.parent = tgt.id; a.splice(a.findIndex(l => l.id === target) + 1, 0, m!); return { ...p, links: a }; }
    m!.parent = m!.type === "collection" ? "" : tgt?.parent ?? ""; a.splice(Math.max(0, a.findIndex(l => l.id === target)), 0, m!); return { ...p, links: a };
  });
  const nudge = (id: string, d: -1 | 1) => edit(p => { const sib = p.links.filter(l => !l.archived && l.parent === p.links.find(x => x.id === id)?.parent); const i = sib.findIndex(l => l.id === id), j = i + d; if (j < 0 || j >= sib.length) return p; const a = [...p.links]; const ai = a.findIndex(l => l.id === id), aj = a.findIndex(l => l.id === sib[j]!.id); [a[ai], a[aj]] = [a[aj]!, a[ai]!]; return { ...p, links: a }; });
  const archive = (ids: string[], on = true) => { if (on) track(EVENTS.app_block_archived, { count: ids.length }); edit(p => ({ ...p, links: p.links.map(l => ids.includes(l.id) || ids.includes(l.parent) ? { ...l, archived: on, ...(on && l.type !== "collection" && ids.includes(l.parent) ? {} : {}) } : l) })); toast(on ? (ids.length > 1 ? `${ids.length} items archived` : "Archived. Find it in the archive.") : "Restored"); };
  const remove = (ids: string[]) => { if (!confirm(ids.length > 1 ? `Delete ${ids.length} items for good?` : "Delete this for good? You can archive it instead to keep its stats.")) return; track(EVENTS.app_block_deleted, { count: ids.length }); edit(p => ({ ...p, links: p.links.filter(l => !ids.includes(l.id)).map(l => ids.includes(l.parent) ? { ...l, parent: "" } : l) })); toast("Deleted"); };
  const share = async (l: Block) => { try { await navigator.clipboard.writeText(l.url || publicUrl(page.handle)); toast("Link copied"); } catch { /* ignore */ } };

  const card = (l: Block, inColl = false): React.ReactNode => {
    const done = isComplete(l); const coll = l.type === "collection";
    const tags = [l.schedule.start || l.schedule.end ? "Scheduled" : "", l.lock.kind !== "none" ? "Locked" : "", l.layout === "featured" ? "Featured" : "", l.anim !== "none" ? "Animated" : "", l.prioritize ? "Prioritized" : "", l.redirect ? "Redirect on" : ""].filter(Boolean);
    const sub = coll ? plural(kids(l.id).length, "item") : l.type === "link" ? (l.url ? host(l.url) : "") : TYPE_META[l.type].label;
    const body = <div key={l.id} className={"ad-card" + (l.type === "header" ? " ad-card--header" : "") + (!l.enabled ? " hidden" : "") + (drag === l.id ? " dragging" : "") + (over === l.id ? " over" : "")} data-testid="link-row"
      draggable={!select} onDragStart={e => { setDrag(l.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { setDrag(null); setOver(null); }}
      onDragOver={e => { e.preventDefault(); if (drag && drag !== l.id) setOver(l.id); }} onDragLeave={() => setOver(o => (o === l.id ? null : o))}
      onDrop={e => { e.preventDefault(); if (drag) move(drag, l.id, coll && e.nativeEvent.offsetY > 30); setDrag(null); setOver(null); }}>
      {select ? <input type="checkbox" aria-label={`Select ${l.title || "item"}`} checked={picked.has(l.id)} onChange={e => setPicked(s => { const n = new Set(s); if (e.target.checked) n.add(l.id); else n.delete(l.id); return n; })} /> : <span className="ad-card__grip" aria-hidden><I n="grip" s={16} /></span>}
      {l.type !== "header" && <span className="ad-card__ic">{blockIcon(l)}</span>}
      <button type="button" className="ad-card__m" onClick={() => router.push(`/app/links/edit/${l.id}`)}>
        <span className="ad-card__t">{l.title || (l.type === "link" ? (l.url ? host(l.url) : "Untitled link") : TYPE_META[l.type].label)}</span>
        {l.type !== "header" && <span className="ad-card__s">{l.type === "link" || coll ? null : null}{l.type !== "text" && <span>{plural(l.clicks, "click")}</span>}{sub && <span>{sub}</span>}{tags.map(t => <span key={t} className="tag">{t}</span>)}</span>}
      </button>
      <div className="ad-card__r">
        {!done && <button type="button" className="ad-card__warn" onClick={() => router.push(`/app/links/edit/${l.id}`)}><I n="wand" s={16} />Setup</button>}
        <Switch on={l.enabled} label={l.enabled ? "Hide from page" : "Show on page"} onChange={v => { track(EVENTS.app_block_toggled, { visible: v }); setBlock(l.id, { enabled: v }); }} />
        <Menu trigger={open => <IconBtn n="vmore" label="More options" onClick={open} />} items={[
          { icon: "pencil", label: "Edit", onClick: () => router.push(`/app/links/edit/${l.id}`) },
          { icon: "up", label: "Move up", onClick: () => nudge(l.id, -1) }, { icon: "down", label: "Move down", onClick: () => nudge(l.id, 1) },
          l.url ? { icon: "share", label: "Copy link", onClick: () => share(l) } : null,
          { icon: l.enabled ? "eyeoff" : "eye", label: l.enabled ? "Hide" : "Show", onClick: () => setBlock(l.id, { enabled: !l.enabled }) },
          inColl ? { icon: "folder", label: "Move out of collection", onClick: () => setBlock(l.id, { parent: "" }) } : null,
          !coll && !inColl && top.some(x => x.type === "collection") ? { icon: "folderplus", label: "Move into collection", onClick: () => { const c = top.find(x => x.type === "collection")!; setBlock(l.id, { parent: c.id }); toast(`Moved into ${c.title || "collection"}`); } } : null,
          coll ? { icon: "plus", label: "Add to this collection", onClick: () => setAdd({ parent: l.id }) } : null,
          { icon: "archive", label: "Archive", onClick: () => archive([l.id]) }, { icon: "trash", label: "Delete", onClick: () => remove([l.id]), danger: true },
        ]} />
      </div>
    </div>;
    if (!coll) return body;
    const k = kids(l.id);
    return <li key={l.id} className="ad-coll">{body}<div className="ad-coll__kids">{k.map(x => card(x, true))}{k.length === 0 && <div className="ad-coll__drop">Drag links here, or <button type="button" className="ad-linkbtn" onClick={() => setAdd({ parent: l.id })}>add one</button></div>}</div></li>;
  };

  if (view === "archive") return <>
    <PanelHead title="Archive" back={() => setView("list")} />
    {archived.length === 0 ? <Empty icon="archive" title="Nothing archived" text="Archived links keep their clicks and can be restored any time." /> :
      <ul className="ad-list">{archived.map(l => <div key={l.id} className="ad-card"><span className="ad-card__ic">{blockIcon(l)}</span><span className="ad-card__m"><span className="ad-card__t">{l.title || TYPE_META[l.type].label}</span><span className="ad-card__s">{plural(l.clicks, "click")}</span></span><div className="ad-card__r"><Btn small kind="secondary" onClick={() => edit(p => ({ ...p, links: p.links.map(x => x.id === l.id ? { ...x, archived: false, parent: "" } : x) }))}>Restore</Btn><IconBtn n="trash" label="Delete for good" onClick={() => remove([l.id])} /></div></div>)}</ul>}
  </>;

  return <>
    <PanelHead title="Content" right={<><IconBtn n="checklist" label={select ? "Done selecting" : "Select multiple"} active={select} onClick={() => { setSelect(s => !s); setPicked(new Set()); }} /><IconBtn n="archive" label="View archive" onClick={() => setView("archive")} /></>} />
    <div className="ad-prof">
      <Link href="/app/header" className="ad-prof__av" aria-label="Edit profile image">{page.avatar ? <img src={page.avatar} alt="" /> : <I n="user" s={28} />}</Link>
      <div className="ad-prof__m"><Link href="/app/header" className="ad-prof__h">{page.title || "@" + page.handle}</Link>
        <div className="ad-socrow" id="socials">
          {page.socials.map(s => <button key={s.kind} type="button" className={"ad-soc" + (s.enabled ? "" : " off")} aria-label={`Edit ${s.kind}`} onClick={() => setSocial(s.kind)}><SocialIcon kind={s.kind} s={22} /></button>)}
          {suggested.map(k => <button key={k} type="button" className="ad-soc" style={{ opacity: .45 }} aria-label={`Add ${k}`} onClick={() => setSocial(k)}><SocialIcon kind={k} s={22} /><em>+</em></button>)}
          <IconBtn n="plus" label="Add social icon" size={28} onClick={() => setSocial("")} />
        </div></div>
    </div>
    {select ? <div className="ad-addrow"><Btn kind="secondary" icon="eyeoff" disabled={!picked.size} onClick={() => { edit(p => ({ ...p, links: p.links.map(l => picked.has(l.id) ? { ...l, enabled: false } : l) })); setPicked(new Set()); }}>Hide {picked.size || ""}</Btn><Btn kind="secondary" icon="archive" disabled={!picked.size} onClick={() => { archive([...picked]); setPicked(new Set()); setSelect(false); }}>Archive {picked.size || ""}</Btn></div>
      : <div className="ad-addrow"><Btn kind="secondary" icon="folderplus" onClick={() => { const b = newBlock("collection", { title: "New collection", data: { layout: "stack" } }); edit(p => ({ ...p, links: [b, ...p.links] })); router.push(`/app/links/edit/${b.id}`); }}>Add collection</Btn><Btn icon="plus" onClick={() => setAdd({ parent: "" })}>Add</Btn></div>}
    {top.length === 0 ? <Empty icon="link" title="Show the world who you are." text="Add a link to get started."><Btn icon="plus" onClick={() => setAdd({ parent: "" })}>Add</Btn></Empty> : <ul className="ad-list">{top.map(l => card(l))}</ul>}
    <div className="ad-footcard"><div><b>LinktreeIsDead footer</b><small><Mark size={16} />Join {page.handle} on LinktreeIsDead</small></div><Switch on={!page.design.hideFooter} label="Show footer" onChange={v => edit(p => ({ ...p, design: { ...p.design, hideFooter: !v } }))} /></div>
    {add && <AddDialog parent={add.parent} onClose={() => setAdd(null)} />}
    {social !== null && <SocialsDialog initial={social} onClose={() => setSocial(null)} />}
  </>;
}
