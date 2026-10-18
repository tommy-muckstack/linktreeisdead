// End-to-end walk through the admin and the public page with real clicks, as a brand-new guest.
// Usage: BASE=http://localhost:3031/linktreeisdead node scripts/e2e-admin.mjs   (dev server needs AUTH_SECRET for guests)
import { chromium } from "@playwright/test";
const BASE = process.env.BASE ?? "http://localhost:3031/linktreeisdead";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36"; // headless UA counts as a bot
let failed = 0; const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) failed++; };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA }); const p = await ctx.newPage();
const errors = []; p.on("pageerror", e => errors.push(e.message));
await ctx.route(/^https:\/\/(example\.com|www\.example\.com)\//, r => r.fulfill({ status: 200, contentType: "text/html", body: "<h1>outside</h1>" }));
const vis = l => l.waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false);
const saved = async () => { await p.waitForFunction(() => document.querySelector(".ad-save")?.textContent === "Saved", null, { timeout: 8000 }).catch(() => {}); };

// deep link as a first-time guest keeps the path
await p.goto(BASE + "/app/design", { waitUntil: "networkidle" }); ok(p.url().endsWith("/app/design"), "first visit to /app/design lands on /app/design");
await p.goto(BASE + "/app/links", { waitUntil: "networkidle" });
const handle = (await p.locator(".ad-acct b").first().textContent()).trim(); ok(/^guest/.test(handle), `guest page created (${handle})`);

