// Server-side persistence for pages (lib/store.ts: Firestore in production, JSON files in dev/demo).
// Collections: pages/<handle> (the page), owners/<uid> → { handle } (so guest pages move with adoptGuestDocs),
// insights/<pid> (analytics), contacts/<pid>, inbox/<pid> (visitor submissions and messages).
import { getDoc, putDoc, delDoc, listDocs, createDoc, readDoc } from "@/lib/store";
import { Page, newPage, demoPage, sanitizePage, slugifyHandle, validateHandle, migratePage, newId, today, isLive, type Block } from "@/lib/model";
const COL = "pages";
import { locked, lockedAll } from "@/lib/lock";
import { externalizeDataUrl, collectGarbage, referencedIds, deleteAllImages } from "@/lib/images";
export { locked };
export const getPage = async (handle: string) => { const p = await getDoc<Page>(COL, handle); return p ? migratePage(p) : null; };
const putPage = (p: Page) => putDoc(COL, p.handle, p);
const pageKey = (h: string) => "page:" + h;

/** The owner index points at a page that exists but can't be read whole right now (a torn chunked read). Retry later: never
 *  create a second page for the owner, which would orphan the first. API routes answer 503. */
export class PageUnavailable extends Error { constructor() { super("Your page is busy. Try again in a moment."); } }

// Pages made before the owners index existed (only main's early builds) are indexed once by a full scan, then never again.
let backfilled: Promise<void> | null = null;
function backfillOwners(): Promise<void> {
  return (backfilled ??= (async () => {
    if (await getDoc("meta", "owners_backfill")) return;
    for (const p of await listDocs<Page>(COL)) if (p?.ownerId && p.handle && !(await getDoc("owners", p.ownerId))) await putDoc("owners", p.ownerId, { handle: p.handle });
    await putDoc("meta", "owners_backfill", { at: new Date().toISOString() });
  })().catch(e => { backfilled = null; throw e; }));
}

export async function getPageByOwner(ownerId: string): Promise<Page | null> {
  let idx = await getDoc<{ handle: string }>("owners", ownerId);
  if (!idx) { await backfillOwners(); idx = await getDoc<{ handle: string }>("owners", ownerId); }
  for (let tries = 0; idx && tries < 3; tries++) {
    const r = await readDoc<Page>(COL, idx.handle);
    if (r.state === "torn") throw new PageUnavailable();
    if (r.state === "ok") {
      const p = migratePage(r.value); if (p.ownerId === ownerId) return p;
      // A guest page whose guest index already moved here (adoption whose owner rewrite didn't finish): finish it.
      if (p.ownerId.startsWith("g_") && !(await getDoc("owners", p.ownerId))) return (await adoptGuestPage(p.ownerId, ownerId)) ?? null;
      return null; // the index points at someone else's page: never take it over
    }
    // Missing: a rename may have moved the page between our two reads, so re-read the index before giving up.
    const again = await getDoc<{ handle: string }>("owners", ownerId); if (!again || again.handle === idx.handle) return null; idx = again;
  }
  return null;
}
/** After adoptGuestDocs moved owners/<guest> to owners/<account>: make the account the page's owner. */
export async function adoptGuestPage(guestId: string, accountId: string): Promise<Page | null> {
  const idx = await getDoc<{ handle: string }>("owners", accountId); if (!idx) return null;
  return locked(pageKey(idx.handle), async () => {
    const p = await getPage(idx.handle); if (!p) return null;
    if (p.ownerId === guestId) { p.ownerId = accountId; await putPage(p); }
    return p.ownerId === accountId ? p : null;
  });
}

type Who = { id: string; name: string; email: string; demo: boolean; guest?: boolean };
export async function ensurePage(user: Who, wanted?: string): Promise<Page> {
  const have = await getPageByOwner(user.id); if (have) return have;
  return locked("ensure:" + user.id, async () => {
    const again = await getPageByOwner(user.id); if (again) return again;
    if (user.demo) { const d = demoPage(); await putPage(d); await putDoc("owners", "demo", { handle: d.handle }); return d; }
    // The handle typed on the claim form is used only when it is valid and still free; otherwise fall back to the default seed.
    const want = (wanted ?? "").trim().toLowerCase(); const useWanted = !!want && !validateHandle(want) && !(await getPage(want));
    const seed = useWanted ? want : user.guest ? "guest" + newId().slice(0, 5) : (user.email.split("@")[0] || user.name);
    const base = slugifyHandle(seed);
    for (let i = 1; i < 60; i++) {
      const h = i === 1 ? base : (base + i).slice(0, 30); if (validateHandle(h)) continue;
      const p = newPage(user.id, h, user.guest ? "" : user.name || h);
      if (!(await createDoc(COL, h, p))) continue; // taken (possibly a moment ago by another request): try the next one
      if (await createDoc("owners", user.id, { handle: h })) return p;
      // Another instance made this owner's page at the same time: keep theirs, drop ours.
      let theirs: Page | null;
      try { theirs = await getPageByOwner(user.id); } catch (e) { await delDoc(COL, h); throw e; }
      if (theirs) { if (theirs.handle !== h) await delDoc(COL, h); return theirs; } // (same handle: the dangling index already names the page we just made)
      // The index exists but names a page that's gone or isn't this owner's (an interrupted delete, manual cleanup):
      // repair it to point at the page we just made instead of locking the owner out.
      await putDoc("owners", user.id, { handle: h }); return p;
    }
    throw new Error("Couldn't find a free handle.");
  });
}
export const handleAvailable = async (h: string) => !validateHandle(h) && !(await getPage(h));

