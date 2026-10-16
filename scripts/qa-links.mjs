// Dead-end check for the logged-out pages: opens every nav menu, collects every link on each page, then checks that
// in-site links answer 200 (after redirects) and nothing but "Log in" / "Sign up" points at /login.
// Also prints any rendered "Linktree" that isn't "LinktreeIsDead" (only the trademark line may match).
// Usage: node scripts/qa-links.mjs <base e.g. http://localhost:3032/linktreeisdead>
import { chromium } from "@playwright/test";
const base = process.argv[2]; const origin = new URL(base).origin;
const pages = ["/", "/pricing", "/login", "/about", "/help", "/use-cases", "/terms", "/privacy", "/nope"];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const links = new Map(); let bad = 0;
for (const path of pages) {
  await p.goto(base + path, { waitUntil: "networkidle" });
  for (const label of ["Solutions", "Features", "Integrations", "Resources"]) {
    const btn = p.locator(`nav.lp-nav button:has-text("${label}")`);
    if (await btn.count()) { await btn.click(); await p.waitForTimeout(150);
      for (const [t, h] of await p.$$eval(".lp-mega a", as => as.map(a => [a.textContent.trim(), a.href]))) links.set(h, `${path} menu ${label}: ${t}`); }
  }
  for (const [t, h] of await p.$$eval("a[href]", as => as.map(a => [a.textContent.trim(), a.href]))) {
    if (!links.has(h)) links.set(h, `${path}: ${t}`);
    if (!h.endsWith("#") && /\/login(\?|$)/.test(new URL(h).pathname + new URL(h).search) && !/^(Log in|Sign up( free)?|Log in.*)$/.test(t)) { console.log("LOGIN LINK not labelled Log in/Sign up:", path, JSON.stringify(t)); bad++; }
  }
  const text = await p.evaluate(() => document.body.innerText + " " + [...document.querySelectorAll("[alt],[title],[aria-label]")].map(e => e.getAttribute("alt") || e.getAttribute("title") || e.getAttribute("aria-label")).join(" ") + " " + document.title);
  for (const m of text.matchAll(/.{0,40}Linktree(?!IsDead).{0,40}/g)) if (!/not affiliated|trademark|Pty Ltd/.test(m[0])) { console.log("BARE Linktree on", path, "::", m[0].replace(/\s+/g, " ")); bad++; }
}
for (const [h, where] of links) {
  const u = new URL(h); if (u.origin !== origin) continue;
  // /app answers a signed-out visitor with the guest-session redirect (cookie round trip), so a 3xx there is fine.
  const app = /\/app(\/|$)/.test(u.pathname);
  const r = await fetch(u.origin + u.pathname + u.search, { redirect: app ? "manual" : "follow" }).catch(e => ({ status: String(e) }));
  const ok = r.status === 200 || (app && r.status >= 300 && r.status < 400) || (u.pathname.endsWith("/nope") && r.status === 404);
  if (!ok) { console.log("DEAD", r.status, h, "from", where); bad++; }
}
console.log(links.size, "links checked,", bad, "problems"); await b.close(); process.exit(bad ? 1 : 0);
