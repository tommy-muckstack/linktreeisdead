// Opens each top-nav menu and screenshots it. Usage: OUT=<dir> node scripts/qa-nav.mjs <prefix> <url> [width]
import { chromium } from "@playwright/test";
const [,, prefix, url, w = "1440"] = process.argv; const out = process.env.OUT || ".";
const b = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
const p = await (await b.newContext({ viewport: { width: +w, height: 900 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" })).newPage();
await p.goto(url, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(6000);
try { await p.click("#onetrust-reject-all-handler", { timeout: 1500 }); } catch {}
for (const label of ["Solutions", "Features", "Integrations", "Resources"]) {
  const el = p.locator(`nav >> text="${label}"`).first();
  try { await el.click({ timeout: 3000 }); } catch (e) { console.log("no", label, String(e.message).slice(0, 60)); continue; }
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/${prefix}-nav-${label}.jpg`, type: "jpeg", quality: 70 });
  const txt = await p.evaluate(() => { const m = [...document.querySelectorAll('[role=menu],[data-state=open],[aria-expanded=true] + *, nav [class*=open], nav [class*=menu]')].map(x => x.innerText).join(" | "); return m.replace(/\s+/g, " ").slice(0, 900); });
  console.log(label, "::", txt);
  await p.keyboard.press("Escape"); await p.mouse.click(5, 880); await p.waitForTimeout(400);
}
await b.close();
