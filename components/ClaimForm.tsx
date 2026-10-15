"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function ClaimForm({ prefix, placeholder, cta }: { prefix: string; placeholder: string; cta: string }) {
  const r = useRouter(); const [h, setH] = useState("");
  return <form className="mk-claim" onSubmit={e => { e.preventDefault(); r.push(`/login?callbackUrl=${encodeURIComponent("/app" + (h ? `?handle=${encodeURIComponent(h)}` : ""))}`); }}>
    <span className="mk-claim__pre" aria-hidden>{prefix}</span><input aria-label="Choose your handle" className="mk-claim__in" value={h} onChange={e => setH(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))} placeholder={placeholder} maxLength={30} />
    <button className="ids-btn ids-btn--primary">{cta}</button></form>;
}
