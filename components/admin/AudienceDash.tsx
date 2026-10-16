"use client";
// Audience (contacts from Subscribe + forms) and Messaging (visitor messages). Both read /api/contacts; export is CSV.
import { useEffect, useState } from "react";
import Link from "next/link";
import { BP } from "@/lib/basepath";
import type { Contact } from "@/lib/pages";
import { I } from "@/components/icons";
import { DashHead } from "@/components/admin/AdminChrome";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Btn, Empty, IconBtn, Switch, Row, plural } from "@/components/admin/ui";
import { track, EVENTS } from "@/lib/analytics";


function useBox(box: "contacts" | "inbox") {
  const [items, setItems] = useState<Contact[] | null>(null); const [blocks, setBlocks] = useState<Record<string, string>>({});
  const load = () => fetch(`${BP}/api/contacts${box === "inbox" ? "?box=inbox" : ""}`).then(r => r.json()).then(j => { setItems(j.items ?? []); setBlocks(j.blocks ?? {}); }).catch(() => setItems([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const remove = async (id: string) => { if (!confirm("Delete this for good?")) return; await fetch(`${BP}/api/contacts`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, box }) }); setItems(x => x?.filter(c => c.id !== id) ?? null); };
  return { items, blocks, remove, reload: load };
}
const src = (c: Contact, blocks: Record<string, string>) => c.kind === "subscribe" ? "Subscribe button" : blocks[c.block] ? `${blocks[c.block]} (${c.kind})` : c.kind;

export function AudienceDash() {
  const { page, edit } = useAdmin(); const { items, blocks, remove } = useBox("contacts"); const [q, setQ] = useState(""); const [tab, setTab] = useState<"contacts" | "integrations">("contacts");
  const shown = (items ?? []).filter(c => !q || [c.name, c.email, c.phone, c.message, c.choice].join(" ").toLowerCase().includes(q.toLowerCase()));
  const polls = (items ?? []).filter(c => c.kind === "poll");
  return <>
    <DashHead title="Audience"><div className="ad-tabs" style={{ border: 0, margin: 0 }}>{(["contacts", "integrations"] as const).map(t => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t === "contacts" ? "Contacts" : "Export"}</button>)}</div><span style={{ flex: 1 }} /></DashHead>
    <div className="ad-dbody ad-dbody--wide">
      {tab === "integrations" ? <div className="ad-tile"><h3 className="ad-sec">Export your contacts</h3><p className="ad-muted" style={{ marginBottom: 16 }}>Download a CSV you can import into any mailing tool (Mailchimp, Kit, beehiiv, Google Sheets…). Your list stays yours.</p><a className="ad-btn ad-btn--primary" onClick={() => track(EVENTS.app_contacts_exported, { box: "contacts" })} href={`${BP}/api/contacts?format=csv`}><I n="download" s={18} />Download CSV</a></div>
        : items === null ? <p className="ad-muted">Loading…</p> : items.length === 0 ? <div className="ad-tile"><Empty icon="users" title="Let visitors subscribe to your page for updates" text="Let's start growing your contact list."><Btn onClick={() => edit(p => ({ ...p, settings: { ...p.settings, subscribe: true } }))} disabled={page.settings.subscribe}>{page.settings.subscribe ? "Subscribe is on" : "Turn on Subscribe"}</Btn></Empty>
          <h3 className="ad-sec">Tools to grow your audience</h3><div className="ad-tiles">{[["Collect subscribers", "Email signups with a Subscribe button", "/app/settings"], ["Create a contact form", "Receive messages, leads and info", "/app/links?add=1"], ["Offer discount codes", "Display subscriber-only deals", "/app/links?add=1"], ["Lock one of your links", "Exclusive content behind a code", "/app/links"]].map(([t, s, h]) => <Link key={t} href={h!} className="ad-tile" style={{ textDecoration: "none" }}><b>{t}</b><p className="ad-muted">{s}</p></Link>)}</div></div>
        : <>
          <div className="ad-mini" style={{ marginBottom: 16 }}><input className="ad-input" placeholder="Search contacts" value={q} onChange={e => setQ(e.target.value)} aria-label="Search contacts" /><a className="ad-btn ad-btn--secondary" onClick={() => track(EVENTS.app_contacts_exported, { box: "contacts" })} href={`${BP}/api/contacts?format=csv`}><I n="download" s={18} />Export CSV</a></div>
          <Row label="Subscribe button" sub={page.settings.subscribe ? "Visitors can subscribe from your page" : "Off"}><Switch on={page.settings.subscribe} label="Subscribe button" onChange={v => edit(p => ({ ...p, settings: { ...p.settings, subscribe: v } }))} /></Row>
          {polls.length > 0 && <div className="ad-tile" style={{ marginBottom: 16 }}><b>Poll results</b>{Object.entries(polls.reduce<Record<string, Record<string, number>>>((m, c) => { (m[c.block] ??= {})[c.choice] = (m[c.block]?.[c.choice] ?? 0) + 1; return m; }, {})).map(([b, votes]) => <div key={b} style={{ marginTop: 8 }}><small className="ad-muted">{blocks[b] ?? "Poll"}</small>{Object.entries(votes).map(([o, n]) => <div key={o} className="ad-meter"><b>{o}</b><span className="ad-meter__t"><i style={{ width: `${(n / Object.values(votes).reduce((a, x) => a + x, 0)) * 100}%` }} /></span><span>{n}</span></div>)}</div>)}</div>}
          <div className="ad-tile" style={{ padding: 0, overflowX: "auto" }}><table className="ad-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Added</th><th /></tr></thead><tbody>{shown.map(c => <tr key={c.id}><td>{c.name || "–"}{c.message && <div className="ad-muted" style={{ fontSize: 13 }}>{c.message.slice(0, 140)}</div>}{c.choice && <div className="ad-muted" style={{ fontSize: 13 }}>Voted: {c.choice}</div>}</td><td>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "–"}</td><td>{c.phone || "–"}</td><td>{src(c, blocks)}</td><td>{new Date(c.at).toLocaleDateString()}</td><td><IconBtn n="trash" label="Delete contact" onClick={() => remove(c.id)} /></td></tr>)}</tbody></table></div>
          <p className="ad-help">{plural(items.length, "contact")}</p></>}
    </div>
  </>;
}

