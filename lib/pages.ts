// Server-side persistence for pages (lib/store.ts: JSON files in dev/demo, swap for Firestore in production).
import { getDoc, putDoc, listDocs } from "@/lib/store";
import { Page, newPage, demoPage, sanitizePage, slugifyHandle, validateHandle, bump } from "@/lib/model";
const COL = "pages";
const chain = new Map<string, Promise<unknown>>();
/** Serialise read-modify-write per handle so concurrent clicks never lose counts. */
function locked<T>(handle: string, fn: () => Promise<T>): Promise<T> {
  const prev = chain.get(handle) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(handle, next.catch(() => {})); return next;
}
export const getPage = (handle: string) => getDoc<Page>(COL, handle);
export async function getPageByOwner(ownerId: string): Promise<Page | null> { return (await listDocs<Page>(COL)).find(p => p.ownerId === ownerId) ?? null; }
export async function ensurePage(user: { id: string; name: string; email: string; demo: boolean }, wanted?: string): Promise<Page> {
  const have = await getPageByOwner(user.id); if (have) return have;
  if (user.demo) { const d = demoPage(); await putDoc(COL, d.handle, d); return d; }
  let base = slugifyHandle(wanted && !validateHandle(wanted) ? wanted : (user.email.split("@")[0] || user.name)); let h = base, i = 1;
  while ((await getPage(h)) || validateHandle(h)) h = (base + ++i).slice(0, 30);
  const p = newPage(user.id, h, user.name || h); await putDoc(COL, h, p); return p;
}
export const handleAvailable = async (h: string) => !validateHandle(h) && !(await getPage(h));
export async function savePage(ownerId: string, input: any): Promise<{ page?: Page; error?: string }> {
  const cur = await getPageByOwner(ownerId); if (!cur) return { error: "No page yet" };
  return locked(cur.handle, async () => {
    const fresh = (await getPage(cur.handle)) ?? cur; let next = sanitizePage(input, fresh);
    const wantHandle = typeof input?.handle === "string" ? input.handle.trim().toLowerCase() : fresh.handle;
    if (wantHandle !== fresh.handle) {
      const bad = validateHandle(wantHandle); if (bad) return { error: bad };
      if (await getPage(wantHandle)) return { error: "That handle is taken." };
      next = { ...next, handle: wantHandle }; await putDoc(COL, wantHandle, next);
      const { delDoc } = await import("@/lib/store"); await delDoc(COL, fresh.handle); return { page: next };
    }
    await putDoc(COL, next.handle, next); return { page: next };
  });
}
export const recordView = (handle: string) => locked(handle, async () => { const p = await getPage(handle); if (!p) return; p.views++; bump(p, "v"); await putDoc(COL, handle, p); });
export const recordClick = (handle: string, id: string) => locked(handle, async () => {
  const p = await getPage(handle); const l = p?.links.find(x => x.id === id && x.kind === "link" && x.enabled && x.url); if (!p || !l) return null;
  l.clicks++; bump(p, "c"); await putDoc(COL, handle, p); return l.url;
});
