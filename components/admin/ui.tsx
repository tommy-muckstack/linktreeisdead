"use client";
// Small building blocks shared by the admin panels (Linktree-style: soft grey pills, white rounded cards, black primary).
import { useEffect, useRef, useState } from "react";
import { I } from "@/components/icons";

export function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={"ad-sw" + (on ? " on" : "")} onClick={e => { e.stopPropagation(); onChange(!on); }}><i /></button>;
}
export function IconBtn({ n, label, onClick, active, size = 32, href }: { n: string; label: string; onClick?: (e: React.MouseEvent) => void; active?: boolean; size?: number; href?: string }) {
  const p = { className: "ad-ib" + (active ? " on" : ""), "aria-label": label, title: label, style: { width: size, height: size } };
  return href ? <a {...p} href={href} target="_blank" rel="noreferrer"><I n={n} s={size > 36 ? 20 : 16} /></a> : <button type="button" {...p} onClick={onClick}><I n={n} s={size > 36 ? 20 : 16} /></button>;
}
export function Btn({ children, kind = "primary", onClick, disabled, type = "button", full, icon, small }: { children: React.ReactNode; kind?: "primary" | "secondary" | "ghost" | "danger" | "purple"; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; full?: boolean; icon?: string; small?: boolean }) {
  return <button type={type} className={`ad-btn ad-btn--${kind}${full ? " ad-btn--full" : ""}${small ? " ad-btn--sm" : ""}`} onClick={onClick} disabled={disabled}>{icon && <I n={icon} s={18} />}{children}</button>;
}
/** Floating-label input like Linktree's (label sits inside the field). */
export function Field({ label, value, onChange, max, multiline, placeholder, type = "text", trailing, onBlur, autoFocus, error, id }: { label: string; value: string; onChange: (v: string) => void; max?: number; multiline?: boolean; placeholder?: string; type?: string; trailing?: React.ReactNode; onBlur?: () => void; autoFocus?: boolean; error?: string; id?: string }) {
  const P = { id, value, placeholder: placeholder ?? " ", maxLength: max, onBlur, autoFocus, "aria-label": label, onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => onChange(e.target.value) };
  return <div className="ad-fieldwrap"><label className={"ad-field" + (multiline ? " ad-field--ml" : "") + (error ? " err" : "")}>
    <span className="ad-field__l">{label}</span>{multiline ? <textarea {...P} rows={3} /> : <input {...P} type={type} />}{trailing}
  </label>{(max || error) && <div className="ad-field__meta">{error ? <span className="ad-err">{error}</span> : <span />}{max && <span>{value.length}/{max}</span>}</div>}</div>;
}
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [txt, setTxt] = useState(value); useEffect(() => setTxt(value), [value]);
  return <div className="ad-row"><span className="ad-row__l">{label}</span><label className="ad-color"><input type="color" value={value} onChange={e => onChange(e.target.value.toUpperCase())} aria-label={label + " picker"} /><i style={{ background: value }} /><input className="ad-color__t" value={txt} aria-label={label} maxLength={7} onChange={e => { const v = e.target.value.toUpperCase(); setTxt(v); if (/^#[0-9A-F]{6}$/.test(v)) onChange(v); }} /></label></div>;
}
export function Row({ label, sub, children }: { label: string; sub?: string; children?: React.ReactNode }) {
  return <div className="ad-row"><span className="ad-row__l">{label}{sub && <small>{sub}</small>}</span>{children}</div>;
}
export function NavRow({ icon, label, value, onClick, swatch }: { icon?: React.ReactNode; label: string; value?: string; onClick: () => void; swatch?: React.ReactNode }) {
  return <button type="button" className="ad-navrow" onClick={onClick}>{swatch ?? (icon && <span className="ad-navrow__ic">{icon}</span>)}<span className="ad-navrow__l">{label}</span>{value && <span className="ad-navrow__v">{value}</span>}<I n="right" s={18} /></button>;
}
export function Choice<T extends string | number>({ options, value, onChange, render, cols, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; render: (v: T) => React.ReactNode; cols?: number; label: string }) {
  return <div className="ad-choice" role="radiogroup" aria-label={label} style={cols ? { gridTemplateColumns: `repeat(${cols},1fr)` } : undefined}>{options.map(o => <button type="button" key={String(o)} role="radio" aria-checked={value === o} className={"ad-choice__o" + (value === o ? " on" : "")} onClick={() => onChange(o)}>{render(o)}</button>)}</div>;
}
export function Modal({ title, onClose, children, wide, back }: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; wide?: boolean; back?: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);
  return <div className="ad-modal" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined} onMouseDown={onClose}><div className={"ad-modal__in" + (wide ? " wide" : "")} onMouseDown={e => e.stopPropagation()}>
    <header className="ad-modal__hd">{back ? <IconBtn n="left" label="Back" onClick={back} /> : <span style={{ width: 32 }} />}<h2>{title}</h2><IconBtn n="x" label="Close" onClick={onClose} /></header>
    <div className="ad-modal__bd">{children}</div></div></div>;
}
/** Three-dot / anchored popover menu. */
export function Menu({ trigger, items, align = "right" }: { trigger: (open: () => void) => React.ReactNode; items: ({ icon: string; label: string; onClick: () => void; danger?: boolean } | null)[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("mousedown", h); addEventListener("keydown", k); return () => { removeEventListener("mousedown", h); removeEventListener("keydown", k); }; }, [open]);
  return <div className="ad-menuwrap" ref={ref}>{trigger(() => setOpen(o => !o))}{open && <div className={"ad-menu ad-menu--" + align} role="menu">{items.filter(Boolean).map(it => <button key={it!.label} role="menuitem" type="button" className={it!.danger ? "danger" : ""} onClick={e => { e.stopPropagation(); setOpen(false); it!.onClick(); }}><I n={it!.icon} s={18} />{it!.label}</button>)}</div>}</div>;
}
export function PanelHead({ title, back, right }: { title: string; back?: () => void; right?: React.ReactNode }) {
  return <div className="ad-phead">{back && <IconBtn n="left" label="Back" onClick={back} />}<h1>{title}</h1><span style={{ flex: 1 }} />{right}</div>;
}
export function Empty({ icon, title, text, children }: { icon: string; title: string; text?: string; children?: React.ReactNode }) {
  return <div className="ad-empty"><span className="ad-empty__ic"><I n={icon} s={28} /></span><h3>{title}</h3>{text && <p>{text}</p>}{children}</div>;
}
export const plural = (n: number, one: string, many = one + "s") => `${n.toLocaleString()} ${n === 1 ? one : many}`;
