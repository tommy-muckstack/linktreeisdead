// Pure data model + validation for a link-in-bio page. Shared by the editor (client), the public page and the API (server).
import { THEMES, THEME_IDS, themeDesign, type ThemeId } from "@/lib/themes";
export { THEMES, THEME_IDS, type ThemeId };

// ---- blocks (everything you can add from the Add menu) ----
export const BLOCK_TYPES = ["link", "header", "text", "collection", "video", "music", "gallery", "map", "faq", "contact", "form", "discount", "embed", "pdf", "events", "rss", "messaging"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];
export const LAYOUTS = ["classic", "featured"] as const; export type Layout = (typeof LAYOUTS)[number];
export const ANIMS = ["none", "buzz", "wobble", "pop", "swipe", "spotlight"] as const; export type Anim = (typeof ANIMS)[number];
export const LOCKS = ["none", "code", "age", "sensitive", "subscribe"] as const; export type LockKind = (typeof LOCKS)[number];
export const FORM_KINDS = ["contact", "email", "sms", "poll"] as const; export type FormKind = (typeof FORM_KINDS)[number];
export const COLLECTION_LAYOUTS = ["stack", "grid", "carousel"] as const;

export type Block = {
  id: string; type: BlockType; title: string; url: string; enabled: boolean; archived: boolean; clicks: number;
  parent: string;                         // collection id, or "" for top level
  layout: Layout; thumb: string; icon: string; // thumb: small data-URL image; icon: platform id from SOCIALS
  schedule: { start: string; end: string }; // ISO datetimes, "" = open
  lock: { kind: LockKind; code: string; age: number };
  anim: Anim; prioritize: boolean; redirect: boolean; // redirect: send every visitor straight to this link
  data: Record<string, unknown>;          // type-specific payload (see BLOCK_DATA below)
  createdAt: string;
};
/** @deprecated alias kept for older imports */ export type LinkItem = Block;

// ---- socials ----
export const SOCIAL_IDS = ["instagram", "tiktok", "youtube", "x", "facebook", "threads", "snapchat", "pinterest", "linkedin", "github", "twitch", "discord", "whatsapp", "telegram", "spotify", "applemusic", "soundcloud", "bluesky", "mastodon", "substack", "patreon", "kofi", "cashapp", "venmo", "email", "phone", "website"] as const;
export type SocialKind = (typeof SOCIAL_IDS)[number];
export const SOCIAL_KINDS = SOCIAL_IDS;
export const SOCIAL_NAMES: Record<SocialKind, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", x: "X", facebook: "Facebook", threads: "Threads", snapchat: "Snapchat", pinterest: "Pinterest", linkedin: "LinkedIn", github: "GitHub", twitch: "Twitch", discord: "Discord", whatsapp: "WhatsApp", telegram: "Telegram", spotify: "Spotify", applemusic: "Apple Music", soundcloud: "SoundCloud", bluesky: "Bluesky", mastodon: "Mastodon", substack: "Substack", patreon: "Patreon", kofi: "Ko-fi", cashapp: "Cash App", venmo: "Venmo", email: "Email", phone: "Phone", website: "Website" };
export const SOCIAL_HINT: Partial<Record<SocialKind, string>> = { email: "you@example.com", phone: "+1 555 123 4567", whatsapp: "+1 555 123 4567", website: "https://example.com" };
export type Social = { kind: SocialKind; url: string; enabled: boolean };

