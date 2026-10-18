"use client";
import { useState } from "react";
import { BP } from "@/lib/basepath";
// Claim form: no account needed. Goes straight into the app (as a guest if signed out) asking for this handle.
// A full page load through the guest-session route: it mints a guest session when there is none (and just bounces
// signed-in visitors on), keeping ?handle= so a brand-new page is created with the handle typed here.
export function ClaimBar({ placeholder, cta, btn }: { placeholder: string; cta: string; btn: string }) {
  const [h, setH] = useState("");
  return <form className="lp-claim" onSubmit={e => { e.preventDefault(); const next = "/app" + (h ? `?handle=${encodeURIComponent(h)}` : ""); window.location.assign(`${BP}/api/session/guest?next=${encodeURIComponent(next)}`); }}>
    <input aria-label="Choose your handle" value={h} onChange={e => setH(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))} placeholder={placeholder} maxLength={30} /><button type="submit" className={"lp-btn " + btn}>{cta}</button></form>;
}