export async function savePage(ownerId: string, input: any): Promise<{ page?: Page; error?: string }> {
  const cur = await getPageByOwner(ownerId); if (!cur) return { error: "No page yet" };
  const asked = typeof input?.handle === "string" ? input.handle.trim().toLowerCase() : cur.handle;
  // A rename holds both the old and the new handle (taken in sorted order) and claims the new one with create-if-absent.
  return lockedAll([pageKey(cur.handle), pageKey(asked)], async () => {
    const fresh = await getPage(cur.handle); if (!fresh || fresh.ownerId !== ownerId) return { error: "Your page changed. Reload and try again." };
    let next = await externalize(sanitizePage(input, fresh), ownerId);
    if (asked !== fresh.handle) {
      const bad = validateHandle(asked); if (bad) return { error: bad };
      next = { ...next, handle: asked };
      if (!(await createDoc(COL, asked, next))) return { error: "That username is taken." };
      await putDoc("owners", ownerId, { handle: asked }); await delDoc(COL, fresh.handle); return { page: next };
    }
    await putPage(next); void cleanupImages(ownerId, next); return { page: next };
  });
}
/** Move inline data: images (older pages, or editors that never uploaded) into stored files. */
async function externalize(p: Page, owner: string): Promise<Page> {
  const x = (v: string) => (v.startsWith("data:") ? externalizeDataUrl(owner, v) : Promise.resolve(v));
  p.avatar = await x(p.avatar); p.design.logo = await x(p.design.logo); p.design.wallpaper.image = await x(p.design.wallpaper.image);
  for (const l of p.links) { l.thumb = await x(l.thumb); if (l.type === "gallery") for (const im of (l.data.images as { src: string }[]) ?? []) im.src = await x(im.src); }
  return p;
}
/** Drop uploads nothing points at any more (checked against the page and the planner). */
export async function cleanupImages(owner: string, page?: Page | null) {
  try { const p = page ?? (await getPageByOwner(owner)); const planner = await getDoc("planner", owner); await collectGarbage(owner, referencedIds(p, planner)); } catch { /* best effort */ }
}
export async function deletePage(ownerId: string): Promise<void> {
  const p = await getPageByOwner(ownerId); if (!p) return;
  await delDoc("owners", ownerId); await delDoc(COL, p.handle); for (const c of ["insights", "contacts", "inbox"]) await delDoc(c, p.pid); await deleteAllImages(ownerId);
}