// ---- design ----
export const WALLPAPERS = ["fill", "gradient", "blur", "pattern", "image", "video"] as const; export type Wallpaper = (typeof WALLPAPERS)[number];
export const PATTERNS = ["dots", "grid", "lines", "waves", "zigzag", "checks"] as const;
export const BUTTON_STYLES = ["solid", "glass", "outline"] as const; export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export const SHADOWS = ["none", "soft", "strong", "hard"] as const; export type Shadow = (typeof SHADOWS)[number];
export const HEADER_LAYOUTS = ["classic", "hero", "banner", "cutout", "shape"] as const; export type HeaderLayout = (typeof HEADER_LAYOUTS)[number];
export const FONTS = ["Link Sans", "Albert Sans", "Belanosima", "Bricolage Grotesque", "DM Sans", "Epilogue", "IBM Plex Sans", "Inter", "Lato", "M PLUS Rounded 1c", "Manrope", "Oxanium", "Poppins", "Red Hat Display", "Roboto", "Rubik", "Space Grotesk", "Syne", "BioRhyme", "Bitter", "Caudex", "Corben", "Domine", "Hahmlet", "IBM Plex Serif", "Lora", "Merriweather", "Noto Serif", "Old Standard TT", "PT Serif", "Playfair Display", "Roboto Serif", "Roboto Slab", "Source Serif 4", "IBM Plex Mono", "Space Mono", "Shantell Sans"] as const;
export type Sticker = { id: string; kind: string; x: number; y: number; s: number; r: number };
export type Design = {
  theme: ThemeId | "custom";
  wallpaper: { style: Wallpaper; color: string; color2: string; dir: "down" | "up" | "radial"; pattern: string; image: string; video: string; blur: number };
  button: { style: ButtonStyle; radius: 0 | 1 | 2 | 3; shadow: Shadow; color: string; text: string };
  font: string; textColor: string; titleFont: string; altTitleFont: boolean; titleColor: string;
  header: HeaderLayout; titleStyle: "text" | "logo"; logo: string;
  stickers: Sticker[]; hideFooter: boolean;
};

export type Settings = {
  seo: { noindex: boolean; title: string; description: string };
  sensitive: boolean; lock: { enabled: boolean; code: string };
  subscribe: boolean; messages: boolean; support: string; // support banner cause id, "" = off
  pixels: { facebook: string; google: string }; utm: boolean; socialPosition: "top" | "bottom"; about: string;
  shopFirst?: never;
};

export type Page = {
  pid: string; handle: string; ownerId: string; title: string; bio: string; avatar: string;
  design: Design; settings: Settings; links: Block[]; socials: Social[];
  views: number; daily: Record<string, { v: number; c: number }>; createdAt: string;
  onboarded: boolean; goals: string[];
  card: CardCfg; kit: KitCfg;
};
export type CardCfg = { name: string; color: string; collect: boolean; saveContact: boolean; phone: string; email: string };
export type KitCfg = { public: boolean; headline: string; about: string; contact: string; rates: { label: string; price: string }[]; showStats: boolean; showLinks: boolean };
export const defaultCard = (): CardCfg => ({ name: "", color: "#D2E823", collect: true, saveContact: false, phone: "", email: "" });
export const defaultKit = (): KitCfg => ({ public: false, headline: "", about: "", contact: "", rates: [], showStats: true, showLinks: true });

export const LIMITS = { links: 200, socials: 30, title: 30, bio: 160, linkTitle: 255, url: 2000, avatar: 160_000, thumb: 60_000, image: 350_000, logo: 80_000, text: 2000, gallery: 8, stickers: 24 };
const RESERVED = new Set(["app", "api", "login", "signup", "u", "go", "s", "admin", "www", "help", "pricing", "demo-page", "media-kit", "card"]);

export function validateHandle(h: string): string | null {
  if (!/^[a-z0-9_.]{3,30}$/.test(h)) return "Use 3-30 lowercase letters, numbers, dots or underscores.";
  if (/^[._]|[._]$/.test(h)) return "A handle can't start or end with a dot or underscore.";
  if (RESERVED.has(h)) return "That handle is reserved.";
  return null;
}
export const slugifyHandle = (s: string) => { const x = s.toLowerCase().replace(/[^a-z0-9_.]+/g, "").replace(/^[._]+|[._]+$/g, "").slice(0, 30); return x.length >= 3 ? x : (x + "page").slice(0, 30); };

