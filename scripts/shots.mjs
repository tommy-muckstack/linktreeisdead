// Drives the real app (production build, demo account) to capture product shots AND smoke-test the core flow.
import fs from "node:fs";
import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("linktreeisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name, opts = {}) => { await page.screenshot({ path: `${dir}/${name}.png`, ...opts }); fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
await withApp("linktreeisdead", async ({ base, browser }) => {
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.waitForSelector('[data-testid="link-row"]'); await page.waitForTimeout(300);
  // add a link through the UI and watch the live preview + autosave
  await page.getByRole("button", { name: "+ Add link" }).click();
  const row = page.locator('[data-testid="link-row"]').first();
  await row.getByLabel("Title").fill("Join my Friday workshop"); await row.getByLabel("URL").fill("example.com/friday");
  await page.getByText("All changes saved").waitFor(); await page.waitForTimeout(400);
  assert.ok(await page.locator('[data-testid="page-preview"] .lt-btn', { hasText: "Join my Friday workshop" }).count(), "preview shows the new link");
  await save(page, "editor");
  // reorder with the down arrow, hide a link
  await row.getByRole("button", { name: "Move down" }).click();
  assert.equal(await page.locator('[data-testid="link-row"]').nth(1).getByLabel("Title").inputValue(), "Join my Friday workshop");
  // persistence: reload keeps everything
  await page.getByText("All changes saved").waitFor(); await page.reload(); await page.waitForSelector('[data-testid="link-row"]');
  assert.equal(await page.locator('[data-testid="link-row"]').nth(1).getByLabel("Title").inputValue(), "Join my Friday workshop");
  // themes
  await page.getByRole("tab", { name: "Appearance" }).click(); await page.getByRole("button", { name: "Theme Midnight" }).click(); await page.getByRole("button", { name: "Outline" }).click(); await page.getByRole("button", { name: "Round", exact: true }).click();
  await page.getByText("All changes saved").waitFor(); await page.waitForTimeout(300); await save(page, "themes");
  // public page: click a link and see the counter move
  const pubPage = await ctx.newPage(); await pubPage.setViewportSize({ width: 390, height: 844 });
  await pubPage.goto(base + "/u/demo"); await pubPage.waitForSelector(".lt-btn"); await pubPage.waitForTimeout(400); await pubPage.screenshot({ path: `${dir}/public.png` }); fs.copyFileSync(`${dir}/public.png`, `${pub}public.png`);
  const href = await pubPage.locator('.lt-btn[data-link-id="lnk00001"]').getAttribute("href"); assert.match(href, /\/linktreeisdead\/go\/demo\/lnk00001$/);
  const res = await ctx.request.get(base.replace("/linktreeisdead", "") + href, { maxRedirects: 0 }); assert.equal(res.status(), 302); assert.equal(res.headers()["location"], "https://example.com/newsletter");
  // hidden link isn't rendered; unknown handle 404s
  assert.equal(await pubPage.locator(".lt-btn", { hasText: "Spring workshop" }).count(), 0);
  assert.equal((await ctx.request.get(base + "/u/nobody-here")).status(), 404);
  await pubPage.close();
  // phone-frame hero shot: re-theme to lime before shooting so the marketing hero shows the signature look
  await page.getByRole("button", { name: "Theme Lime" }).click(); await page.getByRole("button", { name: "Fill" }).click(); await page.getByRole("button", { name: "Pill", exact: true }).click(); await page.getByText("All changes saved").waitFor();
  const pp = await ctx.newPage(); await pp.setViewportSize({ width: 390, height: 780 }); await pp.goto(base + "/u/demo"); await pp.waitForSelector(".lt-btn"); await pp.waitForTimeout(300); await pp.screenshot({ path: `${dir}/phone.png` }); fs.copyFileSync(`${dir}/phone.png`, `${pub}phone.png`); await pp.close();
  // analytics
  await page.getByRole("tab", { name: "Analytics" }).click(); await page.waitForTimeout(300);
  const clicks = Number(await page.getByTestId("stat-clicks").innerText()); assert.ok(clicks >= 128 + 1, "click counter increments after the redirect");
  await save(page, "analytics");
  // settings: handle check
  await page.getByRole("tab", { name: "Settings" }).click(); await page.getByLabel("Your handle").fill("login"); await page.getByText("reserved").waitFor();
  // mobile editor
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const m = await mctx.newPage();
  await m.goto(base + "/login"); await m.getByRole("button", { name: "Use the demo account" }).click(); await m.waitForURL(/\/app/); await m.waitForSelector('[data-testid="link-row"]'); await m.screenshot({ path: `${dir}/mobile-editor.png` });
  await m.getByRole("button", { name: "Preview" }).click(); await m.waitForTimeout(300); await m.screenshot({ path: `${dir}/mobile-preview.png` });
  assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile editor");
  await mctx.close(); await ctx.close();
  // marketing + login
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p2 = await c2.newPage();
  await p2.goto(base); await p2.waitForTimeout(500); await p2.screenshot({ path: `${dir}/home-top.png` }); await p2.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await p2.goto(base + "/#pricing"); await p2.waitForTimeout(300); await p2.screenshot({ path: `${dir}/home-pricing.png` });
  await p2.goto(base + "/login"); await p2.waitForTimeout(300); await p2.screenshot({ path: `${dir}/login.png` });
  const c3 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p3 = await c3.newPage();
  await p3.goto(base); await p3.waitForTimeout(500); await p3.screenshot({ path: `${dir}/mobile-home.png` });
  assert.ok(await p3.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile homepage");
  // /app is gated
  const c4 = await browser.newContext(); const p4 = await c4.newPage(); await p4.goto(base + "/app"); assert.match(p4.url(), /\/login/);
  console.log("linktreeisdead smoke OK");
});
