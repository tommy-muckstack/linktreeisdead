// Server-side persistence for pages (lib/store.ts: Firestore in production, JSON files in dev/demo).
// Collections: pages/<handle> (the page), owners/<uid> → { handle } (so guest pages move with adoptGuestDocs),
// insights/<pid> (analytics), contacts/<pid>, inbox/<pid> (visitor submissions and messages).
import { getDoc, putDoc, delDoc, listDocs } from "@/lib/store";
import { Page, newPage, demoPage, sanitizePage, slugifyHandle, validateHandle, bump, migratePage, newId, today, type Block } from "@/lib/model";
const COL = "pages";
const chain = new Map<string, Promise<unknown>>();
/** Serialise read-modify-write per key so concurrent clicks never lose counts. */
export function locked<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chain.get(key) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(key, next.catch(() => {})); return next;
}
export const getPage = async (handle: string) => { const p = await getDoc<Page>(COL, handle); return p ? migratePage(p) : null; };
const putPage = (p: Page) => putDoc(COL, p.handle, p);

export async function getPageByOwner(ownerId: string): Promise<Page | null> {
  const idx = await getDoc<{ handle: string }>("owners", ownerId);
  if (idx) { const p = await getPage(idx.handle); if (p) { if (p.ownerId !== ownerId) { p.ownerId = ownerId; await putPage(p); } return p; } }
  // Pages made before the owners index existed: find by scan once, then index.
  const legacy = (await listDocs<Page>(COL)).find(p => p?.ownerId === ownerId);
  if (legacy) { await putDoc("owners", ownerId, { handle: legacy.handle }); return migratePage(legacy); }
  return null;
}
type Who = { id: string; name: string; email: string; demo: boolean; guest?: boolean };
export async function ensurePage(user: Who, wanted?: string): Promise<Page> {
  const have = await getPageByOwner(user.id); if (have) return have;
  if (user.demo) { const d = demoPage(); await putPage(d); await putDoc("owners", "demo", { handle: d.handle }); return d; }
  const seed = wanted && !validateHandle(wanted) ? wanted : user.guest ? "guest" + newId().slice(0, 5) : (user.email.split("@")[0] || user.name);
  const base = slugifyHandle(seed); let h = base, i = 1;
  while ((await getPage(h)) || validateHandle(h)) h = (base + ++i).slice(0, 30);
  const p = newPage(user.id, h, user.guest ? "" : user.name || h); await putPage(p); await putDoc("owners", user.id, { handle: h }); return p;
}
export const handleAvailable = async (h: string) => !validateHandle(h) && !(await getPage(h));

export async function savePage(ownerId: string, input: any): Promise<{ page?: Page; error?: string }> {
  const cur = await getPageByOwner(ownerId); if (!cur) return { error: "No page yet" };
  return locked(cur.handle, async () => {
    const fresh = (await getPage(cur.handle)) ?? cur; let next = sanitizePage(input, fresh);
    const wantHandle = typeof input?.handle === "string" ? input.handle.trim().toLowerCase() : fresh.handle;
    if (wantHandle !== fresh.handle) {
      const bad = validateHandle(wantHandle); if (bad) return { error: bad };
      if (await getPage(wantHandle)) return { error: "That username is taken." };
      next = { ...next, handle: wantHandle }; await putPage(next); await putDoc("owners", ownerId, { handle: wantHandle });
      await delDoc(COL, fresh.handle); return { page: next };
    }
    await putPage(next); return { page: next };
  });
}
export async function deletePage(ownerId: string): Promise<void> {
  const p = await getPageByOwner(ownerId); if (!p) return;
  await delDoc(COL, p.handle); await delDoc("owners", ownerId); for (const c of ["insights", "contacts", "inbox"]) await delDoc(c, p.pid);
}