/** Normalise a user-entered URL. Only http(s), mailto and tel are allowed; bare domains get https://. Returns null when unusable. */
export function normalizeUrl(raw: string): string | null {
  let s = String(raw ?? "").trim(); if (!s || s.length > LIMITS.url) return null;
  if (/^mailto:/i.test(s)) return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(s) ? s : null;
  if (/^tel:/i.test(s)) return /^tel:\+?[0-9 ().-]{4,20}$/i.test(s) ? s.replace(/\s/g, "") : null;
  if (/^[^\s@/]+@[^\s@]+\.[^\s@]+$/.test(s)) return "mailto:" + s;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = "https://" + s;
  try { const u = new URL(s); if (u.protocol !== "http:" && u.protocol !== "https:") return null; if (!u.hostname.includes(".")) return null; return u.toString(); } catch { return null; }
}
/** Social icons accept a handle-ish value for email/phone/whatsapp too. */
export function normalizeSocial(kind: SocialKind, raw: string): string | null {
  const s = String(raw ?? "").trim(); if (!s) return null;
  if (kind === "email") return normalizeUrl(s.startsWith("mailto:") ? s : "mailto:" + s);
  if (kind === "phone") return normalizeUrl(s.startsWith("tel:") ? s : "tel:" + s);
  if (kind === "whatsapp" && /^\+?[0-9 ()-]{6,20}$/.test(s)) return "https://wa.me/" + s.replace(/[^0-9]/g, "");
  return normalizeUrl(s);
}

const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
const clip = (v: unknown, n: number) => str(v, n).trim();
const oneOf = <T extends string | number>(v: unknown, all: readonly T[], d: T): T => (all.includes(v as T) ? (v as T) : d);
const bool = (v: unknown, d = false) => (typeof v === "boolean" ? v : d);
const color = (v: unknown, d: string) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : d);
const iso = (v: unknown) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : "");
const img = (v: unknown, max: number, d = "") => (typeof v === "string" && (v === "" || (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= max)) ? v : d);
export const newId = () => Math.random().toString(36).slice(2, 10).padEnd(8, "0");

// ---- defaults ----
export const defaultSettings = (): Settings => ({ seo: { noindex: false, title: "", description: "" }, sensitive: false, lock: { enabled: false, code: "" }, subscribe: false, messages: false, support: "", pixels: { facebook: "", google: "" }, utm: false, socialPosition: "top", about: "" });
export const defaultDesign = (): Design => themeDesign("air");
export function newBlock(type: BlockType, patch: Partial<Block> = {}): Block {
  return { id: newId(), type, title: "", url: "", enabled: true, archived: false, clicks: 0, parent: "", layout: "classic", thumb: "", icon: "", schedule: { start: "", end: "" }, lock: { kind: "none", code: "", age: 18 }, anim: "none", prioritize: false, redirect: false, data: {}, createdAt: new Date().toISOString(), ...patch };
}

