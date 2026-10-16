// Login-screen checks with real clicks/keys. Needs the dev server started with the public Firebase web config.
// 1. Forgot password really calls Firebase (sendOobCode). Uses an example.com address, so no email reaches anyone.
// 2. Create account shows a spinner while the request is pending. The signUp request is held, then aborted,
//    so no account is ever created.
// Usage: OUT=<dir> node scripts/qa-auth.mjs <base> [width]
import { chromium } from "@playwright/test";
const [,, base, w = "1440"] = process.argv; const out = process.env.OUT || ".";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
let oob = null;
p.on("response", r => { if (r.url().includes("accounts:sendOobCode")) oob = r.status(); });
await p.goto(base + "/login", { waitUntil: "networkidle" });
await p.getByText("Forgot password?").click();
await p.locator("input[type=email]").fill("reset-check@example.com");
await p.getByRole("button", { name: "Send reset link" }).click();
await p.waitForTimeout(4000);
console.log("reset: sendOobCode status", oob, "| note:", await p.locator(".lg-ok").textContent().catch(() => null), "| error:", await p.locator(".lg-err").textContent().catch(() => null));
await p.screenshot({ path: `${out}/login-reset-sent-${w}.jpg`, type: "jpeg", quality: 70 });

let release; const held = new Promise(r => (release = r));
await p.route("**/accounts:signUp**", async route => { await held; await route.abort(); });
await p.goto(base + "/login?mode=signup", { waitUntil: "networkidle" });
await p.locator("input[type=email]").fill("spinner-check@example.com");
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p.locator("input[type=password]").fill("not-a-real-password-123");
await p.getByRole("button", { name: "Create account" }).click();
await p.waitForTimeout(600);
const btn = p.locator(".lg-cta");
console.log("signup pending: text", JSON.stringify(await btn.textContent()), "busy", await btn.getAttribute("aria-busy"), "spinner", await p.locator(".lg-spin").count());
await p.screenshot({ path: `${out}/signup-pending-${w}.jpg`, type: "jpeg", quality: 70 });
release(); await p.waitForTimeout(1500);
console.log("signup after abort: text", JSON.stringify(await btn.textContent()), "| error:", await p.locator(".lg-err").textContent().catch(() => null));
await b.close();