// ---- insights ----
export type DayStats = { v: number; c: number; links: Record<string, number>; ref: Record<string, number>; geo: Record<string, number>; dev: Record<string, number>; uv: number };
export type Insights = { pid: string; days: Record<string, DayStats>; seen: Record<string, string> };
const emptyDay = (): DayStats => ({ v: 0, c: 0, links: {}, ref: {}, geo: {}, dev: {}, uv: 0 });
export type Visit = { ref: string; country: string; device: string; visitor: string };
const KEEP_DAYS = 400;
async function bumpInsights(pid: string, f: (d: DayStats, ins: Insights) => void) {
  const ins = (await getDoc<Insights>("insights", pid)) ?? { pid, days: {}, seen: {} };
  const d = (ins.days[today()] ??= emptyDay()); f(d, ins);
  const keys = Object.keys(ins.days).sort(); while (keys.length > KEEP_DAYS) delete ins.days[keys.shift()!];
  // "seen" maps a hashed visitor id → last day, used for unique visitors; trimmed to the last 2 days.
  const cut = today(new Date(Date.now() - 2 * 864e5)); for (const [k, v] of Object.entries(ins.seen)) if (v < cut) delete ins.seen[k];
  await putDoc("insights", pid, ins);
}
export const getInsights = async (pid: string) => (await getDoc<Insights>("insights", pid)) ?? { pid, days: {}, seen: {} };
const inc = (m: Record<string, number>, k: string) => { if (k) m[k] = (m[k] ?? 0) + 1; };

export const recordView = (handle: string, v?: Visit) => locked(handle, async () => {
  const p = await getPage(handle); if (!p) return; p.views++; bump(p, "v"); await putPage(p);
  if (v) await bumpInsights(p.pid, (d, ins) => { d.v++; inc(d.ref, v.ref); inc(d.geo, v.country); inc(d.dev, v.device); if (v.visitor && ins.seen[v.visitor] !== today()) { ins.seen[v.visitor] = today(); d.uv++; } });
});
/** Count a click and return where to send the visitor, honouring locks. Returns null for unknown/hidden links. */
export const recordClick = (handle: string, id: string, unlock?: { code?: string; ok?: boolean }, v?: Visit) => locked(handle, async (): Promise<string | null | { locked: true }> => {
  const p = await getPage(handle); const l = p?.links.find(x => x.id === id && x.enabled && !x.archived && x.url);
  if (!p || !l) return null;
  if (l.lock.kind === "code" && (unlock?.code ?? "") !== l.lock.code) return { locked: true };
  if ((l.lock.kind === "age" || l.lock.kind === "sensitive") && !unlock?.ok && !unlock?.code) return { locked: true };
  l.clicks++; bump(p, "c"); await putPage(p);
  await bumpInsights(p.pid, d => { d.c++; inc(d.links, l.id); if (v) inc(d.dev, ""); });
  return withUtm(l, p);
});
export function withUtm(l: Block, p: Page): string {
  if (!p.settings.utm || !/^https?:/.test(l.url)) return l.url;
  try { const u = new URL(l.url); if (!u.searchParams.has("utm_source")) { u.searchParams.set("utm_source", "linktreeisdead"); u.searchParams.set("utm_medium", "social"); u.searchParams.set("utm_campaign", l.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "link"); } return u.toString(); } catch { return l.url; }
}
export const checkCode = async (handle: string, id: string, code: string) => { const p = await getPage(handle); const l = p?.links.find(x => x.id === id); return !!l && l.lock.kind === "code" && l.lock.code === code; };

// ---- contacts + inbox ----
export type Contact = { id: string; at: string; kind: string; block: string; name: string; email: string; phone: string; message: string; company: string; choice: string };
export type ContactBook = { pid: string; items: Contact[] };
export const getContacts = async (pid: string, col: "contacts" | "inbox" = "contacts") => (await getDoc<ContactBook>(col, pid)) ?? { pid, items: [] };
export const addContact = (pid: string, c: Omit<Contact, "id" | "at">, col: "contacts" | "inbox" = "contacts") => locked(col + pid, async () => {
  const b = await getContacts(pid, col); b.items.unshift({ id: newId(), at: new Date().toISOString(), ...c }); b.items = b.items.slice(0, 5000); await putDoc(col, pid, b);
});
export const removeContact = (pid: string, id: string, col: "contacts" | "inbox" = "contacts") => locked(col + pid, async () => {
  const b = await getContacts(pid, col); b.items = b.items.filter(x => x.id !== id); await putDoc(col, pid, b);
});
