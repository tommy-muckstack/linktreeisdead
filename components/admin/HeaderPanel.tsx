"use client";
// Header: layout (Classic / Hero / Banner / Cutout / Shape), profile image, title, bio, title style, title font and colour.
import { useState } from "react";
import { HEADER_LAYOUTS, LIMITS, FONTS, type HeaderLayout } from "@/lib/model";
import { fontStack, googleFontsHref } from "@/lib/fonts";
import { I } from "@/components/icons";
import { useAdmin, readImage } from "@/components/admin/AdminProvider";
import { track, EVENTS } from "@/lib/analytics";
import { Choice, ColorField, Field, Menu, IconBtn, PanelHead, Row, Switch, Modal } from "@/components/admin/ui";

const LAYOUT_ART: Record<HeaderLayout, React.ReactNode> = {
  classic: <svg viewBox="0 0 60 60" width="56" height="56"><circle cx="30" cy="24" r="14" fill="currentColor" opacity=".55" /><rect x="14" y="44" width="32" height="5" rx="2.5" fill="currentColor" opacity=".3" /></svg>,
  hero: <svg viewBox="0 0 60 60" width="56" height="56"><rect x="4" y="4" width="52" height="34" rx="6" fill="currentColor" opacity=".55" /><rect x="14" y="44" width="32" height="5" rx="2.5" fill="currentColor" opacity=".3" /></svg>,
  banner: <svg viewBox="0 0 60 60" width="56" height="56"><rect x="4" y="4" width="52" height="18" rx="5" fill="currentColor" opacity=".3" /><circle cx="30" cy="24" r="10" fill="currentColor" opacity=".6" /><rect x="14" y="42" width="32" height="5" rx="2.5" fill="currentColor" opacity=".3" /></svg>,
  cutout: <svg viewBox="0 0 60 60" width="56" height="56"><path d="M18 40c0-10 5-26 12-26s12 16 12 26z" fill="currentColor" opacity=".55" /><rect x="14" y="46" width="32" height="5" rx="2.5" fill="currentColor" opacity=".3" /></svg>,
  shape: <svg viewBox="0 0 60 60" width="56" height="56"><path d="M30 8c10 0 17 6 16 15s-6 17-16 17-17-6-16-16 6-16 16-16z" fill="currentColor" opacity=".55" /><rect x="14" y="46" width="32" height="5" rx="2.5" fill="currentColor" opacity=".3" /></svg>,
};
export function FontPicker({ value, onPick, onClose, title }: { value: string; onPick: (f: string) => void; onClose: () => void; title: string }) {
  const href = googleFontsHref([...FONTS], FONTS.join(""));
  return <Modal title={title} onClose={onClose}>{href && <link rel="stylesheet" href={href} />}<div className="ad-fonts">{FONTS.map(f => <button key={f} type="button" className={value === f ? "on" : ""} style={{ fontFamily: fontStack(f) }} onClick={() => { onPick(f); onClose(); }}>{f}</button>)}</div></Modal>;
}
export function HeaderPanel() {
  const { page, edit, toast } = useAdmin(); const d = page.design; const [fontOpen, setFontOpen] = useState(false);
  const setD = (patch: Partial<typeof d>) => edit(p => ({ ...p, design: { ...p.design, ...patch } }));
  const upAvatar = async (f?: File) => { if (!f) return; try { const img = await readImage(f, d.header === "hero" || d.header === "banner" ? 900 : 400, { square: d.header !== "hero" && d.header !== "banner", quality: 0.82 }); edit(p => ({ ...p, avatar: img })); } catch (e) { toast((e as Error).message); } };
  const upLogo = async (f?: File) => { if (!f) return; try { setD({ logo: await readImage(f, 440, { type: "image/png" }), titleStyle: "logo" }); } catch (e) { toast((e as Error).message); } };
  return <>
    <PanelHead title="Header" />
    <h3 className="ad-sec">Layout</h3>
    <Choice label="Header layout" options={HEADER_LAYOUTS} value={d.header} onChange={v => { track(EVENTS.link_header_layout_set, { layout: v }); setD({ header: v }); }} cols={5} render={v => <>{LAYOUT_ART[v]}{v[0]!.toUpperCase() + v.slice(1)}</>} />
    <hr className="ad-hr" />
    <Row label="Profile image" sub={d.header === "hero" || d.header === "banner" ? "Shown large at the top. Landscape works best." : "Square works best"}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label className="ad-upload" style={{ borderRadius: d.header === "classic" ? 999 : 14 }} aria-label="Upload profile image">{page.avatar ? <img src={page.avatar} alt="" /> : <I n="user" s={28} />}<em><I n="plus" s={14} /></em><input type="file" accept="image/*" hidden onChange={e => upAvatar(e.target.files?.[0])} /></label>
        {page.avatar && <Menu trigger={open => <IconBtn n="hmore" label="Image options" onClick={open} />} items={[{ icon: "trash", label: "Remove image", onClick: () => edit(p => ({ ...p, avatar: "" })) }]} />}
      </div></Row>
    <Field label="Title" value={page.title} max={LIMITS.title} onChange={v => edit(p => ({ ...p, title: v }))} />
    <Field label="Bio" value={page.bio} max={LIMITS.bio} multiline onChange={v => edit(p => ({ ...p, bio: v }))} />
    <hr className="ad-hr" />
    <Row label="Title style"><Choice label="Title style" options={["text", "logo"] as const} value={d.titleStyle} onChange={v => setD({ titleStyle: v })} cols={2} render={v => <><I n={v === "text" ? "type" : "image"} s={20} />{v === "text" ? "Text" : "Logo"}</>} /></Row>
    {d.titleStyle === "logo" && <Row label="Logo image" sub="PNG with a transparent background looks best"><label className="ad-upload" aria-label="Upload logo">{d.logo ? <img src={d.logo} alt="" style={{ objectFit: "contain" }} /> : <I n="image" s={24} />}<em><I n="plus" s={14} /></em><input type="file" accept="image/*" hidden onChange={e => upLogo(e.target.files?.[0])} /></label></Row>}
    <Row label="Alternative title font" sub={d.altTitleFont ? d.titleFont : "Matches page font by default"}><div style={{ display: "flex", gap: 8, alignItems: "center" }}>{d.altTitleFont && <button type="button" className="ad-chip" onClick={() => setFontOpen(true)} style={{ fontFamily: fontStack(d.titleFont) }}>{d.titleFont}</button>}<Switch on={d.altTitleFont} label="Alternative title font" onChange={v => { setD({ altTitleFont: v }); if (v) setFontOpen(true); }} /></div></Row>
    <ColorField label="Title color" value={d.titleColor} onChange={v => setD({ titleColor: v, theme: "custom" })} />
    {fontOpen && <FontPicker title="Title font" value={d.titleFont} onPick={f => setD({ titleFont: f })} onClose={() => setFontOpen(false)} />}
  </>;
}
