// Verifies PostHog events in a real browser WITHOUT sending anything: before_send records each event and returns null.
// Usage (dev server started with NEXT_PUBLIC_POSTHOG_KEY set): BASE=http://localhost:PORT/<slug> PATHS="/,/app" node scripts/ph-check.mjs
// Copy into the repo's scripts/ (Playwright must resolve from the repo). Exits 1 if any event lacks product/surface/platform
// or still carries a legacy property.
import { chromium } from "@playwright/test";
const BASE = process.env.BASE; const PATHS = (process.env.PATHS ?? "/").split(",");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const LEGACY = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id"];
const b = await chromium.launch(); const ctx = await b.newContext({ userAgent: UA });
await ctx.addInitScript(() => {
  localStorage.setItem("isdead_ph_debug", "1"); window.__ev = JSON.parse(sessionStorage.getItem("__ev") || "[]");
  let v; Object.defineProperty(window, "__posthog", { configurable: true, get: () => v, set: p => { v = p; p.set_config({ before_send: e => { window.__ev.push({ event: e.event, props: e.properties }); sessionStorage.setItem("__ev", JSON.stringify(window.__ev)); return null; } }); } });
});
const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
for (const path of PATHS) { await p.goto(BASE + path, { waitUntil: "networkidle" }); await p.waitForTimeout(2000); }
await p.goto(BASE + "/", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.evaluate(() => document.querySelector("a.sh-cta, .shm-b1").click()); await p.waitForTimeout(2500);
await p.goto(BASE + "/pricing/", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.evaluate(() => { document.addEventListener("click", e => e.preventDefault()); document.querySelector("a[href*='github.com']").click(); }); await p.waitForTimeout(2500);

const ev = await p.evaluate(() => window.__ev); let bad = 0;
for (const e of ev) { const pr = e.props; const leg = LEGACY.filter(k => k in pr); const okp = pr.product && ["landing", "app"].includes(pr.surface) && pr.platform === "web" && !leg.length; if (!okp) bad++; console.log(JSON.stringify(Object.fromEntries(Object.entries(pr).filter(([k]) => !k.startsWith("$") && !["token","distinct_id"].includes(k)))).slice(0,200)); console.log(`${okp ? "✓" : "✗"} ${e.event} product=${pr.product} surface=${pr.surface} platform=${pr.platform}${leg.length ? " legacy=" + leg : ""} ${pr.$current_url ?? ""}`); }
console.log(`${ev.length} events, ${bad} bad, page errors: ${errs.length ? errs.join(" | ") : "none"}`);
await b.close(); process.exit(bad || !ev.length ? 1 : 0);