export function MessagingDash() {
  const { page, edit } = useAdmin(); const { items, remove } = useBox("inbox"); const [open, setOpen] = useState<string | null>(null);
  const cur = items?.find(m => m.id === open);
  return <>
    <DashHead title="Messaging"><Row label="Accept messages on your page"><Switch on={page.settings.messages} label="Accept messages" onChange={v => edit(p => ({ ...p, settings: { ...p.settings, messages: v } }))} /></Row></DashHead>
    <div className="ad-dbody ad-dbody--wide">
      {items === null ? <p className="ad-muted">Loading…</p> : items.length === 0 ? <div className="ad-tile"><Empty icon="inbox" title="Welcome to your inbox" text={page.settings.messages ? "Visitors can message you from the Message button on your page. Messages land here." : "Turn on messages and visitors get a Message button on your page."}>{!page.settings.messages && <Btn onClick={() => edit(p => ({ ...p, settings: { ...p.settings, messages: true } }))}>Let visitors message me</Btn>}</Empty></div>
        : <div className="ad-inbox"><ul className="ad-inbox__list">{items.map(m => <li key={m.id}><button type="button" className={open === m.id ? "on" : ""} onClick={() => setOpen(m.id)}><b>{m.name || m.email}</b><small>{new Date(m.at).toLocaleString()}</small><span>{m.message.slice(0, 90)}</span></button></li>)}</ul>
          <div className="ad-tile ad-inbox__msg">{cur ? <><div className="ad-row" style={{ minHeight: 0 }}><div><b>{cur.name}</b><div className="ad-muted">{cur.email}</div></div><IconBtn n="trash" label="Delete message" onClick={() => { remove(cur.id); setOpen(null); }} /></div><p style={{ whiteSpace: "pre-line" }}>{cur.message}</p>{cur.email && <a className="ad-btn ad-btn--primary" href={`mailto:${cur.email}?subject=${encodeURIComponent("Re: your message on " + page.title)}`}><I n="send" s={16} />Reply by email</a>}</> : <p className="ad-muted">Pick a message to read it.</p>}</div></div>}
    </div>
  </>;
}
