"use client";
// The Add menu: paste a link (we detect videos, music and platforms) or pick a block type by category.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { newBlock, normalizeUrl, type Block, LIMITS } from "@/lib/model";
import { sniff } from "@/lib/embeds";
import { I, SocialIcon } from "@/components/icons";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Modal } from "@/components/admin/ui";
import { CATALOG, CATS, type Entry } from "@/components/admin/catalog";
import { track, EVENTS } from "@/lib/analytics";


export function AddDialog({ onClose, parent = "" }: { onClose: () => void; parent?: string }) {
  const { edit, page, toast } = useAdmin(); const router = useRouter();
  const [q, setQ] = useState(""); const [cat, setCat] = useState("suggested");
  const asUrl = useMemo(() => { const t = q.trim(); return /\.[a-z]{2,}/i.test(t) && !/\s/.test(t) ? normalizeUrl(t) : null; }, [q]);
  const shown = useMemo(() => { const t = q.trim().toLowerCase(); if (t && !asUrl) return CATALOG.filter(e => (e.name + " " + e.blurb).toLowerCase().includes(t)); return cat === "all" ? CATALOG : CATALOG.filter(e => e.cats.includes(cat)); }, [q, cat, asUrl]);
  const create = (b: Block, source = "catalog") => {
    track(EVENTS.link_block_added, { block_type: b.type, source: parent ? "collection" : source });
    if (page.links.length >= LIMITS.links) { toast(`You can have up to ${LIMITS.links} blocks.`); return; }
    edit(p => ({ ...p, links: [b, ...p.links] })); onClose(); router.push(`/app/links/edit/${b.id}`);
  };
  const pick = (e: Entry) => {
    if (e.type === "messaging") { edit(p => ({ ...p, settings: { ...p.settings, messages: true } })); toast("Messaging is on. Visitors see a Message button."); onClose(); router.push("/app/messaging"); return; }
    create(newBlock(e.type, { parent, ...e.preset, ...(e.social && e.type === "link" ? { icon: e.social } : {}), data: { ...(e.preset?.data ?? {}) } }));
  };
  const addUrl = () => { if (!asUrl) return; const s = sniff(asUrl); create(newBlock(s.type, { parent, url: asUrl, title: s.title, icon: s.icon }), "paste"); };
  const quick: { label: string; icon: string; go: () => void }[] = [
    { label: "Collection", icon: "folder", go: () => create(newBlock("collection", { title: "New collection", data: { layout: "stack" } }), "quick") },
    { label: "Link", icon: "link", go: () => create(newBlock("link", { parent }), "quick") },
    { label: "Header", icon: "type", go: () => create(newBlock("header", { parent, title: "Header" }), "quick") },
    { label: "Form", icon: "form", go: () => pick(CATALOG.find(c => c.id === "form")!) },
  ];
  const tile = (e: Entry) => <button key={e.id} type="button" className="ad-add__it" onClick={() => pick(e)}>
    <span className="ic" style={{ background: e.color }}>{e.social ? <SocialIcon kind={e.social} s={24} color="#fff" /> : <I n={e.icon} s={22} />}</span>
    <span><b>{e.name}</b><small>{e.blurb}</small></span><I n="right" s={18} /></button>;
  return <Modal title="Add" onClose={onClose} wide>
    <div className="ad-add">
      <label className="ad-add__search"><I n="search" s={20} /><input autoFocus placeholder="Paste a link or search…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && asUrl) addUrl(); }} aria-label="Paste a link or search" /></label>
      <nav className="ad-add__cats" aria-label="Categories">{CATS.map(c => <button key={c.id} type="button" className={cat === c.id && !q ? "on" : ""} onClick={() => { setCat(c.id); setQ(""); }}><I n={c.icon} s={20} />{c.label}</button>)}</nav>
      <div>
        {asUrl ? <><div className="ad-add__h">Add from link</div><button type="button" className="ad-add__it" onClick={addUrl}><span className="ic" style={{ background: "#111" }}><I n="link" s={22} /></span><span><b>{sniff(asUrl).type === "link" ? "Add link" : `Add ${sniff(asUrl).type}`}</b><small>{asUrl}</small></span><I n="right" s={18} /></button></>
          : <>{!q && cat === "suggested" && <div className="ad-add__quick">{quick.map(x => <button key={x.label} type="button" onClick={x.go}>{x.label}<I n={x.icon} s={22} /></button>)}</div>}
            <div className="ad-add__h">{q ? `Results for "${q}"` : CATS.find(c => c.id === cat)?.label}</div>
            {shown.length ? shown.map(tile) : <p className="ad-muted" style={{ padding: 12 }}>Nothing matches. Paste a full link to add it as a button.</p>}</>}
      </div>
    </div>
  </Modal>;
}
