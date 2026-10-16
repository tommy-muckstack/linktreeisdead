"use client";
// Social icons: pick a platform, paste your profile, turn it on or off, and choose where the row sits.
import { useState } from "react";
import { SOCIAL_IDS, SOCIAL_NAMES, SOCIAL_HINT, normalizeSocial, type SocialKind } from "@/lib/model";
import { SocialIcon, I } from "@/components/icons";
import { useAdmin } from "@/components/admin/AdminProvider";
import { track, EVENTS } from "@/lib/analytics";
import { Modal, Field, Btn, Switch, Row, Choice } from "@/components/admin/ui";

export function SocialsDialog({ initial, onClose }: { initial: string; onClose: () => void }) {
  const { page, edit } = useAdmin();
  const [kind, setKind] = useState<SocialKind | "">(initial as SocialKind | ""); const [q, setQ] = useState("");
  const cur = page.socials.find(s => s.kind === kind);
  const [url, setUrl] = useState(cur ? cur.url.replace(/^mailto:|^tel:/, "") : ""); const [err, setErr] = useState("");
  const pickKind = (k: SocialKind) => { setKind(k); const c = page.socials.find(s => s.kind === k); setUrl(c ? c.url.replace(/^mailto:|^tel:/, "") : ""); setErr(""); };
  const save = () => {
    if (!kind) return; const u = normalizeSocial(kind, url); if (!u) { setErr(kind === "email" ? "Enter a valid email address." : kind === "phone" ? "Enter a valid phone number." : "Enter a valid link, like https://…"); return; }
    if (!cur) track(EVENTS.link_social_added, { platform: kind });
    edit(p => ({ ...p, socials: p.socials.some(s => s.kind === kind) ? p.socials.map(s => s.kind === kind ? { ...s, url: u } : s) : [...p.socials, { kind, url: u, enabled: true }] })); onClose();
  };
  if (!kind) return <Modal title="Add social icon" onClose={onClose}>
    <label className="ad-add__search" style={{ marginBottom: 16 }}><I n="search" s={18} /><input autoFocus placeholder="Search" value={q} onChange={e => setQ(e.target.value)} aria-label="Search platforms" /></label>
    <div className="ad-list2">{SOCIAL_IDS.filter(k => SOCIAL_NAMES[k].toLowerCase().includes(q.toLowerCase())).map(k => <button key={k} type="button" className="ad-add__it" onClick={() => pickKind(k)}><span className="ic" style={{ background: "#F1F1EE", color: "#111" }}><SocialIcon kind={k} s={22} /></span><span><b>{SOCIAL_NAMES[k]}</b>{page.socials.some(s => s.kind === k) && <small>Added</small>}</span><I n="right" s={18} /></button>)}</div>
    <hr className="ad-hr" />
    <Row label="Position" sub="Show icons under your bio or at the bottom of the page"><Choice label="Icon position" options={["top", "bottom"] as const} value={page.settings.socialPosition} onChange={v => edit(p => ({ ...p, settings: { ...p.settings, socialPosition: v } }))} render={v => v === "top" ? "Top" : "Bottom"} /></Row>
  </Modal>;
  return <Modal title={<span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><SocialIcon kind={kind} s={20} />{cur ? "Edit" : "Add"} {SOCIAL_NAMES[kind]}</span>} onClose={onClose} back={() => setKind("")}>
    <Field label={kind === "email" ? "Email address" : kind === "phone" || kind === "whatsapp" ? "Phone number or link" : `${SOCIAL_NAMES[kind]} URL`} value={url} onChange={v => { setUrl(v); setErr(""); }} placeholder={SOCIAL_HINT[kind] ?? `https://${kind}.com/yourname`} autoFocus error={err} />
    {cur && <Row label="Show on page"><Switch on={cur.enabled} label="Show on page" onChange={v => edit(p => ({ ...p, socials: p.socials.map(s => s.kind === kind ? { ...s, enabled: v } : s) }))} /></Row>}
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>{cur && <Btn kind="danger" icon="trash" onClick={() => { edit(p => ({ ...p, socials: p.socials.filter(s => s.kind !== kind) })); onClose(); }}>Remove</Btn>}<span style={{ flex: 1 }} /><Btn onClick={save} disabled={!url.trim()}>{cur ? "Save" : "Add to page"}</Btn></div>
  </Modal>;
}
