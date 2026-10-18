// Full-page screenshots for parity checks. Usage: OUT=<dir> node scripts/qa-shots.mjs <width> name=url [name=url ...]
// Writes <OUT>/<name>-<width>.jpg. Keep OUT outside the repo.
import { chromium } from "@playwright/test";
const [,, w, ...jobs] = process.argv; const out = process.env.OUT || ".";
const b = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
await Promise.all(jobs.map(async job => {
  const i = job.indexOf("="); const name = job.slice(0, i), url = job.slice(i + 1);
  const c = await b.newContext({ viewport: { width: +w, height: 900 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" });
  const p = await c.newPage(); const errs = [];
  p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
  for (let t = 0; t < 3; t++) {
    try {
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(4000);
      await p.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
      for (const sel of ["#onetrust-reject-all-handler", 'button:has-text("Accept essentials only")']) { try { await p.click(sel, { timeout: 800 }); } catch {} }
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
      await p.waitForTimeout(1200);
      const [h, sw] = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth]);
      await p.screenshot({ path: `${out}/${name}-${w}.jpg`, type: "jpeg", quality: 70, fullPage: true });
      console.log(name, w, "h", h, "scrollW", sw, errs.length ? "consoleErrors: " + errs.join(" || ") : ""); break;
    } catch (e) { console.log("retry", name, String(e.message).slice(0, 80)); await p.waitForTimeout(3000); }
  }
  await c.close();
}));
await b.close();