// ---- insights ----
// Views and clicks are counted here only (never on the page doc, which the owner edits): insights/<pid> holds per-day buckets
// and lifetime totals. Pages from before this keep their old page.views / link.clicks as a frozen base that totals add to.
export type DayStats = { v: number; c: number; links: Record<string, number>; ref: Record<string, number>; geo: Record<string, number>; dev: Record<string, number>; uv: number };
export type Totals = { v: number; c: number; links: Record<string, number> };
export type Insights = { pid: string; days: Record<string, DayStats>; seen: Record<string, string>; total?: Totals };
const emptyDay = (): DayStats => ({ v: 0, c: 0, links: {}, ref: {}, geo: {}, dev: {}, uv: 0 });
export type Visit = { ref: string; country: string; device: string; visitor: string };
const KEEP_DAYS = 400;
/** Unique-visitor hashes kept at most (about two days' worth on a busy page); past this, unique counts are approximate. */
export const MAX_SEEN = 20_000;
function bumpInsights(pid: string, f: (d: DayStats, ins: Insights, t: Totals) => void) {
  return locked("insights:" + pid, async () => {
    const ins = (await getDoc<Insights>("insights", pid)) ?? { pid, days: {}, seen: {} };
    const d = (ins.days[today()] ??= emptyDay()); const t = (ins.total ??= { v: 0, c: 0, links: {} }); f(d, ins, t);
    const keys = Object.keys(ins.days).sort(); while (keys.length > KEEP_DAYS) delete ins.days[keys.shift()!];
    // "seen" maps a hashed visitor id → last day, used for unique visitors; trimmed to the last 2 days and capped.
    const cut = today(new Date(Date.now() - 2 * 864e5)); for (const [k, v] of Object.entries(ins.seen)) if (v < cut) delete ins.seen[k];
    const seen = Object.entries(ins.seen); if (seen.length > MAX_SEEN) ins.seen = Object.fromEntries(seen.sort((x, y) => (x[1] < y[1] ? 1 : -1)).slice(0, MAX_SEEN));
    await putDoc("insights", pid, ins);
  });
}
export const getInsights = async (pid: string): Promise<Insights> => (await getDoc<Insights>("insights", pid)) ?? { pid, days: {}, seen: {} };
const inc = (m: Record<string, number>, k: string) => { if (k) m[k] = (m[k] ?? 0) + 1; };
/** The page with lifetime counters filled in from insights (legacy page-doc counters + insights totals). For the owner's UI only. */
export async function withCounts(p: Page, ins?: Insights): Promise<Page> {
  const t = (ins ?? (await getInsights(p.pid))).total;
  if (!t) return p;
  return { ...p, views: p.views + t.v, links: p.links.map(l => ({ ...l, clicks: l.clicks + (t.links[l.id] ?? 0) })) };
}

export async function recordView(handle: string, v?: Visit) {
  const p = await getPage(handle); if (!p || !v) return; // bots and link previews (no Visit) aren't counted
  await bumpInsights(p.pid, (d, ins, t) => { d.v++; t.v++; inc(d.ref, v.ref); inc(d.geo, v.country); inc(d.dev, v.device); if (v.visitor && ins.seen[v.visitor] !== today()) { if (!(v.visitor in ins.seen) && Object.keys(ins.seen).length >= MAX_SEEN) return; ins.seen[v.visitor] = today(); d.uv++; } });
}
/** Count a click and return where to send the visitor, honouring locks. Returns null for unknown, hidden or not-yet-live links. */
export async function recordClick(handle: string, id: string, unlock?: { code?: string; ok?: boolean }, v?: Visit, pageLocked?: (p: Page) => boolean): Promise<string | null | { locked: true }> {
  const p = await getPage(handle); const l = p?.links.find(x => x.id === id && isLive(x) && x.url);
  if (!p || !l || pageLocked?.(p)) return null;
  if (l.lock.kind === "code" && (unlock?.code ?? "") !== l.lock.code) return { locked: true };
  if ((l.lock.kind === "age" || l.lock.kind === "sensitive") && !unlock?.ok && !unlock?.code) return { locked: true };
  await bumpInsights(p.pid, (d, _ins, t) => { d.c++; t.c++; inc(d.links, l.id); inc(t.links, l.id); if (v) inc(d.dev, ""); });
  return withUtm(l, p);
}
export function withUtm(l: Block, p: Page): string {
  if (!p.settings.utm || !/^https?:/.test(l.url)) return l.url;
  try { const u = new URL(l.url); if (!u.searchParams.has("utm_source")) { u.searchParams.set("utm_source", "linktreeisdead"); u.searchParams.set("utm_medium", "social"); u.searchParams.set("utm_campaign", l.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "link"); } return u.toString(); } catch { return l.url; }
}
export const checkCode = async (handle: string, id: string, code: string) => { const p = await getPage(handle); const l = p?.links.find(x => x.id === id); return !!l && l.lock.kind === "code" && l.lock.code === code; };

// ---- contacts + inbox ----
/** Newest first; the oldest drop off past this, per box. */
export const MAX_CONTACTS = 2000;
export type Contact = { id: string; at: string; kind: string; block: string; name: string; email: string; phone: string; message: string; company: string; choice: string };
export type ContactBook = { pid: string; items: Contact[] };
export const getContacts = async (pid: string, col: "contacts" | "inbox" = "contacts") => (await getDoc<ContactBook>(col, pid)) ?? { pid, items: [] };
export const addContact = (pid: string, c: Omit<Contact, "id" | "at">, col: "contacts" | "inbox" = "contacts") => locked(col + pid, async () => {
  const b = await getContacts(pid, col); b.items.unshift({ id: newId(), at: new Date().toISOString(), ...c }); b.items = b.items.slice(0, MAX_CONTACTS); await putDoc(col, pid, b);
});
export const removeContact = (pid: string, id: string, col: "contacts" | "inbox" = "contacts") => locked(col + pid, async () => {
  const b = await getContacts(pid, col); b.items = b.items.filter(x => x.id !== id); await putDoc(col, pid, b);
});
