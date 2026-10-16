"use client";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { Mark } from "@/components/Mark";
import "@/app/page-view.css";
export function PageLock({ handle }: { handle: string }) {
  const [code, setCode] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  return <div className="pv pv--page" style={{ display: "grid", placeItems: "center", background: "#ECEEF1", fontFamily: '"IsDead Archivo", system-ui, sans-serif' }}>
    <form className="pv-dlg__in pv-form" style={{ borderRadius: 24, maxWidth: 420 }} onSubmit={async e => { e.preventDefault(); setBusy(true); const r = await fetch(`${BP}/api/page-lock`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle, code }) }).catch(() => null); setBusy(false); if (r?.ok) location.reload(); else setErr((await r?.json().catch(() => null))?.error ?? "Try again."); }}>
      <Mark size={36} /><h2>@{handle} is locked</h2><p>Enter the code to view this page.</p>
      <input aria-label="Code" value={code} onChange={e => setCode(e.target.value)} autoFocus />{err && <p className="pv-err">{err}</p>}
      <button className="pv-pill pv-pill--solid" disabled={busy}>{busy ? "Checking…" : "Unlock"}</button>
    </form>
  </div>;
}