// add a YouTube video by pasting a link
await p.getByRole("button", { name: "Add", exact: true }).first().click();
await p.getByLabel("Paste a link or search").fill("https://youtu.be/aqz-KE-bpKQ"); await p.keyboard.press("Enter");
await p.waitForURL(/\/app\/links\/edit\//); ok(await vis(p.getByText("YouTube will play")), "pasted YouTube link becomes a video block");
await p.getByLabel("Title").first().fill("Watch the trailer"); await saved();
// add a plain link, lock it with a code
await p.getByRole("button", { name: "Back" }).click(); await p.getByRole("button", { name: "Add", exact: true }).first().click();
await p.getByLabel("Paste a link or search").fill("example.com/shop"); await p.keyboard.press("Enter"); await p.waitForURL(/\/app\/links\/edit\//);
await p.getByLabel("Title").first().fill("My shop"); await p.getByRole("tab", { name: "Power-ups" }).click();
await p.getByRole("radio", { name: "Code" }).click(); await p.getByLabel("Code (letters or numbers)").fill("1234"); await saved();
// email signup form from the Contact category
await p.getByRole("button", { name: "Back" }).click(); await p.getByRole("button", { name: "Add", exact: true }).first().click();
await p.getByRole("button", { name: "Contact" }).click(); await p.getByRole("button", { name: /Email signup/ }).click(); await p.waitForURL(/\/app\/links\/edit\//); await saved();
await p.getByRole("button", { name: "Back" }).click();
await p.locator("[data-testid=link-row]").first().waitFor(); const rows = await p.locator("[data-testid=link-row]").allTextContents(); ok(rows.length === 3, `three blocks in Content (${rows.length}: ${rows.map(r => r.slice(0, 20)).join(" / ")})`);
// social icon
await p.getByRole("button", { name: "Add social icon" }).click(); await p.getByRole("button", { name: /^Instagram/ }).click();
await p.getByLabel("Instagram URL").fill("instagram.com/example"); await p.getByRole("button", { name: "Add to page" }).click(); await saved();
ok(await vis(p.getByRole("button", { name: "Edit instagram" })), "Instagram icon added");
// archive + restore
const shopRow = p.locator("[data-testid=link-row]", { hasText: "My shop" }); await shopRow.getByRole("button", { name: "More options" }).click(); await p.getByRole("menuitem", { name: "Archive" }).click();
await p.getByRole("button", { name: "View archive" }).click(); ok(await vis(p.getByText("My shop")), "archived link shows in Archive");
await p.getByRole("button", { name: "Restore" }).click(); await p.getByRole("button", { name: "Back" }).click(); await saved();
ok(await vis(p.locator("[data-testid=link-row]", { hasText: "My shop" })), "restored link is back");
// design: theme + header layout + title
await p.getByRole("link", { name: "Design" }).click(); await p.getByRole("button", { name: /Theme/ }).click(); await p.getByRole("button", { name: "Blocks" }).click(); await saved();
const bg = await p.locator(".ad-phone .pv-bg").evaluate(e => getComputedStyle(e).backgroundColor); ok(bg === "rgb(123, 44, 245)", `Blocks theme applied to preview (${bg})`);
await p.getByRole("link", { name: "Header" }).click(); await p.getByRole("radio", { name: /Banner/ }).click(); await p.getByLabel("Title", { exact: true }).fill("Studio Test"); await saved();
// profile photo upload: resized in the browser, stored as its own file, served from /img/<id>
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
await p.locator('label[aria-label="Upload profile image"] input[type=file]').setInputFiles({ name: "me.png", mimeType: "image/png", buffer: png });
await p.waitForFunction(() => /\/img\//.test(document.querySelector(".ad-phone .pv-avatar__img")?.getAttribute("src") ?? ""), null, { timeout: 10000 }).catch(() => {}); await saved();
const avatarSrc = await p.locator(".ad-phone .pv-avatar__img").first().getAttribute("src");
ok(/\/img\/[A-Za-z0-9_-]{16,}/.test(avatarSrc ?? ""), "uploaded photo is stored as a file");
const imgRes = await p.request.get(BASE.replace(/\/linktreeisdead$/, "") + (avatarSrc.match(/\/[a-z0-9-]*\/img\/[A-Za-z0-9_-]+/)?.[0] ?? "")); ok(imgRes.status() === 200 && /image\//.test(imgRes.headers()["content-type"] ?? ""), "uploaded photo is served");
// settings: subscribe + messages
await p.getByRole("link", { name: "Settings" }).click(); await p.getByRole("switch", { name: "Let visitors subscribe" }).click(); await p.getByRole("switch", { name: "Let visitors message me" }).click(); await saved();

// public page
const pub = await ctx.newPage(); await pub.goto(`${BASE}/u/${handle}`, { waitUntil: "networkidle" });
ok(await vis(pub.getByRole("heading", { name: "Studio Test" })), "public page shows the new title");
ok(await pub.locator("iframe[title=YouTube]").count() === 1, "video embeds on the public page");
await pub.getByRole("link", { name: /My shop/ }).click(); await pub.getByLabel("Code").fill("0000"); await pub.getByRole("button", { name: "Unlock" }).click();
ok(await vis(pub.getByText("That code isn't right.")), "wrong code is rejected");
await pub.getByLabel("Code").fill("1234"); await Promise.all([pub.waitForURL(/example\.com/), pub.getByRole("button", { name: "Unlock" }).click()]); ok(true, "right code opens the link");
await pub.goto(`${BASE}/u/${handle}`, { waitUntil: "networkidle" });
await pub.locator(".pv-card--form input[type=email]").fill("fan@example.com"); await pub.locator(".pv-card--form button").click(); ok(await vis(pub.getByText("Your submission was sent.")), "email signup submits");
await pub.getByRole("button", { name: "Message" }).click(); const dlg = pub.getByRole("dialog"); await dlg.getByLabel("Name").fill("A Visitor"); await dlg.getByLabel("Email").fill("visitor@example.com"); await dlg.getByLabel("Message").fill("Hello there"); await dlg.getByRole("button", { name: "Send" }).click();
ok(await vis(dlg.getByText("Your submission was sent.")), "visitor message sends"); await pub.keyboard.press("Escape");
await pub.getByRole("button", { name: "Share" }).click(); ok(await vis(pub.getByRole("heading", { name: "Share this page" })), "public share sheet opens");

// back office sees it
await p.goto(BASE + "/app/audience", { waitUntil: "networkidle" }); ok(await vis(p.getByText("fan@example.com")), "signup lands in Audience");
await p.goto(BASE + "/app/messaging", { waitUntil: "networkidle" }); await p.getByRole("button", { name: /A Visitor/ }).click(); ok(await vis(p.locator(".ad-inbox__msg").getByText("Hello there")), "message lands in Messaging");
await p.goto(BASE + "/app/insights", { waitUntil: "networkidle" }); const views = Number(await p.locator(".ad-stat b").first().textContent()); ok(views >= 2, `Insights counts views (${views})`);
// link shortener: guests are asked to sign in (short links are public URLs on our domain); a signed-in account creates one
await p.goto(BASE + "/app/link-shortener", { waitUntil: "networkidle" }); ok(await vis(p.getByTestId("short-signin").getByRole("link", { name: "Sign in" })), "guest link shortener prompts sign-in");
const dctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA }); await dctx.route(/^https:\/\/(example\.com|www\.example\.com)\//, r => r.fulfill({ status: 200, contentType: "text/html", body: "<h1>outside</h1>" }));
const dp = await dctx.newPage(); dp.on("pageerror", e => errors.push(e.message)); await dp.request.post(BASE + "/api/session/demo");
await dp.goto(BASE + "/app/link-shortener", { waitUntil: "networkidle" }); await dp.getByLabel("Long URL").fill("https://example.com/long/path"); await dp.getByLabel("Custom back-half").fill("e2e" + Date.now().toString(36)); await dp.getByRole("button", { name: "Shorten" }).click();
await dp.locator(".ad-card__t").first().waitFor({ timeout: 8000 }).catch(() => {});
const short = await dp.locator(".ad-card__t").first().textContent(); const sp = await dctx.newPage(); await sp.goto("http://" + short); ok(sp.url().startsWith("https://example.com/long/path"), "short link redirects");
// planner
await p.goto(BASE + "/app/social-planner", { waitUntil: "networkidle" }); await p.getByRole("button", { name: "New post" }).click(); await p.getByLabel("Caption").fill("Launch day post"); await p.getByRole("button", { name: "Save" }).click();
await p.getByRole("button", { name: "List" }).click(); ok(await vis(p.getByText("Launch day post")), "planned post is listed");
// mobile editor
const m = await b.newPage({ viewport: { width: 390, height: 844 }, userAgent: UA }); await m.context().addCookies(await ctx.cookies()); await m.goto(BASE + "/app/links", { waitUntil: "networkidle" });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth); ok(!overflow, "390px editor has no sideways scroll");
await m.getByRole("button", { name: "Preview" }).click(); ok(await vis(m.locator(".ad-ed__prev.open .pv")), "390px preview toggle works");
ok(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.join(" | ") : ""));
await b.close(); console.log(failed ? `${failed} failed` : "all passed"); process.exit(failed ? 1 : 0);