// ---- type-specific data ----
const cleanList = (v: unknown, max: number) => (Array.isArray(v) ? v.slice(0, max) : []);
function cleanData(type: BlockType, d: any): Record<string, unknown> {
  d = d && typeof d === "object" ? d : {};
  switch (type) {
    case "text": return { body: str(d.body, LIMITS.text), align: oneOf(d.align, ["left", "center"] as const, "center") };
    case "collection": return { layout: oneOf(d.layout, COLLECTION_LAYOUTS, "stack") };
    case "gallery": return { images: cleanList(d.images, LIMITS.gallery).map((x: any) => ({ src: img(x?.src, LIMITS.image), alt: clip(x?.alt, 120), url: normalizeUrl(x?.url ?? "") ?? "" })).filter((x: any) => x.src), style: oneOf(d.style, ["carousel", "grid"] as const, "carousel") };
    case "map": return { address: clip(d.address, 200), zoom: Math.min(20, Math.max(3, Number(d.zoom) || 14)) };
    case "faq": return { items: cleanList(d.items, 30).map((x: any) => ({ q: clip(x?.q, 200), a: str(x?.a, 1000) })).filter((x: any) => x.q) };
    case "contact": return { name: clip(d.name, 80), org: clip(d.org, 80), role: clip(d.role, 80), phone: clip(d.phone, 30), email: clip(d.email, 120), site: normalizeUrl(d.site ?? "") ?? "", address: clip(d.address, 200), note: str(d.note, 300) };
    case "form": return { kind: oneOf(d.kind, FORM_KINDS, "contact"), button: clip(d.button, 40) || "Submit", fields: cleanList(d.fields, 6).filter((f: unknown) => ["name", "email", "phone", "message", "company"].includes(f as string)), options: cleanList(d.options, 8).map((o: unknown) => clip(o, 80)).filter(Boolean), thanks: clip(d.thanks, 160), consent: bool(d.consent, true) };
    case "discount": return { code: clip(d.code, 40), details: str(d.details, 300), expires: iso(d.expires) };
    case "events": return { items: cleanList(d.items, 30).map((x: any) => ({ date: iso(x?.date), name: clip(x?.name, 120), venue: clip(x?.venue, 120), city: clip(x?.city, 80), url: normalizeUrl(x?.url ?? "") ?? "", soldOut: bool(x?.soldOut) })).filter((x: any) => x.name) };
    case "rss": return { count: Math.min(10, Math.max(1, Number(d.count) || 3)) };
    case "embed": case "video": case "music": case "pdf": return { height: Math.min(900, Math.max(80, Number(d.height) || 0)) || undefined, autoplay: bool(d.autoplay) };
    default: return {};
  }
}

function cleanBlock(l: any, old: Map<string, Block>): Block {
  const type = oneOf(l?.type ?? (l?.kind === "header" ? "header" : "link"), BLOCK_TYPES, "link");
  const id = /^[a-z0-9]{4,12}$/.test(l?.id ?? "") ? l.id : newId();
  const rawUrl = typeof l?.url === "string" ? l.url.trim() : "";
  const url = ["header", "text", "collection", "gallery", "faq", "contact", "form", "discount", "events", "map", "messaging"].includes(type) ? "" : rawUrl === "" ? "" : normalizeUrl(rawUrl) ?? "";
  const lock = l?.lock ?? {};
  return {
    id, type, title: clip(l?.title, LIMITS.linkTitle), url, enabled: l?.enabled !== false, archived: bool(l?.archived), clicks: old.get(id)?.clicks ?? 0,
    parent: typeof l?.parent === "string" && /^[a-z0-9]{4,12}$/.test(l.parent) ? l.parent : "",
    layout: oneOf(l?.layout, LAYOUTS, "classic"), thumb: img(l?.thumb, LIMITS.thumb), icon: oneOf(l?.icon, ["", ...SOCIAL_IDS] as const, ""),
    schedule: { start: iso(l?.schedule?.start), end: iso(l?.schedule?.end) },
    lock: { kind: oneOf(lock.kind, LOCKS, "none"), code: clip(lock.code, 32), age: oneOf(Number(lock.age), [13, 16, 18, 21, 25] as const, 18) },
    anim: oneOf(l?.anim, ANIMS, "none"), prioritize: bool(l?.prioritize), redirect: bool(l?.redirect),
    data: cleanData(type, l?.data), createdAt: iso(l?.createdAt) || old.get(id)?.createdAt || new Date().toISOString(),
  };
}

