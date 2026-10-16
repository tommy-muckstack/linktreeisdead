"use client";
// Design: Theme, then Customize (Wallpaper, Buttons, Text, Colors), Stickers and Footer. Sub-panels live behind #hashes like Linktree's.
import { useEffect, useState } from "react";
import { BUTTON_STYLES, PATTERNS, SHADOWS, WALLPAPERS, newId, type Design } from "@/lib/model";
import { THEMES, THEME_IDS, applyTheme, type ThemeId } from "@/lib/themes";
import { STICKER_PACKS, STICKER_EMOJI } from "@/lib/stickers";
import { fontStack, googleFontsHref } from "@/lib/fonts";
import { wallpaperCss, buttonCss } from "@/components/page/PageView";
import { I } from "@/components/icons";
import { useAdmin, readImage } from "@/components/admin/AdminProvider";
import { Btn, Choice, ColorField, Field, NavRow, PanelHead, Row, Switch } from "@/components/admin/ui";
import { FontPicker } from "@/components/admin/HeaderPanel";
import { track, EVENTS } from "@/lib/analytics";


type Sub = "" | "theme" | "wallpaper" | "buttons" | "text" | "colors" | "stickers" | "footer";
const SUBS: Sub[] = ["theme", "wallpaper", "buttons", "text", "colors", "stickers", "footer"];
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

