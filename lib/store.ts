// Server-side JSON document store shared by the IsDead apps.
// Production (FIREBASE_SERVICE_ACCOUNT_JSON set): Firestore, collection "<app>__<col>", one doc per id (JSON string,
// chunked above ~900 KB because Firestore docs are capped at 1 MiB). Dev/demo (no Firebase env): files under
// $ISDEAD_DATA_DIR (default .data/). Same API either way: getDoc / putDoc / listDocs / delDoc.
import fs from "node:fs/promises";
import path from "node:path";

const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
const useFirestore = () => !!process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
const appName = () => safe((process.env["NEXT_PUBLIC_BASE_PATH"] ?? "/app").replace(/\//g, "")) || "app";
const CHUNK = 900_000;

// ---- Firestore ----
let dbP: Promise<import("firebase-admin/firestore").Firestore> | null = null;
function db() {
  if (!dbP) dbP = (async () => {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    const sa = JSON.parse(process.env["FIREBASE_SERVICE_ACCOUNT_JSON"]!);
    const app = getApps().find(a => a.name === "isdead") ?? initializeApp({ credential: cert(sa), projectId: sa.project_id }, "isdead");
    return getFirestore(app);
  })().catch(e => { dbP = null; throw e; });
  return dbP;
}
const colName = (col: string) => `${appName()}__${safe(col)}`;

type Read<T> = { state: "missing" } | { state: "torn" } | { state: "ok"; value: T };
async function fsRead<T>(col: string, id: string): Promise<Read<T>> {
  const c = (await db()).collection(colName(col)); const snap = await c.doc(safe(id)).get();
  if (!snap.exists) return { state: "missing" };
  const m = snap.data() as { d?: string; n?: number };
  let json = m.d ?? "";
  for (let i = 1; i < (m.n ?? 1); i++) json += ((await c.doc(`${safe(id)}~c${i}`).get()).data() as { d?: string } | undefined)?.d ?? "";
  try { return { state: "ok", value: JSON.parse(json) as T }; } catch { return { state: "torn" }; }
}
const fsGet = async <T>(col: string, id: string): Promise<T | null> => { const r = await fsRead<T>(col, id); return r.state === "ok" ? r.value : null; };
/** Create only if absent (Firestore create() fails when the doc exists). Returns false when it already existed. */
async function fsCreate<T>(col: string, id: string, doc: T): Promise<boolean> {
  const c = (await db()).collection(colName(col)); const json = JSON.stringify(doc); const n = Math.max(1, Math.ceil(json.length / CHUNK));
  try { await c.doc(safe(id)).create({ d: json.slice(0, CHUNK), n, main: true, updatedAt: Date.now() }); } catch (e: any) { if (e?.code === 6 || /already exists/i.test(String(e?.message))) return false; throw e; }
  for (let i = 1; i < n; i++) await c.doc(`${safe(id)}~c${i}`).set({ d: json.slice(i * CHUNK, (i + 1) * CHUNK), part: true });
  return true;
}
async function fsPut<T>(col: string, id: string, doc: T) {
  const c = (await db()).collection(colName(col)); const json = JSON.stringify(doc); const n = Math.max(1, Math.ceil(json.length / CHUNK));
  const old = (await c.doc(safe(id)).get()).data() as { n?: number } | undefined;
  for (let i = 1; i < n; i++) await c.doc(`${safe(id)}~c${i}`).set({ d: json.slice(i * CHUNK, (i + 1) * CHUNK), part: true });
  for (let i = n; i < (old?.n ?? 1); i++) await c.doc(`${safe(id)}~c${i}`).delete();
  await c.doc(safe(id)).set({ d: json.slice(0, CHUNK), n, main: true, updatedAt: Date.now() });
}
async function fsList<T>(col: string): Promise<T[]> {
  const c = (await db()).collection(colName(col)); const snaps = await c.where("main", "==", true).get(); const out: T[] = [];
  for (const s of snaps.docs) { const v = await fsGet<T>(col, s.id); if (v !== null) out.push(v); }
  return out;
}
async function fsDel(col: string, id: string) {
  const c = (await db()).collection(colName(col)); const m = (await c.doc(safe(id)).get()).data() as { n?: number } | undefined;
  for (let i = 1; i < (m?.n ?? 1); i++) await c.doc(`${safe(id)}~c${i}`).delete();
  await c.doc(safe(id)).delete();
}

// ---- local files (dev) ----
const dir = () => process.env["ISDEAD_DATA_DIR"] ?? path.join(process.env["VERCEL"] ? "/tmp" : process.cwd(), ".data");
async function fileRead<T>(col: string, id: string): Promise<Read<T>> {
  let raw: string; try { raw = await fs.readFile(path.join(dir(), safe(col), safe(id) + ".json"), "utf8"); } catch { return { state: "missing" }; }
  try { return { state: "ok", value: JSON.parse(raw) as T }; } catch { return { state: "torn" }; }
}
const fileGet = async <T>(col: string, id: string): Promise<T | null> => { const r = await fileRead<T>(col, id); return r.state === "ok" ? r.value : null; };
async function fileCreate<T>(col: string, id: string, doc: T): Promise<boolean> {
  const d = path.join(dir(), safe(col)); await fs.mkdir(d, { recursive: true });
  try { await fs.writeFile(path.join(d, safe(id) + ".json"), JSON.stringify(doc), { flag: "wx" }); return true; } catch (e: any) { if (e?.code === "EEXIST") return false; throw e; }
}
async function filePut<T>(col: string, id: string, doc: T) {
  const d = path.join(dir(), safe(col)); await fs.mkdir(d, { recursive: true });
  await fs.writeFile(path.join(d, safe(id) + ".json"), JSON.stringify(doc));
}
async function fileList<T>(col: string): Promise<T[]> {
  const d = path.join(dir(), safe(col));
  let names: string[] = []; try { names = await fs.readdir(d); } catch { return []; }
  const out: T[] = []; for (const n of names) if (n.endsWith(".json")) { try { out.push(JSON.parse(await fs.readFile(path.join(d, n), "utf8"))); } catch { /* skip */ } }
  return out;
}
async function fileDel(col: string, id: string) { try { await fs.unlink(path.join(dir(), safe(col), safe(id) + ".json")); } catch { /* ok */ } }

export const getDoc = <T>(col: string, id: string): Promise<T | null> => (useFirestore() ? fsGet<T>(col, id) : fileGet<T>(col, id));
export const putDoc = <T>(col: string, id: string, doc: T): Promise<void> => (useFirestore() ? fsPut(col, id, doc) : filePut(col, id, doc));
export const listDocs = <T>(col: string): Promise<T[]> => (useFirestore() ? fsList<T>(col) : fileList<T>(col));
export const delDoc = (col: string, id: string): Promise<void> => (useFirestore() ? fsDel(col, id) : fileDel(col, id));
/** Write only if no doc has this id yet (atomic in both backends). Returns false when the id was taken. */
export const createDoc = <T>(col: string, id: string, doc: T): Promise<boolean> => (useFirestore() ? fsCreate(col, id, doc) : fileCreate(col, id, doc));
/** Like getDoc, but tells a missing doc apart from one that exists and can't be read whole (a torn chunked read). */
export const readDoc = <T>(col: string, id: string): Promise<Read<T>> => (useFirestore() ? fsRead<T>(col, id) : fileRead<T>(col, id));

/** After a guest signs in: move every per-user doc (docs keyed by the user id) from the guest id to the account, once. */
export async function adoptGuestDocs(fromId: string, toId: string): Promise<number> {
  if (!fromId || !toId || fromId === toId) return 0;
  let moved = 0;
  if (useFirestore()) {
    const d = await db(); const prefix = `${appName()}__`;
    for (const col of await d.listCollections()) {
      if (!col.id.startsWith(prefix)) continue;
      const src = await col.doc(safe(fromId)).get(); if (!src.exists) continue;
      const dstRef = col.doc(safe(toId)); if ((await dstRef.get()).exists) continue;
      // Chunked docs (over ~900 KB) keep the rest of their JSON in <id>~c1, ~c2 …: copy those before the main doc.
      const n = (src.data() as { n?: number }).n ?? 1;
      for (let i = 1; i < n; i++) { const part = await col.doc(`${safe(fromId)}~c${i}`).get(); if (part.exists) await col.doc(`${safe(toId)}~c${i}`).set(part.data()!); }
      await dstRef.set(src.data()!);
      for (let i = 1; i < n; i++) await col.doc(`${safe(fromId)}~c${i}`).delete();
      await src.ref.delete(); moved++;
    }
  } else {
    const root = dir();
    let cols: string[] = []; try { cols = await fs.readdir(root); } catch { return 0; }
    for (const col of cols) {
      const from = path.join(root, col, `${safe(fromId)}.json`), to = path.join(root, col, `${safe(toId)}.json`);
      try { await fs.access(from); } catch { continue; }
      try { await fs.access(to); continue; } catch { /* no account doc yet */ }
      await fs.rename(from, to); moved++;
    }
  }
  return moved;
}