function cleanDesign(d: any, prev: Design): Design {
  d = d && typeof d === "object" ? d : {}; const w = d.wallpaper ?? {}, b = d.button ?? {};
  return {
    theme: oneOf(d.theme, [...THEME_IDS, "custom"] as const, prev.theme),
    wallpaper: { style: oneOf(w.style, WALLPAPERS, prev.wallpaper.style), color: color(w.color, prev.wallpaper.color), color2: color(w.color2, prev.wallpaper.color2), dir: oneOf(w.dir, ["down", "up", "radial"] as const, prev.wallpaper.dir), pattern: oneOf(w.pattern, PATTERNS, "dots"), image: img(w.image, LIMITS.image, prev.wallpaper.image), video: w.video === "" ? "" : normalizeUrl(w.video ?? "") ?? prev.wallpaper.video, blur: Math.min(40, Math.max(0, Number(w.blur) || 0)) },
    button: { style: oneOf(b.style, BUTTON_STYLES, prev.button.style), radius: oneOf(Number(b.radius), [0, 1, 2, 3] as const, prev.button.radius), shadow: oneOf(b.shadow, SHADOWS, prev.button.shadow), color: color(b.color, prev.button.color), text: color(b.text, prev.button.text) },
    font: oneOf(d.font, FONTS, prev.font), textColor: color(d.textColor, prev.textColor), titleFont: oneOf(d.titleFont, FONTS, prev.titleFont), altTitleFont: bool(d.altTitleFont, prev.altTitleFont), titleColor: color(d.titleColor, prev.titleColor),
    header: oneOf(d.header, HEADER_LAYOUTS, prev.header), titleStyle: oneOf(d.titleStyle, ["text", "logo"] as const, prev.titleStyle), logo: img(d.logo, LIMITS.logo, prev.logo),
    stickers: cleanList(d.stickers, LIMITS.stickers).map((s: any) => ({ id: /^[a-z0-9]{4,12}$/.test(s?.id ?? "") ? s.id : newId(), kind: clip(s?.kind, 24), x: Math.min(100, Math.max(0, Number(s?.x) || 0)), y: Math.min(100, Math.max(0, Number(s?.y) || 0)), s: Math.min(3, Math.max(0.4, Number(s?.s) || 1)), r: Math.min(180, Math.max(-180, Number(s?.r) || 0)) })).filter((s: Sticker) => s.kind),
    hideFooter: bool(d.hideFooter, prev.hideFooter),
  };
}
function cleanSettings(s: any, prev: Settings): Settings {
  s = s && typeof s === "object" ? s : {};
  return {
    seo: { noindex: bool(s.seo?.noindex, prev.seo.noindex), title: clip(s.seo?.title ?? prev.seo.title, 70), description: clip(s.seo?.description ?? prev.seo.description, 200) },
    sensitive: bool(s.sensitive, prev.sensitive), lock: { enabled: bool(s.lock?.enabled, prev.lock.enabled), code: clip(s.lock?.code ?? prev.lock.code, 32) },
    subscribe: bool(s.subscribe, prev.subscribe), messages: bool(s.messages, prev.messages), support: oneOf(s.support, ["", ...SUPPORT_CAUSES.map(c => c.id)] as const, prev.support),
    pixels: { facebook: /^[0-9]{0,20}$/.test(s.pixels?.facebook ?? "") ? s.pixels?.facebook ?? "" : prev.pixels.facebook, google: /^(G-[A-Z0-9]{4,14})?$/.test(s.pixels?.google ?? "") ? s.pixels?.google ?? "" : prev.pixels.google },
    utm: bool(s.utm, prev.utm), socialPosition: oneOf(s.socialPosition, ["top", "bottom"] as const, prev.socialPosition), about: clip(s.about ?? prev.about, 300),
  };
}
function cleanCard(c: any, prev: CardCfg): CardCfg { return { name: clip(c.name ?? prev.name, 60), color: color(c.color, prev.color), collect: bool(c.collect, prev.collect), saveContact: bool(c.saveContact, prev.saveContact), phone: clip(c.phone ?? prev.phone, 30), email: clip(c.email ?? prev.email, 120) }; }
function cleanKit(k: any, prev: KitCfg): KitCfg { return { public: bool(k.public, prev.public), headline: clip(k.headline ?? prev.headline, 80), about: str(k.about ?? prev.about, 600), contact: clip(k.contact ?? prev.contact, 120), rates: cleanList(k.rates ?? prev.rates, 10).map((r: any) => ({ label: clip(r?.label, 60), price: clip(r?.price, 30) })), showStats: bool(k.showStats, prev.showStats), showLinks: bool(k.showLinks, prev.showLinks) }; }
export const SUPPORT_CAUSES = [{ id: "climate", label: "Climate action", text: "Take action on climate change" }, { id: "mental", label: "Mental health", text: "Look after your mental health" }, { id: "vote", label: "Get out and vote", text: "Make your voice heard: vote" }, { id: "pride", label: "Pride", text: "Proud to support LGBTQ+ communities" }, { id: "kindness", label: "Be kind", text: "A little kindness goes a long way" }] as const;

