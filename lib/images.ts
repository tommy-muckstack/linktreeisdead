// Uploaded media (avatars, thumbnails, galleries, wallpapers, logos, planner images, short MP4 wallpapers).
// Each file is its own document img/<id> (the store chunks anything over ~900 KB), served at /img/<id> with an immutable
// cache. imgidx/<uid> lists an owner's files, so a guest's uploads move with adoptGuestDocs and unused files get cleaned up.
import crypto from "node:crypto";
import { getDoc, putDoc, delDoc } from "@/lib/store";
import { locked } from "@/lib/lock";
import { BP } from "@/lib/basepath";

export const IMG_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"] as const;
export const MAX_IMAGE = 3_500_000; // bytes per file (Vercel request bodies stop at 4.5 MB)
export const MAX_OWNER_BYTES = 150_000_000; export const MAX_OWNER_FILES = 400;
type Img = { owner: string; type: string; b64: string; size: number; at: number };
type Idx = { files: { id: string; size: number; at: number }[] };
export const imgUrl = (id: string) => `${BP}/img/${id}`;
export const IMG_PATH = new RegExp(`^${BP.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/img/([A-Za-z0-9_-]{16,40})$`);
export const imgIdOf = (url: string) => url.match(IMG_PATH)?.[1] ?? null;
const sniffType = (b: Buffer): string | null => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? "image/jpeg" : b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image/png" : b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" ? "image/webp" : b.subarray(0, 3).toString() === "GIF" ? "image/gif" : b.subarray(4, 8).toString() === "ftyp" ? "video/mp4" : null;

/** Store bytes for an owner. The type comes from the file's magic bytes, never the client's say-so. */
export async function putImage(owner: string, bytes: Buffer): Promise<{ url?: string; error?: string }> {
  if (!bytes.length) return { error: "Empty file." }; if (bytes.length > MAX_IMAGE) return { error: "That file is too big (3.5 MB max)." };
  const type = sniffType(bytes); if (!type) return { error: "Use a JPEG, PNG, WebP, GIF or MP4 file." };
  return locked("imgidx" + owner, async () => {
    const idx = (await getDoc<Idx>("imgidx", owner)) ?? { files: [] };
    if (idx.files.length >= MAX_OWNER_FILES || idx.files.reduce((a, f) => a + f.size, 0) + bytes.length > MAX_OWNER_BYTES) return { error: "You've hit the upload limit. Remove some images first." };
    const id = crypto.randomBytes(15).toString("base64url");
    await putDoc<Img>("img", id, { owner, type, b64: bytes.toString("base64"), size: bytes.length, at: Date.now() });
    idx.files.push({ id, size: bytes.length, at: Date.now() }); await putDoc("imgidx", owner, idx);
    return { url: imgUrl(id) };
  });
}
export async function getImage(id: string): Promise<{ type: string; bytes: Buffer } | null> {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(id)) return null; const d = await getDoc<Img>("img", id); return d ? { type: d.type, bytes: Buffer.from(d.b64, "base64") } : null;
}
/** Turn a data: URL into a stored file (used to move older pages' inline images out of the page document). */
export async function externalizeDataUrl(owner: string, v: string): Promise<string> {
  const m = v.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/); if (!m) return v;
  const r = await putImage(owner, Buffer.from(m[2]!, "base64")); return r.url ?? "";
}
/** Delete an owner's files that nothing references any more (older than `graceMs`, so in-flight uploads survive). */
export async function collectGarbage(owner: string, referenced: Set<string>, graceMs = 6 * 60 * 60 * 1000): Promise<number> {
  return locked("imgidx" + owner, async () => {
    const idx = await getDoc<Idx>("imgidx", owner); if (!idx) return 0;
    const now = Date.now(); const drop = idx.files.filter(f => !referenced.has(f.id) && now - f.at > graceMs);
    for (const f of drop) await delDoc("img", f.id);
    if (drop.length) await putDoc("imgidx", owner, { files: idx.files.filter(f => !drop.includes(f)) });
    return drop.length;
  });
}
export async function deleteAllImages(owner: string) { const idx = await getDoc<Idx>("imgidx", owner); for (const f of idx?.files ?? []) await delDoc("img", f.id); await delDoc("imgidx", owner); }
/** Every /img/<id> mentioned anywhere in a JSON-able value. */
export function referencedIds(...values: unknown[]): Set<string> {
  const out = new Set<string>(); const re = /\/img\/([A-Za-z0-9_-]{16,40})/g;
  for (const v of values) for (const m of JSON.stringify(v ?? null).matchAll(re)) out.add(m[1]!);
  return out;
}
