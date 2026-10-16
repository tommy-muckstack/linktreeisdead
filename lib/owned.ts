// Per-owner documents (keyed by user id, so a guest's data moves to their account via adoptGuestDocs):
// planner/<uid> (Social planner posts) and shortidx/<uid> (their short-link codes). Short links themselves live at short/<code>.
import { getDoc, putDoc, delDoc } from "@/lib/store";
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
export async function listShorts(uid: string): Promise<Short[]> { const idx = (await getDoc<{ codes: string[] }>("shortidx", uid))?.codes ?? []; const out: Short[] = []; for (const c of idx) { const s = await getDoc<Short>("short", c); if (s && s.owner === uid) out.push(s); } return out; }
export async function createShort(uid: string, url: string, code?: string, title?: string): Promise<{ short?: Short; error?: string }> {
  const u = normalizeUrl(url); if (!u) return { error: "Enter a valid link." };
  let c = code?.trim() || ""; if (c && !CODE.test(c)) return { error: "Use 3-32 letters, numbers, dashes or underscores." };
  if (c && (await getDoc("short", c))) return { error: "That back-half is taken." };
  if (!c) { do c = newId().slice(0, 6); while (await getDoc("short", c)); }
  const s: Short = { code: c, url: u, owner: uid, title: (title ?? "").slice(0, 120), clicks: 0, daily: {}, createdAt: new Date().toISOString() };
  await putDoc("short", c, s); await locked("shortidx" + uid, async () => { const idx = (await getDoc<{ codes: string[] }>("shortidx", uid))?.codes ?? []; await putDoc("shortidx", uid, { codes: [c, ...idx].slice(0, 1000) }); });
  return { short: s };
}
export async function deleteShort(uid: string, code: string) { const s = await getDoc<Short>("short", code); if (!s || s.owner !== uid) return false; await delDoc("short", code); await locked("shortidx" + uid, async () => { const idx = (await getDoc<{ codes: string[] }>("shortidx", uid))?.codes ?? []; await putDoc("shortidx", uid, { codes: idx.filter(x => x !== code) }); }); return true; }
export const hitShort = (code: string) => locked("short" + code, async () => { if (!CODE.test(code)) return null; const s = await getDoc<Short>("short", code); if (!s) return null; s.clicks++; s.daily[today()] = (s.daily[today()] ?? 0) + 1; await putDoc("short", code, s); return s.url; });