/** Clean untrusted editor input into a Page, keeping server-owned fields (counters, owner, handle) from `prev`. */
export function sanitizePage(input: any, prev: Page): Page {
  const old = new Map(prev.links.map(l => [l.id, l]));
  const seen = new Set<string>();
  const links = (Array.isArray(input?.links) ? input.links : prev.links).slice(0, LIMITS.links).map((l: any) => cleanBlock(l, old)).filter((l: Block) => (seen.has(l.id) ? false : (seen.add(l.id), true)));
  const ids = new Set(links.filter((l: Block) => l.type === "collection").map((l: Block) => l.id));
  for (const l of links) if (l.parent && (!ids.has(l.parent) || l.type === "collection")) l.parent = "";
  const sseen = new Set<string>();
  const socials: Social[] = (Array.isArray(input?.socials) ? input.socials : prev.socials).slice(0, LIMITS.socials).flatMap((s: any) => {
    if (!SOCIAL_IDS.includes(s?.kind) || sseen.has(s.kind)) return []; const u = normalizeSocial(s.kind, s?.url ?? ""); if (!u) return []; sseen.add(s.kind); return [{ kind: s.kind as SocialKind, url: u, enabled: s?.enabled !== false }];
  });
  return {
    ...prev, title: input?.title === undefined ? prev.title : clip(input.title, LIMITS.title), bio: input?.bio === undefined ? prev.bio : str(input.bio, LIMITS.bio),
    avatar: input?.avatar === undefined ? prev.avatar : img(input.avatar, LIMITS.avatar, prev.avatar),
    design: input?.design ? cleanDesign(input.design, prev.design) : prev.design, settings: input?.settings ? cleanSettings(input.settings, prev.settings) : prev.settings,
    card: input?.card ? cleanCard(input.card, prev.card) : prev.card, kit: input?.kit ? cleanKit(input.kit, prev.kit) : prev.kit,
    links, socials, onboarded: bool(input?.onboarded, prev.onboarded), goals: Array.isArray(input?.goals) ? input.goals.slice(0, 6).map((g: unknown) => clip(g, 40)).filter(Boolean) : prev.goals,
  };
}

/** Upgrade a stored page from any older shape (v1 had theme/buttonStyle/shape and kind on links). Idempotent. */
export function migratePage(p: any): Page {
  if (!p) return p;
  const base = newPage(p.ownerId ?? "", p.handle ?? "", p.title ?? "");
  const design: Design = p.design ? { ...defaultDesign(), ...p.design, wallpaper: { ...defaultDesign().wallpaper, ...p.design.wallpaper }, button: { ...defaultDesign().button, ...p.design.button } } : defaultDesign();
  const links: Block[] = (p.links ?? []).map((l: any) => ({ ...newBlock(l.type ?? (l.kind === "header" ? "header" : "link")), ...l, type: l.type ?? (l.kind === "header" ? "header" : "link"), clicks: l.clicks ?? 0 }));
  for (const l of links) delete (l as any).kind;
  const socials: Social[] = (p.socials ?? []).map((s: any) => ({ enabled: true, ...s }));
  return { ...base, ...p, pid: p.pid || p.handle || newId(), design, settings: { ...defaultSettings(), ...p.settings }, links, socials, onboarded: p.onboarded ?? true, goals: p.goals ?? [], card: { ...defaultCard(), ...p.card }, kit: { ...defaultKit(), ...p.kit }, daily: p.daily ?? {}, views: p.views ?? 0 };
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10);
export function bump(p: Page, what: "v" | "c", day = today()): void { const d = (p.daily[day] ??= { v: 0, c: 0 }); d[what]++; }

