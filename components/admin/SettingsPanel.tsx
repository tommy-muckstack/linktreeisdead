"use client";
// Settings, in Linktree's order: username, analytics pixels + UTM, support banner, profile access (sensitive warning, lock),
// subscribe, messages, SEO, about. Third-party sync integrations are left out; contacts export as CSV from Audience instead.
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { SUPPORT_CAUSES, validateHandle, type Settings } from "@/lib/model";
import { I } from "@/components/icons";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Btn, Field, PanelHead, Row, Switch } from "@/components/admin/ui";
import { track, EVENTS } from "@/lib/analytics";


const SECTIONS = [["username", "Username"], ["analytics", "Analytics"], ["support", "Support banner"], ["access", "Profile access"], ["subscribe", "Subscribe"], ["messages", "Messages"], ["seo", "SEO"], ["about", "About this account"]] as const;
export function SettingsPanel() {
  const { page, edit, rename, toast } = useAdmin(); const s = page.settings;
  const set = (patch: Partial<Settings>) => { for (const [k, v] of Object.entries(patch)) if (typeof v === "boolean") track(EVENTS.link_setting_changed, { setting: k, on: v }); else if (k === "lock" || k === "support") track(EVENTS.link_setting_changed, { setting: k, on: k === "lock" ? (v as Settings["lock"]).enabled : !!v }); edit(p => ({ ...p, settings: { ...p.settings, ...patch } })); };
  const [h, setH] = useState(page.handle); const [hNote, setHNote] = useState(""); const [busy, setBusy] = useState(false);
  const check = async (v: string) => { setH(v); if (v === page.handle) return setHNote(""); const bad = validateHandle(v); if (bad) return setHNote(bad); const r = await (await fetch(`${BP}/api/handle?h=${encodeURIComponent(v)}`)).json(); setHNote(r.available ? "Available" : r.reason); };
  return <>
    <PanelHead title="Settings" />
    <div className="ad-mini" style={{ marginBottom: 24 }}><span className="ad-muted">Jump to:</span><select className="ad-input" aria-label="Jump to section" onChange={e => document.getElementById("set-" + e.target.value)?.scrollIntoView({ behavior: "smooth" })}>{SECTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>

    <section id="set-username"><h3 className="ad-sec">Username</h3><p className="ad-sub">Your page lives at {BP}/u/<b>{page.handle}</b>. Changing it changes your link.</p>
      <div className="ad-mini"><input className="ad-input" aria-label="Username" value={h} onChange={e => check(e.target.value.toLowerCase().trim())} /><Btn disabled={busy || h === page.handle || hNote !== "Available"} onClick={async () => { setBusy(true); const err = await rename(h); setBusy(false); if (err) setHNote(err); else { setHNote(""); track(EVENTS.app_username_changed); toast("Username updated"); } }}>{busy ? "Saving…" : "Change"}</Btn></div>
      {hNote && <p className={hNote === "Available" ? "ad-help" : "ad-help ad-err"} role="status" data-testid="handle-note">{hNote}</p>}</section>
    <hr className="ad-hr" />

    <section id="set-analytics"><h3 className="ad-sec">Analytics</h3><p className="ad-sub">Send your page's visits to your own Google Analytics or Meta Pixel.</p>
      <Field label="Google Measurement ID" placeholder="G-XXXXXXXXXX" value={s.pixels.google} onChange={v => set({ pixels: { ...s.pixels, google: v.trim().toUpperCase() } })} error={s.pixels.google && !/^G-[A-Z0-9]{4,14}$/.test(s.pixels.google) ? "Looks like G-XXXXXXXXXX" : ""} />
      <Field label="Meta Pixel ID" placeholder="1234567890" value={s.pixels.facebook} onChange={v => set({ pixels: { ...s.pixels, facebook: v.replace(/\D/g, "") } })} />
      <Row label="UTM parameters" sub="Tag outgoing links so your analytics shows this page as 'social' traffic. The campaign is each link's title."><Switch on={s.utm} label="UTM parameters" onChange={v => set({ utm: v })} /></Row></section>
    <hr className="ad-hr" />

    <section id="set-support"><h3 className="ad-sec">Support banner</h3><p className="ad-sub">Show support for a cause with a banner at the top of your page. One at a time.</p>
      <div className="ad-list2">{SUPPORT_CAUSES.map(c => <Row key={c.id} label={c.label} sub={c.text}><Switch on={s.support === c.id} label={c.label} onChange={v => set({ support: v ? c.id : "" })} /></Row>)}</div></section>
    <hr className="ad-hr" />

    <section id="set-access"><h3 className="ad-sec">Profile access</h3>
      <Row label="Sensitive content warning" sub="Visitors confirm before they see your page"><Switch on={s.sensitive} label="Sensitive content warning" onChange={v => set({ sensitive: v })} /></Row>
      <Row label="Lock your page" sub="Visitors need a code to see your page"><Switch on={s.lock.enabled} label="Lock your page" onChange={v => set({ lock: { ...s.lock, enabled: v } })} /></Row>
      {s.lock.enabled && <Field label="Page code" value={s.lock.code} max={32} onChange={v => set({ lock: { ...s.lock, code: v } })} error={!s.lock.code ? "Set a code, or the lock stays off" : ""} />}</section>
    <hr className="ad-hr" />

    <section id="set-subscribe"><h3 className="ad-sec">Subscribe</h3><Row label="Let visitors subscribe" sub="Adds a Subscribe button. Emails land in Audience."><Switch on={s.subscribe} label="Let visitors subscribe" onChange={v => set({ subscribe: v })} /></Row>
      <a className="ad-help" href={`${BP}/app/audience`}>See subscribers <I n="right" s={12} /></a></section>
    <hr className="ad-hr" />

    <section id="set-messages"><h3 className="ad-sec">Messages</h3><Row label="Let visitors message me" sub="Adds a Message button. Messages land in Messaging."><Switch on={s.messages} label="Let visitors message me" onChange={v => set({ messages: v })} /></Row></section>
    <hr className="ad-hr" />

    <section id="set-seo"><h3 className="ad-sec">SEO and discoverability</h3>
      <Row label="Hide profile from search engines" sub="Adds a noindex tag"><Switch on={s.seo.noindex} label="Hide profile from search engines" onChange={v => set({ seo: { ...s.seo, noindex: v } })} /></Row>
      <Field label="Meta title" placeholder={`@${page.handle}`} value={s.seo.title} max={70} onChange={v => set({ seo: { ...s.seo, title: v } })} />
      <Field label="Meta description" placeholder={page.bio || "LinktreeIsDead. Make your link do more."} multiline value={s.seo.description} max={200} onChange={v => set({ seo: { ...s.seo, description: v } })} />
      <p className="ad-help">Sites like X and iMessage may take a while to pick up changes.</p></section>
    <hr className="ad-hr" />

    <section id="set-about"><h3 className="ad-sec">About this account</h3><p className="ad-sub">Appears as a small line in your page footer to help visitors and search engines know who you are.</p>
      <Field label="About" multiline value={s.about} max={300} onChange={v => set({ about: v })} /></section>
  </>;
}