function Swatch({ d }: { d: Design }) {
  return <span className="ad-theme__sw" style={{ ...wallpaperCss(d), fontFamily: fontStack(d.font), color: d.titleColor }}><b>Aa</b><i style={{ ...buttonCss(d), borderRadius: d.button.radius === 3 ? 999 : d.button.radius * 6, color: undefined }} /></span>;
}
export function DesignPanel() {
  const { page, edit } = useAdmin(); const d = page.design;
  const [sub, setSub] = useState<Sub>("");
  useEffect(() => { const read = () => { const h = location.hash.slice(1) as Sub; setSub(SUBS.includes(h) ? h : ""); }; read(); addEventListener("hashchange", read); return () => removeEventListener("hashchange", read); }, []);
  const go = (s: Sub) => { history.pushState(null, "", s ? "#" + s : location.pathname); setSub(s); };
  const setD = (patch: Partial<Design>, custom = true) => edit(p => ({ ...p, design: { ...p.design, ...patch, ...(custom ? { theme: "custom" as const } : {}) } }));
  const setW = (patch: Partial<Design["wallpaper"]>) => setD({ wallpaper: { ...d.wallpaper, ...patch } });
  const setB = (patch: Partial<Design["button"]>) => setD({ button: { ...d.button, ...patch } });
  const [fontOpen, setFontOpen] = useState(false); const [stickerQ, setStickerQ] = useState("");
  const themeName = d.theme === "custom" ? "Custom" : THEMES[d.theme as ThemeId]?.name;
  const fonts = googleFontsHref(THEME_IDS.map(t => THEMES[t].d.font), "Aa");

  if (sub === "theme") return <>
    <PanelHead title="Theme" back={() => go("")} right={<Btn small kind="ghost" icon="dice" onClick={() => { const t = THEME_IDS[Math.floor(Math.random() * THEME_IDS.length)]!; track(EVENTS.link_theme_applied, { theme: t, source: "shuffle" }); edit(p => ({ ...p, design: applyTheme(p.design, t) })); }}>Shuffle</Btn>} />
    {fonts && <link rel="stylesheet" href={fonts} />}
    <div className="ad-themes">
      <button type="button" className={"ad-theme" + (d.theme === "custom" ? " on" : "")} onClick={() => go("wallpaper")}><span className="ad-theme__sw" style={{ display: "grid", placeItems: "center", background: "#F1F1EE" }}><I n="design" s={22} /></span>Custom</button>
      {THEME_IDS.map(t => { const td = applyTheme(d, t); return <button key={t} type="button" aria-pressed={d.theme === t} className={"ad-theme" + (d.theme === t ? " on" : "")} onClick={() => { track(EVENTS.link_theme_applied, { theme: t, source: "picker" }); edit(p => ({ ...p, design: applyTheme(p.design, t) })); }}><Swatch d={td} />{THEMES[t].name}</button>; })}
    </div>
    <p className="ad-help" style={{ marginTop: 16 }}>Pick a theme, then tweak anything under Customize. Changes make it your own custom theme.</p>
  </>;

  if (sub === "wallpaper") return <>
    <PanelHead title="Wallpaper" back={() => go("")} />
    <h3 className="ad-sec">Wallpaper style</h3>
    <Choice label="Wallpaper style" options={WALLPAPERS} value={d.wallpaper.style} onChange={v => setW({ style: v })} cols={6} render={v => <><span style={{ width: 44, height: 32, borderRadius: 8, display: "block", ...wallpaperCss({ ...d, wallpaper: { ...d.wallpaper, style: v === "image" || v === "video" ? "fill" : v } }) }} />{cap(v)}</>} />
    <hr className="ad-hr" />
    <ColorField label={d.wallpaper.style === "fill" ? "Background color" : "Color 1"} value={d.wallpaper.color} onChange={v => setW({ color: v })} />
    {["gradient", "pattern", "blur"].includes(d.wallpaper.style) && <ColorField label="Color 2" value={d.wallpaper.color2} onChange={v => setW({ color2: v })} />}
    {d.wallpaper.style === "gradient" && <Row label="Direction"><Choice label="Gradient direction" options={["down", "up", "radial"] as const} value={d.wallpaper.dir} onChange={v => setW({ dir: v })} render={v => cap(v)} /></Row>}
    {d.wallpaper.style === "pattern" && <><h3 className="ad-sec">Pattern</h3><Choice label="Pattern" options={PATTERNS} value={d.wallpaper.pattern as "dots"} onChange={v => setW({ pattern: v })} cols={6} render={v => <><span style={{ width: 44, height: 32, borderRadius: 8, display: "block", ...wallpaperCss({ ...d, wallpaper: { ...d.wallpaper, style: "pattern", pattern: v } }) }} />{cap(v)}</>} /></>}
    {d.wallpaper.style === "blur" && <Row label="Blur"><input type="range" min={4} max={40} value={d.wallpaper.blur || 18} onChange={e => setW({ blur: Number(e.target.value) })} aria-label="Blur amount" /></Row>}
    {d.wallpaper.style === "image" && <Row label="Image" sub="Resized to fit; portrait photos work best"><label className="ad-upload" aria-label="Upload wallpaper">{d.wallpaper.image ? <img src={d.wallpaper.image} alt="" /> : <I n="image" s={24} />}<em><I n="plus" s={14} /></em><input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) setW({ image: await readImage(f, 1200, { quality: 0.75 }) }); }} /></label></Row>}
    {d.wallpaper.style === "video" && <><Field label="Video URL (.mp4)" value={d.wallpaper.video} placeholder="https://example.com/loop.mp4" onChange={v => setW({ video: v })} /><p className="ad-help">Paste a direct link to an MP4 you host anywhere. It plays muted on a loop.</p></>}
  </>;

  if (sub === "buttons") return <>
    <PanelHead title="Buttons" back={() => go("")} />
    <h3 className="ad-sec">Button style</h3>
    <Choice label="Button style" options={BUTTON_STYLES} value={d.button.style} onChange={v => setB({ style: v })} cols={3} render={v => <><span style={{ width: 96, height: 36, display: "grid", placeItems: "center", borderRadius: 10, background: "#C9CCD0" }}><i style={{ display: "block", width: 64, height: 18, borderRadius: 99, ...(v === "solid" ? { background: "#fff" } : v === "glass" ? { background: "rgba(255,255,255,.45)", border: "1px solid rgba(255,255,255,.7)" } : { border: "2px solid #fff" }) }} /></span>{cap(v)}</>} />
    <Row label="Corner roundness"><Choice label="Corner roundness" options={[0, 1, 2, 3] as const} value={d.button.radius} onChange={v => setB({ radius: v })} cols={4} render={v => <span style={{ width: 22, height: 22, borderTop: "2px solid", borderLeft: "2px solid", borderTopLeftRadius: [0, 4, 9, 22][v] }} />} /></Row>
    <Row label="Button shadow"><Choice label="Button shadow" options={SHADOWS} value={d.button.shadow} onChange={v => setB({ shadow: v })} cols={4} render={v => cap(v)} /></Row>
    <ColorField label="Button color" value={d.button.color} onChange={v => setB({ color: v })} />
    <ColorField label="Button text color" value={d.button.text} onChange={v => setB({ text: v })} />
  </>;

  if (sub === "text") return <>
    <PanelHead title="Text" back={() => go("")} />
    <Row label="Page font"><button type="button" className="ad-input" style={{ width: 240, textAlign: "left", fontFamily: fontStack(d.font), display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setFontOpen(true)}>{d.font}<I n="down" s={16} /></button></Row>
    <ColorField label="Page text color" value={d.textColor} onChange={v => setD({ textColor: v })} />
    <Row label="Alternative title font" sub={d.altTitleFont ? d.titleFont : "Matches page font by default"}><Switch on={d.altTitleFont} label="Alternative title font" onChange={v => setD({ altTitleFont: v })} /></Row>
    <ColorField label="Title color" value={d.titleColor} onChange={v => setD({ titleColor: v })} />
    {fontOpen && <FontPicker title="Page font" value={d.font} onPick={f => setD({ font: f })} onClose={() => setFontOpen(false)} />}
  </>;

  if (sub === "colors") return <>
    <PanelHead title="Colors" back={() => go("")} />
    <ColorField label="Background" value={d.wallpaper.color} onChange={v => setW({ color: v })} />
    <ColorField label="Buttons" value={d.button.color} onChange={v => setB({ color: v })} />
    <ColorField label="Button text" value={d.button.text} onChange={v => setB({ text: v })} />
    <ColorField label="Page text" value={d.textColor} onChange={v => setD({ textColor: v })} />
    <ColorField label="Title" value={d.titleColor} onChange={v => setD({ titleColor: v })} />
  </>;

  if (sub === "stickers") { const packs = STICKER_PACKS.map(p => ({ ...p, items: p.items.filter(i => !stickerQ || i.n.includes(stickerQ.toLowerCase()) || p.name.toLowerCase().includes(stickerQ.toLowerCase())) })).filter(p => p.items.length);
    const add = (k: string) => setD({ stickers: [...d.stickers, { id: newId(), kind: k, x: 15 + Math.random() * 70, y: 8 + Math.random() * 30, s: 1, r: Math.round(Math.random() * 30 - 15) }].slice(-24) }, false);
    return <>
      <PanelHead title="Stickers" back={() => go("")} right={d.stickers.length > 0 && <Btn small kind="ghost" onClick={() => setD({ stickers: [] }, false)}>Clear all</Btn>} />
      <label className="ad-add__search" style={{ height: 44 }}><I n="search" s={18} /><input placeholder="Search stickers" value={stickerQ} onChange={e => setStickerQ(e.target.value)} aria-label="Search stickers" /></label>
      {d.stickers.length > 0 && <><h3 className="ad-sec">On your page</h3><div className="ad-list2">{d.stickers.map(s => <div key={s.id} className="ad-card" style={{ minHeight: 56, padding: "8px 12px" }}><span style={{ fontSize: 28 }}>{STICKER_EMOJI[s.kind]}</span>
        <label className="ad-row__l" style={{ flex: 1 }}><small>Left / right</small><input type="range" min={0} max={100} value={s.x} onChange={e => setD({ stickers: d.stickers.map(x => x.id === s.id ? { ...x, x: Number(e.target.value) } : x) }, false)} /></label>
        <label className="ad-row__l" style={{ flex: 1 }}><small>Up / down</small><input type="range" min={0} max={100} value={s.y} onChange={e => setD({ stickers: d.stickers.map(x => x.id === s.id ? { ...x, y: Number(e.target.value) } : x) }, false)} /></label>
        <label className="ad-row__l" style={{ flex: 1 }}><small>Size</small><input type="range" min={0.4} max={3} step={0.1} value={s.s} onChange={e => setD({ stickers: d.stickers.map(x => x.id === s.id ? { ...x, s: Number(e.target.value) } : x) }, false)} /></label>
        <button type="button" className="ad-ib" aria-label="Remove sticker" onClick={() => setD({ stickers: d.stickers.filter(x => x.id !== s.id) }, false)}><I n="x" s={14} /></button></div>)}</div></>}
      {packs.map(p => <div key={p.id}><h3 className="ad-sec">{p.name}</h3><p className="ad-sub">{p.blurb}</p><div className="ad-stickers">{p.items.map(i => <button key={i.k} type="button" aria-label={`Add ${i.n} sticker`} onClick={() => add(i.k)}>{i.e}</button>)}</div></div>)}
    </>; }

  if (sub === "footer") return <>
    <PanelHead title="Footer" back={() => go("")} />
    <Row label="Hide LinktreeIsDead footer" sub="Removes the 'Join on LinktreeIsDead' button. Free here."><Switch on={d.hideFooter} label="Hide footer" onChange={v => setD({ hideFooter: v }, false)} /></Row>
  </>;

  return <>
    <PanelHead title="Design" />
    <NavRow label="Theme" value={themeName} onClick={() => go("theme")} swatch={<span className="ad-navrow__ic" style={{ ...wallpaperCss(d), fontFamily: fontStack(d.font), color: d.titleColor, fontSize: 13, fontWeight: 600 }}>Aa</span>} />
    <h3 className="ad-sec">Customize</h3>
    <NavRow label="Wallpaper" value={cap(d.wallpaper.style)} onClick={() => go("wallpaper")} swatch={<span className="ad-navrow__ic" style={wallpaperCss(d)} />} />
    <NavRow label="Buttons" value={cap(d.button.style)} onClick={() => go("buttons")} swatch={<span className="ad-navrow__ic" style={{ background: "#EEE" }}><i style={{ width: 24, height: 24, display: "block", ...buttonCss(d) }} /></span>} />
    <NavRow label="Text" value={d.font} onClick={() => go("text")} swatch={<span className="ad-navrow__ic" style={{ fontFamily: fontStack(d.font), fontWeight: 600 }}>Aa</span>} />
    <NavRow label="Colors" onClick={() => go("colors")} swatch={<span className="ad-navrow__ic" style={{ background: `linear-gradient(90deg, ${d.wallpaper.color} 50%, ${d.button.color} 50%)` }} />} />
    <NavRow label="Stickers" value={d.stickers.length ? `${d.stickers.length} on page` : "Decorate your page"} onClick={() => go("stickers")} icon={<I n="sticker" s={20} />} />
    <NavRow label="Footer" value={d.hideFooter ? "Hidden" : "Shown"} onClick={() => go("footer")} icon={<I n="foot" s={20} />} />
  </>;
}
