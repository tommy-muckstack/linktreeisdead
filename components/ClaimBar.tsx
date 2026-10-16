"use client";
import { useState } from "react";
import { BP } from "@/lib/basepath";
// Claim form: no account needed. Goes straight into the app (as a guest if signed out) asking for this handle.
// A full page load, because /app may answer with the guest-session redirect that client navigation can't follow.
export function ClaimBar({ placeholder, cta, btn }: { placeholder: string; cta: string; btn: string }) {
  const [h, setH] = useState("");
  return <form className="lp-claim" onSubmit={e => { e.preventDefault(); window.location.assign(`${BP}/app${h ? `?handle=${encodeURIComponent(h)}` : ""}`); }}>
    <input aria-label="Choose your handle" value={h} onChange={e => setH(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))} placeholder={placeholder} maxLength={30} /><button type="submit" className={"lp-btn " + btn}>{cta}</button></form>;
}
