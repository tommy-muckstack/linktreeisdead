"use client";
// QR code for any URL, with colour presets and PNG / SVG download. Rendered in the browser (lib/qr.ts), no server round trip.
import { useMemo, useState } from "react";
import { renderQrSvg, DEFAULT_STYLE, type QrStyle } from "@/lib/qr";
import { Modal, Btn } from "@/components/admin/ui";
import { track, EVENTS } from "@/lib/analytics";

const PRESETS: { name: string; s: Partial<QrStyle> }[] = [{ name: "Classic", s: { fg: "#000000", bg: "#FFFFFF", pattern: "square", corners: "square" } }, { name: "Lime", s: { fg: "#254F1A", bg: "#D2E823", pattern: "rounded", corners: "rounded" } }, { name: "Dots", s: { fg: "#7B2CF5", bg: "#FFFFFF", pattern: "dots", corners: "circle" } }, { name: "Night", s: { fg: "#FFFFFF", bg: "#111111", pattern: "rounded", corners: "rounded" } }];
export function QrModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [style, setStyle] = useState<QrStyle>({ ...DEFAULT_STYLE, fg: "#000000" });
  const svg = useMemo(() => renderQrSvg(url, style, { width: 1024 }), [url, style]);
  const save = (kind: "svg" | "png") => {
    track(EVENTS.link_qr_downloaded, { format: kind }); const file = `${name}-qr.${kind}`; const blob = new Blob([svg], { type: "image/svg+xml" }); const href = URL.createObjectURL(blob);
    const done = (h: string) => { const a = document.createElement("a"); a.href = h; a.download = file; a.click(); setTimeout(() => URL.revokeObjectURL(h), 1000); };
    if (kind === "svg") return done(href);
    const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; c.getContext("2d")!.drawImage(img, 0, 0); c.toBlob(b => b && done(URL.createObjectURL(b))); URL.revokeObjectURL(href); }; img.src = href;
  };
  return <Modal title="QR code" onClose={onClose}>
    <div className="ad-qr"><div className="ad-qr__img" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="ad-muted">Scanning opens <b>{url.replace(/^https?:\/\//, "")}</b></p>
      <div className="ad-qr__presets">{PRESETS.map(p => <button key={p.name} type="button" className={"ad-chip" + (style.fg === p.s.fg && style.bg === p.s.bg ? " on" : "")} onClick={() => setStyle(s => ({ ...s, ...p.s }))}><i style={{ background: p.s.bg, borderColor: p.s.fg }} />{p.name}</button>)}</div>
      <div className="ad-qr__dl"><Btn icon="download" onClick={() => save("png")}>Download PNG</Btn><Btn kind="secondary" icon="download" onClick={() => save("svg")}>Download SVG</Btn></div>
    </div>
  </Modal>;
}
