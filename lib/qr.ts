// Styled QR Code rendering (isomorphic: the builder previews in the browser, the API serves the same SVG). Error correction H.
import QRCode from "qrcode";
export type QrStyle = { fg: string; bg: string; pattern: "square" | "rounded" | "dots"; corners: "square" | "rounded" | "circle"; frame: "none" | "label" | "box"; label: string; logo: string | null };
export const DEFAULT_STYLE: QrStyle = { fg: "#000000", bg: "#FFFFFF", pattern: "square", corners: "square", frame: "none", label: "SCAN ME", logo: null };
export const PRESETS: { name: string; style: Partial<QrStyle> }[] = [
  { name: "Classic", style: { fg: "#000000", bg: "#FFFFFF", pattern: "square", corners: "square" } }, { name: "Rounded", style: { fg: "#000000", bg: "#FFFFFF", pattern: "rounded", corners: "rounded" } },
  { name: "Dots", style: { fg: "#1B5CF5", bg: "#FFFFFF", pattern: "dots", corners: "circle" } }, { name: "Orange", style: { fg: "#254F1A", bg: "#F1F8B8", pattern: "rounded", corners: "rounded" } },
  { name: "Inverted", style: { fg: "#FFFFFF", bg: "#000000", pattern: "square", corners: "rounded" } }, { name: "Forest", style: { fg: "#1F5E3A", bg: "#EEF6F0", pattern: "dots", corners: "rounded" } },
];
const HEX = /^#[0-9a-fA-F]{6}$/; const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
/** Only keep values we know how to render; unknown or oversized input falls back to the default. */
export function cleanStyle(s: unknown): QrStyle {
  const o = (s && typeof s === "object" ? s : {}) as Record<string, unknown>; const pick = <T extends string>(v: unknown, ok: T[], d: T): T => (ok as string[]).includes(String(v)) ? (v as T) : d;
  const logo = typeof o.logo === "string" && /^data:image\/(png|jpeg|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(o.logo) && o.logo.length <= 200_000 ? o.logo : null;
  return { fg: HEX.test(String(o.fg)) ? String(o.fg) : DEFAULT_STYLE.fg, bg: HEX.test(String(o.bg)) ? String(o.bg) : DEFAULT_STYLE.bg, pattern: pick(o.pattern, ["square", "rounded", "dots"], "square"), corners: pick(o.corners, ["square", "rounded", "circle"], "square"), frame: pick(o.frame, ["none", "label", "box"], "none"), label: String(o.label ?? "SCAN ME").slice(0, 24), logo };
}
const inFinder = (n: number, r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
/** SVG string for `data` in `style`. 1 module = 1 unit; the frame adds a band below (label) or a border (box). */
export function renderQrSvg(data: string, style: QrStyle, opts: { width?: number } = {}): string {
  const q = QRCode.create(data, { errorCorrectionLevel: "H" }); const n = q.modules.size; const m = 2; const W = n + m * 2; const band = style.frame === "label" ? 5 : 0; const box = style.frame === "box" ? 1.2 : 0; const H = W + band;
  const dark = (r: number, c: number) => !!q.modules.get(r, c); const parts: string[] = [];
  const logoBox = style.logo ? Math.round(n * 0.26) : 0; const l0 = Math.floor((n - logoBox) / 2), l1 = l0 + logoBox;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (!dark(r, c) || inFinder(n, r, c)) continue; if (logoBox && r >= l0 && r < l1 && c >= l0 && c < l1) continue; const x = c + m, y = r + m;
    if (style.pattern === "dots") parts.push(`<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.42"/>`); else if (style.pattern === "rounded") parts.push(`<rect x="${x + 0.05}" y="${y + 0.05}" width="0.9" height="0.9" rx="0.3"/>`); else parts.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`); }
  const finder = (x: number, y: number) => { const rx = style.corners === "circle" ? 3.5 : style.corners === "rounded" ? 1.6 : 0; const ri = style.corners === "circle" ? 1.5 : style.corners === "rounded" ? 0.7 : 0;
    return `<path fill-rule="evenodd" d="${rr(x, y, 7, 7, rx)} ${rr(x + 1, y + 1, 5, 5, Math.max(0, rx - 0.8))}"/><path d="${rr(x + 2, y + 2, 3, 3, ri)}"/>`; };
  const fin = [finder(m, m), finder(m + n - 7, m), finder(m, m + n - 7)].join("");
  const logo = style.logo ? `<rect x="${l0 + m - 0.5}" y="${l0 + m - 0.5}" width="${logoBox + 1}" height="${logoBox + 1}" rx="1" fill="${style.bg}"/><image href="${style.logo}" x="${l0 + m}" y="${l0 + m}" width="${logoBox}" height="${logoBox}" preserveAspectRatio="xMidYMid meet"/>` : "";
  const frame = style.frame === "label" ? `<rect x="0" y="${W - 0.5}" width="${W}" height="${band + 0.5}" fill="${style.fg}"/><text x="${W / 2}" y="${W + band / 2 + 1}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="3" fill="${style.bg}">${esc(style.label || "SCAN ME")}</text>` : style.frame === "box" ? `<rect x="${box / 2}" y="${box / 2}" width="${W - box}" height="${W - box}" rx="2" fill="none" stroke="${style.fg}" stroke-width="${box}"/>` : "";
  const w = opts.width ?? 512; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${w}" height="${Math.round((w * H) / W)}" shape-rendering="geometricPrecision"><rect width="${W}" height="${H}" fill="${style.bg}"/><g fill="${style.fg}">${parts.join("")}${fin}</g>${logo}${frame}</svg>`;
}
/** Rounded-rect path (clockwise) for even-odd finder rings. */
function rr(x: number, y: number, w: number, h: number, r: number) { r = Math.min(r, w / 2, h / 2); if (r <= 0) return `M${x} ${y}h${w}v${h}h${-w}z`; return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`; }
