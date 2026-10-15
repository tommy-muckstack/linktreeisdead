// Pure data model + validation for a link-in-bio page. Shared by the editor (client), the public page and the API (server).
export const THEME_IDS = ["lime", "midnight", "sunset", "sky", "paper", "forest", "candy", "mono"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type Theme = { id: ThemeId; name: string; bg: string; text: string; muted: string; btnBg: string; btnText: string; btnBorder: string; avatarBg: string; avatarText: string };
export const THEMES: Record<ThemeId, Theme> = {
  lime: { id: "lime", name: "Lime", bg: "linear-gradient(180deg,#D2E823 0%,#E4F27A 100%)", text: "#254F1A", muted: "#3F6B2F", btnBg: "#254F1A", btnText: "#FFFFFF", btnBorder: "#254F1A", avatarBg: "#254F1A", avatarText: "#D2E823" },
  midnight: { id: "midnight", name: "Midnight", bg: "linear-gradient(180deg,#0E1020 0%,#1D2147 100%)", text: "#F2F3FF", muted: "#A9ADD6", btnBg: "#7C83FF", btnText: "#0E1020", btnBorder: "#7C83FF", avatarBg: "#7C83FF", avatarText: "#0E1020" },
  sunset: { id: "sunset", name: "Sunset", bg: "linear-gradient(160deg,#FF9A5A 0%,#FF5E7E 55%,#8F4BFF 100%)", text: "#FFFFFF", muted: "#FFE5EC", btnBg: "#FFFFFF", btnText: "#B0224A", btnBorder: "#FFFFFF", avatarBg: "#FFFFFF", avatarText: "#B0224A" },
  sky: { id: "sky", name: "Sky", bg: "linear-gradient(180deg,#CFE9FF 0%,#EAF5FF 100%)", text: "#0D2B4D", muted: "#3D6188", btnBg: "#1D6FE0", btnText: "#FFFFFF", btnBorder: "#1D6FE0", avatarBg: "#1D6FE0", avatarText: "#FFFFFF" },
  paper: { id: "paper", name: "Paper", bg: "#F5F1E8", text: "#2B2620", muted: "#6D6558", btnBg: "#2B2620", btnText: "#F5F1E8", btnBorder: "#2B2620", avatarBg: "#2B2620", avatarText: "#F5F1E8" },
  forest: { id: "forest", name: "Forest", bg: "linear-gradient(180deg,#123524 0%,#1E5239 100%)", text: "#E6F5EC", muted: "#9CC7AE", btnBg: "#D2E823", btnText: "#123524", btnBorder: "#D2E823", avatarBg: "#D2E823", avatarText: "#123524" },
  candy: { id: "candy", name: "Candy", bg: "linear-gradient(160deg,#FFD6F1 0%,#E9C0E9 50%,#C9B6FF 100%)", text: "#4A1456", muted: "#7B4A87", btnBg: "#4A1456", btnText: "#FFFFFF", btnBorder: "#4A1456", avatarBg: "#4A1456", avatarText: "#FFD6F1" },
  mono: { id: "mono", name: "Mono", bg: "#FFFFFF", text: "#000000", muted: "#555555", btnBg: "#000000", btnText: "#FFFFFF", btnBorder: "#000000", avatarBg: "#000000", avatarText: "#FFFFFF" },
};
export const BUTTON_STYLES = ["fill", "outline", "soft"] as const; export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export const SHAPES = ["pill", "round", "square"] as const; export type Shape = (typeof SHAPES)[number];
export const SOCIAL_KINDS = ["instagram", "x", "youtube", "tiktok", "github", "linkedin", "email", "website"] as const; export type SocialKind = (typeof SOCIAL_KINDS)[number];
export const SOCIAL_LABEL: Record<SocialKind, string> = { instagram: "IG", x: "X", youtube: "YT", tiktok: "TT", github: "GH", linkedin: "in", email: "@", website: "www" };

export type LinkItem = { id: string; kind: "link" | "header"; title: string; url: string; enabled: boolean; clicks: number };
export type Social = { kind: SocialKind; url: string };
export type Day = { v: number; c: number };
export type Page = {
  handle: string; ownerId: string; title: string; bio: string; avatar: string; theme: ThemeId; buttonStyle: ButtonStyle; shape: Shape;
  links: LinkItem[]; socials: Social[]; views: number; daily: Record<string, Day>; createdAt: string;
};
export const LIMITS = { links: 50, socials: 8, title: 80, bio: 160, linkTitle: 80, url: 2000, avatar: 90_000 };
const RESERVED = new Set(["app", "api", "login", "u", "go", "admin", "www", "help", "pricing", "demo-page"]);

export function validateHandle(h: string): string | null {
  if (!/^[a-z0-9_.]{3,30}$/.test(h)) return "Use 3-30 lowercase letters, numbers, dots or underscores.";
  if (/^[._]|[._]$/.test(h)) return "A handle can't start or end with a dot or underscore.";
  if (RESERVED.has(h)) return "That handle is reserved.";
  return null;
}
export const slugifyHandle = (s: string) => { const x = s.toLowerCase().replace(/[^a-z0-9_.]+/g, "").replace(/^[._]+|[._]+$/g, "").slice(0, 30); return x.length >= 3 ? x : (x + "page").slice(0, 30); };

/** Normalise a user-entered URL. Only http(s) and mailto are allowed; bare domains get https://. Returns null when unusable. */
export function normalizeUrl(raw: string): string | null {
  let s = raw.trim(); if (!s || s.length > LIMITS.url) return null;
  if (/^mailto:/i.test(s)) return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(s) ? s : null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "mailto:" + s;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = "https://" + s;
  try { const u = new URL(s); if (u.protocol !== "http:" && u.protocol !== "https:") return null; if (!u.hostname.includes(".")) return null; return u.toString(); } catch { return null; }
}
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const oneOf = <T extends string>(v: unknown, all: readonly T[], d: T): T => (all.includes(v as T) ? (v as T) : d);
const newId = () => Math.random().toString(36).slice(2, 10);

/** Clean untrusted editor input into a Page, keeping server-owned counters from `prev`. */
export function sanitizePage(input: any, prev: Page): Page {
  const old = new Map(prev.links.map(l => [l.id, l]));
  const links: LinkItem[] = (Array.isArray(input?.links) ? input.links : []).slice(0, LIMITS.links).map((l: any) => {
    const kind = l?.kind === "header" ? "header" : "link"; const id = /^[a-z0-9]{4,12}$/.test(l?.id ?? "") ? l.id : newId();
    const url = kind === "header" ? "" : (typeof l?.url === "string" && l.url.trim() === "" ? "" : normalizeUrl(String(l?.url ?? "")) ?? "");
    return { id, kind, title: clip(l?.title, LIMITS.linkTitle), url, enabled: l?.enabled !== false, clicks: old.get(id)?.clicks ?? 0 } as LinkItem;
  });
  const seen = new Set<string>(); const uniq = links.filter(l => (seen.has(l.id) ? false : (seen.add(l.id), true)));
  const socials: Social[] = (Array.isArray(input?.socials) ? input.socials : []).slice(0, LIMITS.socials).flatMap((s: any) => { const u = normalizeUrl(String(s?.url ?? "")); return u && SOCIAL_KINDS.includes(s?.kind) ? [{ kind: s.kind as SocialKind, url: u }] : []; });
  const avatar = typeof input?.avatar === "string" && (input.avatar === "" || (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(input.avatar) && input.avatar.length <= LIMITS.avatar)) ? input.avatar : prev.avatar;
  return { ...prev, title: clip(input?.title, LIMITS.title) || prev.title, bio: clip(input?.bio, LIMITS.bio), avatar, theme: oneOf(input?.theme, THEME_IDS, prev.theme),
    buttonStyle: oneOf(input?.buttonStyle, BUTTON_STYLES, prev.buttonStyle), shape: oneOf(input?.shape, SHAPES, prev.shape), links: uniq, socials };
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10);
export function bump(p: Page, what: "v" | "c", day = today()): void { const d = (p.daily[day] ??= { v: 0, c: 0 }); d[what]++; }

export function stats(p: Page, days = 14, now = new Date()) {
  const series: { day: string; v: number; c: number }[] = [];
  for (let i = days - 1; i >= 0; i--) { const d = today(new Date(now.getTime() - i * 864e5)); series.push({ day: d, v: p.daily[d]?.v ?? 0, c: p.daily[d]?.c ?? 0 }); }
  const clicks = p.links.reduce((a, l) => a + l.clicks, 0);
  return { views: p.views, clicks, ctr: p.views ? Math.round((clicks / p.views) * 1000) / 10 : 0, series, top: [...p.links].filter(l => l.kind === "link").sort((a, b) => b.clicks - a.clicks) };
}

export function newPage(ownerId: string, handle: string, title: string): Page {
  return { handle, ownerId, title, bio: "", avatar: "", theme: "lime", buttonStyle: "fill", shape: "pill", links: [], socials: [], views: 0, daily: {}, createdAt: new Date().toISOString() };
}
export function demoPage(): Page {
  const p = newPage("demo", "demo", "Ada Lovelace Studio"); p.bio = "Maker of tiny tools, weekly notes and occasional podcasts. Say hi below.";
  p.links = [
    { id: "hdr00001", kind: "header", title: "Start here", url: "", enabled: true, clicks: 0 },
    { id: "lnk00001", kind: "link", title: "Read the weekly newsletter", url: "https://example.com/newsletter", enabled: true, clicks: 128 },
    { id: "lnk00002", kind: "link", title: "Listen to the podcast", url: "https://example.com/podcast", enabled: true, clicks: 74 },
    { id: "lnk00003", kind: "link", title: "Book a 20-minute chat", url: "https://example.com/book", enabled: true, clicks: 41 },
    { id: "hdr00002", kind: "header", title: "My projects", url: "", enabled: true, clicks: 0 },
    { id: "lnk00004", kind: "link", title: "Open-source toolkit on GitHub", url: "https://example.com/github", enabled: true, clicks: 63 },
    { id: "lnk00005", kind: "link", title: "Spring workshop (sold out)", url: "https://example.com/workshop", enabled: false, clicks: 9 },
  ];
  p.socials = [{ kind: "github", url: "https://example.com/gh" }, { kind: "x", url: "https://example.com/x" }, { kind: "email", url: "mailto:ada@example.com" }];
  p.views = 612; const now = Date.now();
  [24, 31, 28, 40, 52, 47, 60, 38, 55, 66, 49, 71, 58, 42].forEach((v, i) => { p.daily[today(new Date(now - (13 - i) * 864e5))] = { v, c: Math.round(v * 0.42) }; });
  return p;
}
