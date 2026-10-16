"use client";
// Enhance: a design and content check-up built from plain rules (no AI calls, no cost). Each tip can be applied in one click.
import { useRouter } from "next/navigation";
import { isComplete, type Page } from "@/lib/model";
import { applyTheme } from "@/lib/themes";
import { I } from "@/components/icons";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Btn, PanelHead } from "@/components/admin/ui";
import { track, EVENTS } from "@/lib/analytics";


const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!; };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x! + 0.05) / (y! + 0.05); };
type Tip = { id: string; icon: string; title: string; why: string; action: string; done: boolean; apply: () => void };

export function tips(page: Page, edit: (f: (p: Page) => Page) => void, go: (h: string) => void): Tip[] {
  const d = page.design; const live = page.links.filter(l => !l.archived && l.enabled); const links = live.filter(l => l.type === "link");
  const btnContrast = d.button.style === "outline" ? contrast(d.button.color, d.wallpaper.color) : contrast(d.button.text, d.button.color);
  const textContrast = contrast(d.textColor, d.wallpaper.color);
  return [
    { id: "avatar", icon: "user", title: "Add a profile photo", why: "Pages with a face or logo get noticeably more clicks than blank ones.", action: "Add photo", done: !!page.avatar, apply: () => go("/app/header") },
    { id: "bio", icon: "text", title: "Write a short bio", why: "One line about who you are and what people will find here.", action: "Write bio", done: page.bio.trim().length >= 10, apply: () => go("/app/header") },
    { id: "btn-contrast", icon: "eye", title: "Make your buttons easier to read", why: `Button text contrast is ${btnContrast.toFixed(1)}:1. Aim for at least 4.5:1.`, action: "Fix contrast", done: btnContrast >= 4.5, apply: () => edit(p => ({ ...p, design: { ...p.design, theme: "custom", button: { ...p.design.button, text: contrast("#000000", p.design.button.color) > contrast("#FFFFFF", p.design.button.color) ? "#000000" : "#FFFFFF" } } })) },
    { id: "text-contrast", icon: "type", title: "Make your page text easier to read", why: `Text contrast against your background is ${textContrast.toFixed(1)}:1.`, action: "Fix contrast", done: textContrast >= 4.5, apply: () => edit(p => ({ ...p, design: { ...p.design, theme: "custom", textColor: contrast("#000000", p.design.wallpaper.color) > contrast("#FFFFFF", p.design.wallpaper.color) ? "#000000" : "#FFFFFF", titleColor: contrast("#000000", p.design.wallpaper.color) > contrast("#FFFFFF", p.design.wallpaper.color) ? "#000000" : "#FFFFFF" } })) },
    { id: "socials", icon: "heart", title: "Add your social icons", why: "Icons under your bio keep your links list for what matters most.", action: "Add icons", done: page.socials.length > 0, apply: () => go("/app/links#socials") },
    { id: "too-many", icon: "folder", title: "Group your links", why: `You have ${links.length} links. Past 7, a collection or headers make the page easier to scan.`, action: "Add a header", done: links.length <= 7 || live.some(l => l.type === "header" || l.type === "collection"), apply: () => go("/app/links?add=1") },
    { id: "featured", icon: "star", title: "Feature your most important link", why: "A Featured layout or an animation makes one link stand out.", action: "Spotlight top link", done: live.some(l => l.layout === "featured" || l.anim !== "none") || links.length === 0, apply: () => edit(p => { const t = p.links.find(l => l.type === "link" && l.enabled && !l.archived); return t ? { ...p, links: p.links.map(l => l.id === t.id ? { ...l, anim: "wobble" } : l) } : p; }) },
    { id: "unfinished", icon: "wand", title: "Finish your unfinished blocks", why: `${live.filter(l => !isComplete(l)).length} blocks are missing a link or content, so visitors can't see them.`, action: "Review", done: live.every(isComplete), apply: () => go("/app/links") },
    { id: "theme", icon: "design", title: "Try a theme", why: "Themes set wallpaper, fonts and buttons in one go. You can still tweak after.", action: "Try Nourish", done: d.theme !== "air", apply: () => edit(p => ({ ...p, design: applyTheme(p.design, "nourish") })) },
    { id: "seo", icon: "search", title: "Set how your page looks in search and shares", why: "A meta description controls the preview text on Google and in messages.", action: "Add description", done: !!(page.settings.seo.description || page.bio), apply: () => go("/app/settings") },
  ];
}
export function EnhancePanel() {
  const { page, edit } = useAdmin(); const router = useRouter();
  const list = tips(page, edit, h => router.push(h)); const todo = list.filter(t => !t.done);
  return <>
    <PanelHead title="Enhance" />
    <div className="ad-note ad-note--info"><I n="enhance" s={20} /><div><b>Time for a fresh look?</b><br />A check-up of your page based on what works on popular link-in-bio pages. You choose which tips to apply.</div></div>
    {todo.length === 0 && <div className="ad-tip"><span className="ad-tip__ic"><I n="check" s={20} /></span><div><h3>Your page looks great</h3><p>Nothing to fix right now. Check back after you add more links.</p></div></div>}
    {list.sort((a, b) => Number(a.done) - Number(b.done)).map(t => <div key={t.id} className={"ad-tip" + (t.done ? " done" : "")}><span className="ad-tip__ic"><I n={t.done ? "check" : t.icon} s={20} /></span><div style={{ flex: 1 }}><h3>{t.title}</h3><p>{t.why}</p>{!t.done && <Btn small onClick={() => { track(EVENTS.link_enhance_applied, { tip: t.id }); t.apply(); }}>{t.action}</Btn>}</div></div>)}
  </>;
}