/** Is this block live right now (enabled, not archived, inside its schedule window)? */
export function isLive(l: Block, now = Date.now()): boolean {
  if (!l.enabled || l.archived) return false;
  if (l.schedule.start && Date.parse(l.schedule.start) > now) return false;
  if (l.schedule.end && Date.parse(l.schedule.end) <= now) return false;
  return true;
}
/** Does the block have enough content to show on the public page? */
export function isComplete(l: Block): boolean {
  switch (l.type) {
    case "link": case "video": case "music": case "embed": case "pdf": case "rss": return !!l.url;
    case "header": return !!l.title;
    case "text": return !!(l.data.body as string);
    case "gallery": return ((l.data.images as unknown[]) ?? []).length > 0;
    case "map": return !!(l.data.address as string);
    case "faq": case "events": return ((l.data.items as unknown[]) ?? []).length > 0;
    case "contact": { const d = l.data as Record<string, string>; return !!(d.name || d.email || d.phone); }
    case "discount": return !!(l.data.code as string);
    default: return true;
  }
}

export function stats(p: Page, days = 14, now = new Date()) {
  const series: { day: string; v: number; c: number }[] = [];
  for (let i = days - 1; i >= 0; i--) { const d = today(new Date(now.getTime() - i * 864e5)); series.push({ day: d, v: p.daily[d]?.v ?? 0, c: p.daily[d]?.c ?? 0 }); }
  const clicks = p.links.reduce((a, l) => a + l.clicks, 0);
  return { views: p.views, clicks, ctr: p.views ? Math.round((clicks / p.views) * 1000) / 10 : 0, series, top: [...p.links].filter(l => l.type !== "header" && l.type !== "collection").sort((a, b) => b.clicks - a.clicks) };
}

export function newPage(ownerId: string, handle: string, title: string): Page {
  return { pid: newId(), handle, ownerId, title: title ? title.slice(0, LIMITS.title) : "@" + handle, bio: "", avatar: "", design: defaultDesign(), settings: defaultSettings(), links: [], socials: [], views: 0, daily: {}, createdAt: new Date().toISOString(), onboarded: false, goals: [], card: defaultCard(), kit: defaultKit() };
}
export function demoPage(): Page {
  const p = newPage("demo", "demo", "Studio Notes"); p.pid = "demo0001"; p.onboarded = true; p.bio = "Tiny tools, weekly notes and the occasional podcast. Say hi below.";
  p.design = themeDesign("nourish");
  p.links = [
    newBlock("header", { id: "hdr00001", title: "Start here" }),
    newBlock("link", { id: "lnk00001", title: "Read the weekly newsletter", url: "https://example.com/newsletter", clicks: 128, layout: "featured", anim: "wobble" }),
    newBlock("link", { id: "lnk00002", title: "Listen to the podcast", url: "https://example.com/podcast", clicks: 74, icon: "spotify" }),
    newBlock("link", { id: "lnk00003", title: "Book a 20-minute chat", url: "https://example.com/book", clicks: 41 }),
    newBlock("header", { id: "hdr00002", title: "Projects" }),
    newBlock("link", { id: "lnk00004", title: "Open-source toolkit", url: "https://example.com/github", clicks: 63, icon: "github" }),
    newBlock("faq", { id: "faq00001", title: "Questions", data: { items: [{ q: "Do you take commissions?", a: "Yes, a few a month. Book a chat above." }, { q: "Where are you based?", a: "Online, mostly." }] } }),
    newBlock("link", { id: "lnk00005", title: "Spring workshop (sold out)", url: "https://example.com/workshop", enabled: false, clicks: 9 }),
  ];
  p.socials = [{ kind: "instagram", url: "https://example.com/ig", enabled: true }, { kind: "youtube", url: "https://example.com/yt", enabled: true }, { kind: "email", url: "mailto:hello@example.com", enabled: true }];
  p.views = 612; const now = Date.now();
  [24, 31, 28, 40, 52, 47, 60, 38, 55, 66, 49, 71, 58, 42].forEach((v, i) => { p.daily[today(new Date(now - (13 - i) * 864e5))] = { v, c: Math.round(v * 0.42) }; });
  return p;
}
