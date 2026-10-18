// Per-owner documents (keyed by user id, so a guest's data moves to their account via adoptGuestDocs):
// planner/<uid> (Social planner posts) and shortidx/<uid> (their short-link codes). Short links themselves live at short/<code>.
import { getDoc, putDoc, delDoc, createDoc } from "@/lib/store";
import { locked } from "@/lib/lock";
import { newId, normalizeUrl, today, STORED } from "@/lib/model";

export type Post = { id: string; date: string; platforms: string[]; caption: string; image: string; link: string; status: "idea" | "scheduled" | "posted" };
export const getPlanner = async (uid: string) => (await getDoc<{ posts: Post[] }>("planner", uid))?.posts ?? [];
export function cleanPosts(v: unknown): Post[] {
  return (Array.isArray(v) ? v : []).slice(0, 500).map((p: any) => ({ id: /^[a-z0-9]{4,12}$/.test(p?.id ?? "") ? p.id : newId(), date: typeof p?.date === "string" && !Number.isNaN(Date.parse(p.date)) ? new Date(p.date).toISOString() : "", platforms: (Array.isArray(p?.platforms) ? p.platforms : []).filter((x: unknown) => typeof x === "string").slice(0, 8), caption: typeof p?.caption === "string" ? p.caption.slice(0, 2200) : "", image: typeof p?.image === "string" && (STORED.test(p.image) || (/^data:image\/(jpeg|png|webp);base64,/.test(p.image) && p.image.length < 1_500_000)) ? p.image : "", link: normalizeUrl(p?.link ?? "") ?? "", status: ["idea", "scheduled", "posted"].includes(p?.status) ? p.status : "idea" }));
}
export const savePlanner = (uid: string, posts: Post[]) => putDoc("planner", uid, { posts });

export type Short = { code: string; url: string; owner: string; title: string; clicks: number; daily: Record<string, number>; createdAt: string };
const CODE = /^[A-Za-z0-9_-]{3,32}$/;
const getIdx = async (uid: string) => (await getDoc<{ codes: string[] }>("shortidx", uid))?.codes ?? [];
/** shortidx/<uid> is the source of truth for who owns a code (it moves with adoptGuestDocs); short/<code>.owner is kept in step. */
export async function listShorts(uid: string): Promise<Short[]> { const out: Short[] = []; for (const c of await getIdx(uid)) { const s = await getDoc<Short>("short", c); if (s) out.push(s); } return out; }
/** Back-halves that make a short link look like a bank, a big brand or a sign-in page. Kept short and obvious on purpose. */
const BLOCKED = /paypal|apple|icloud|google|gmail|microsoft|outlook|amazon|facebook|instagram|netflix|coinbase|binance|bank|login|logon|signin|verif|wallet|password|passwd|secure/i;
export const blockedBackHalf = (c: string) => BLOCKED.test(c.replace(/[_-]/g, ""));
export async function createShort(uid: string, url: string, code?: string, title?: string): Promise<{ short?: Short; error?: string }> {
  const u = normalizeUrl(url); if (!u) return { error: "Enter a valid link." };
  let c = code?.trim() || ""; if (c && !CODE.test(c)) return { error: "Use 3-32 letters, numbers, dashes or underscores." };
  if (c && blockedBackHalf(c)) return { error: "Pick a back-half without brand, bank or sign-in words." };
  const s: Short = { code: c, url: u, owner: uid, title: (title ?? "").slice(0, 120), clicks: 0, daily: {}, createdAt: new Date().toISOString() };
  if (c) { if (!(await createDoc("short", c, s))) return { error: "That back-half is taken." }; }
  else { do { c = newId().slice(0, 6); s.code = c; } while (blockedBackHalf(c) || !(await createDoc("short", c, s))); }
  await locked("shortidx" + uid, async () => { await putDoc("shortidx", uid, { codes: [c, ...(await getIdx(uid))].slice(0, 1000) }); });
  return { short: s };
}
export async function deleteShort(uid: string, code: string) {
  return locked("shortidx" + uid, async () => {
    const idx = await getIdx(uid); if (!idx.includes(code)) return false;
    await delDoc("short", code); await putDoc("shortidx", uid, { codes: idx.filter(x => x !== code) }); return true;
  });
}
/** Account deletion: every code in the user's index goes, then the index. */
export async function deleteAllShorts(uid: string) { for (const c of await getIdx(uid)) await delDoc("short", c); await delDoc("shortidx", uid); }
/** After adoptGuestDocs moved shortidx/<guest> to shortidx/<account>: rewrite each short link's owner to the account. */
export async function adoptGuestShorts(guestId: string, accountId: string) {
  for (const c of await getIdx(accountId)) await locked("short" + c, async () => { const s = await getDoc<Short>("short", c); if (s && s.owner === guestId) { s.owner = accountId; await putDoc("short", c, s); } });
}
export const hitShort = (code: string) => locked("short" + code, async () => { if (!CODE.test(code)) return null; const s = await getDoc<Short>("short", code); if (!s) return null; s.clicks++; s.daily[today()] = (s.daily[today()] ?? 0) + 1; await putDoc("short", code, s); return s.url; });
