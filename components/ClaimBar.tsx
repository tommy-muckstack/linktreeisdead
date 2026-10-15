"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function ClaimBar({ placeholder, cta, btn }: { placeholder: string; cta: string; btn: string }) {
  const r = useRouter(); const [h, setH] = useState("");
  return <form className="lp-claim" onSubmit={e => { e.preventDefault(); r.push(`/login?callbackUrl=${encodeURIComponent("/app" + (h ? `?handle=${encodeURIComponent(h)}` : ""))}`); }}>
    <input aria-label="Choose your handle" value={h} onChange={e => setH(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))} placeholder={placeholder} maxLength={30} /><button type="submit" className={"lp-btn " + btn}>{cta}</button></form>;
}
