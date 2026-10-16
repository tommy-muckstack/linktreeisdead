// Side-by-side compare of two full-page screenshots, cut into segments.
// Usage: node scripts/qa-compare.mjs <orig.png> <clone.png> <outPrefix> [segmentHeightPx=1800] [scale=0.5]
import fs from "node:fs";
import { chromium } from "@playwright/test";
const [,, a, b, prefix, seg = "1800", scale = "0.5"] = process.argv;
const data = f => `data:image/${/\.jpe?g$/.test(f) ? "jpeg" : "png"};base64,` + fs.readFileSync(f).toString("base64");
const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1600, height: 1000 } });
await p.setContent(`<body style="margin:0;display:flex;gap:8px;background:#f0f"><img id=a src="${data(a)}"><img id=b src="${data(b)}"></body>`);
await p.waitForFunction(() => [...document.images].every(i => i.complete));
const s = +scale; const dims = await p.evaluate(s => { const out = []; for (const i of document.images) { const w = i.naturalWidth * s, h = i.naturalHeight * s; i.style.width = w + "px"; i.style.height = h + "px"; out.push([w, h]); } return out; }, s);
const W = dims[0][0] + dims[1][0] + 8, H = Math.max(dims[0][1], dims[1][1]); const step = +seg * s; let n = 0;
for (let y = 0; y < H; y += step, n++) await p.screenshot({ path: `${prefix}-${String(n).padStart(2, "0")}.jpg`, type: "jpeg", quality: 70, clip: { x: 0, y, width: W, height: Math.min(step, H - y) }, fullPage: true });
console.log(n, "segments", dims); await br.close();
