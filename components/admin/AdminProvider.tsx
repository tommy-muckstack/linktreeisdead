"use client";
// One page, shared by every admin screen: edits apply instantly (the preview re-renders) and save in the background.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BP } from "@/lib/basepath";
import type { Page, Block } from "@/lib/model";
import { identify } from "@/lib/analytics";

export type AdminUser = { id: string; name: string; email: string; demo: boolean; guest: boolean };
type SaveState = "saved" | "saving" | "error";
type Ctx = {
  page: Page; user: AdminUser; save: SaveState; error: string;
  edit: (f: (p: Page) => Page) => void; setBlock: (id: string, patch: Partial<Block> | ((b: Block) => Partial<Block>)) => void;
  rename: (handle: string) => Promise<string | null>; flush: () => Promise<boolean>; reload: () => Promise<void>;
  toast: (msg: string) => void;
};
const C = createContext<Ctx | null>(null);
export const useAdmin = () => { const c = useContext(C); if (!c) throw new Error("useAdmin outside AdminProvider"); return c; };
export const publicUrl = (handle: string) => (typeof window === "undefined" ? "" : location.origin) + `${BP}/u/${handle}`;
/** location.origin, but "" during server render and hydration so the markup matches; fills in after mount. */
export function useOrigin() { const [o, setO] = useState(""); useEffect(() => setO(location.origin), []); return o; }

export function AdminProvider({ initial, user, children }: { initial: Page; user: AdminUser; children: React.ReactNode }) {
  const [page, setPage] = useState(initial); const [save, setSave] = useState<SaveState>("saved"); const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const latest = useRef(page); latest.current = page;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const dirty = useRef(false); const inflight = useRef<Promise<boolean> | null>(null);
  const put = useCallback(async (extra?: Record<string, unknown>): Promise<{ ok: boolean; page?: Page; error?: string }> => {
    setSave("saving");
    const r = await fetch(`${BP}/api/page`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...latest.current, ...extra }) }).catch(() => null);
    const j = await r?.json().catch(() => ({})) ?? {};
    if (!r?.ok) { setSave("error"); setError(j.error ?? "Couldn't save. Check your connection."); return { ok: false, error: j.error }; }
    setSave("saved"); setError(""); dirty.current = false; return { ok: true, page: j.page };
  }, []);
  const flush = useCallback(async () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } if (!dirty.current) return true; const p = put().then(r => r.ok); inflight.current = p; return p; }, [put]);
  const edit = useCallback((f: (p: Page) => Page) => {
    setPage(p => { const n = f(p); latest.current = n; return n; }); dirty.current = true; setSave("saving");
    if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => { timer.current = null; void put(); }, 600);
  }, [put]);
  const setBlock = useCallback((id: string, patch: Partial<Block> | ((b: Block) => Partial<Block>)) => edit(p => ({ ...p, links: p.links.map(l => l.id === id ? { ...l, ...(typeof patch === "function" ? patch(l) : patch) } : l) })), [edit]);
  const rename = useCallback(async (handle: string) => { await flush(); const r = await put({ handle }); if (r.ok && r.page) { setPage(r.page); return null; } return r.error ?? "Couldn't change your username."; }, [flush, put]);
  const reload = useCallback(async () => { const r = await fetch(`${BP}/api/page`).catch(() => null); if (r?.ok) { const j = await r.json(); setPage(j.page); } }, []);
  const toast = useCallback((m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(t => (t === m ? "" : t)), 2400); }, []);
  useEffect(() => { identify(user.id, { account_type: user.guest ? "guest" : user.demo ? "demo" : "firebase" }); }, [user.id, user.guest, user.demo]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty.current) { void flush(); e.preventDefault(); } }; addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [flush]);
  return <C.Provider value={{ page, user, save, error, edit, setBlock, rename, flush, reload, toast }}>{children}{toastMsg && <div className="ad-toast" role="status">{toastMsg}</div>}</C.Provider>;
}

/** Resize an uploaded image in the browser and return a data URL small enough to store with the page. */
export function readImage(file: File, max: number, opts: { square?: boolean; quality?: number; type?: "image/jpeg" | "image/webp" | "image/png" } = {}): Promise<string> {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error("Choose an image file."));
    const img = new Image(); const u = URL.createObjectURL(file);
    img.onload = () => {
      let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (opts.square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s; }
      const k = Math.min(1, max / Math.max(sw, sh)); const c = document.createElement("canvas"); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
      c.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      res(c.toDataURL(opts.type ?? "image/jpeg", opts.quality ?? 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error("That image couldn't be read.")); }; img.src = u;
  });
}
