import { describe, it, expect } from "vitest";
import { validateHandle, slugifyHandle, normalizeUrl, normalizeSocial, sanitizePage, newPage, newBlock, stats, bump, demoPage, migratePage, isLive, isComplete, THEME_IDS, THEMES } from "@/lib/model";
import { applyTheme, themeDesign } from "@/lib/themes";
import { toEmbed, sniff } from "@/lib/embeds";
describe("handles", () => {
  it("accepts good handles", () => expect(validateHandle("ada.l_99")).toBeNull());
  it("rejects short, uppercase, reserved and edge punctuation", () => { for (const h of ["ab", "Ada", "login", "media-kit", ".abc", "abc_", "a b c"]) expect(validateHandle(h), h).toBeTruthy(); });
  it("slugifies an email local part", () => { expect(slugifyHandle("Ada.Lovelace+x")).toBe("ada.lovelacex"); expect(validateHandle(slugifyHandle("a"))).toBeNull(); });
});
describe("urls", () => {
  it("adds https to bare domains", () => expect(normalizeUrl("example.com/a")).toBe("https://example.com/a"));
  it("keeps http(s), mailto and tel", () => { expect(normalizeUrl("http://x.io")).toBe("http://x.io/"); expect(normalizeUrl("me@x.io")).toBe("mailto:me@x.io"); expect(normalizeUrl("tel:+1 555 123 4567")).toBe("tel:+15551234567"); });
  it("blocks script and data schemes", () => { for (const u of ["javascript:alert(1)", "data:text/html,hi", "ftp://x.io", "vbscript:x", "localhost", ""]) expect(normalizeUrl(u), u).toBeNull(); });
  it("normalises social handles", () => { expect(normalizeSocial("email", "a@b.co")).toBe("mailto:a@b.co"); expect(normalizeSocial("whatsapp", "+1 (555) 123-4567")).toBe("https://wa.me/15551234567"); expect(normalizeSocial("x", "javascript:1")).toBeNull(); });
});
describe("sanitizePage", () => {
  const prev = newPage("u1", "ada", "Ada");
  it("drops unsafe urls and keeps server-owned counters", () => {
    const withClicks = { ...prev, links: [newBlock("link", { id: "abc12345", title: "A", url: "https://a.io/", clicks: 7 })] };
    const out = sanitizePage({ title: " New ", links: [{ id: "abc12345", type: "link", title: "A2", url: "https://a.io", clicks: 9999 }, { type: "link", title: "Bad", url: "javascript:alert(1)" }], views: 5000, handle: "evil", ownerId: "x" }, withClicks);
    expect(out.links[0]!.clicks).toBe(7); expect(out.links[1]!.url).toBe(""); expect(out.views).toBe(0); expect(out.ownerId).toBe("u1"); expect(out.handle).toBe("ada"); expect(out.title).toBe("New");
  });
  it("caps blocks, dedupes ids and validates enums", () => {
    expect(sanitizePage({ links: Array.from({ length: 80 }, () => ({ id: "same1234", title: "t", url: "https://a.io" })) }, prev).links).toHaveLength(1);
    expect(sanitizePage({ links: Array.from({ length: 300 }, (_, i) => ({ id: "id" + String(i).padStart(4, "0"), title: "t", url: "a.io" })) }, prev).links).toHaveLength(200);
    const o = sanitizePage({ design: { theme: "nope", button: { style: "neon", radius: 9, color: "red" }, header: "giant" }, links: [{ type: "weird", anim: "explode", lock: { kind: "laser" } }] }, prev);
    expect(o.design.theme).toBe("air"); expect(o.design.button.style).toBe("solid"); expect(o.design.button.color).toBe("#FFFFFF"); expect(o.design.header).toBe("classic");
    expect(o.links[0]!.type).toBe("link"); expect(o.links[0]!.anim).toBe("none"); expect(o.links[0]!.lock.kind).toBe("none");
  });
  it("only accepts small data-URL images", () => {
    expect(sanitizePage({ avatar: "https://evil.io/x.png" }, prev).avatar).toBe("");
    expect(sanitizePage({ avatar: "data:image/jpeg;base64,AAAA" }, prev).avatar).toBe("data:image/jpeg;base64,AAAA");
    expect(sanitizePage({ avatar: "data:image/svg+xml;base64,AAAA" }, prev).avatar).toBe("");
  });
  it("filters socials and drops duplicate platforms", () => expect(sanitizePage({ socials: [{ kind: "x", url: "x.com/a" }, { kind: "x", url: "x.com/b" }, { kind: "bogus", url: "x.com" }, { kind: "github", url: "javascript:1" }] }, prev).socials).toEqual([{ kind: "x", url: "https://x.com/a", enabled: true }]));
  it("keeps children only under real collections", () => {
    const o = sanitizePage({ links: [{ id: "coll0001", type: "collection", title: "C" }, { id: "kid00001", type: "link", url: "a.io", parent: "coll0001" }, { id: "kid00002", type: "link", url: "a.io", parent: "nope0001" }] }, prev);
    expect(o.links[1]!.parent).toBe("coll0001"); expect(o.links[2]!.parent).toBe("");
  });
  it("cleans settings and type data", () => {
    const o = sanitizePage({ settings: { pixels: { google: "<script>", facebook: "123" }, support: "climate", seo: { noindex: true } }, links: [{ type: "form", data: { kind: "poll", options: ["A", "", "B"], fields: ["email", "ssn"] } }] }, prev);
    expect(o.settings.pixels.google).toBe(""); expect(o.settings.pixels.facebook).toBe("123"); expect(o.settings.support).toBe("climate"); expect(o.settings.seo.noindex).toBe(true);
    expect(o.links[0]!.data).toMatchObject({ kind: "poll", options: ["A", "B"], fields: ["email"] });
  });
});
describe("visibility", () => {
  it("respects enabled, archive and schedule", () => {
    const now = Date.parse("2026-10-16T12:00:00Z");
    expect(isLive(newBlock("link"), now)).toBe(true); expect(isLive(newBlock("link", { enabled: false }), now)).toBe(false); expect(isLive(newBlock("link", { archived: true }), now)).toBe(false);
    expect(isLive(newBlock("link", { schedule: { start: "2026-10-17T00:00:00Z", end: "" } }), now)).toBe(false);
    expect(isLive(newBlock("link", { schedule: { start: "", end: "2026-10-16T11:00:00Z" } }), now)).toBe(false);
  });
  it("knows when a block is set up", () => { expect(isComplete(newBlock("link"))).toBe(false); expect(isComplete(newBlock("link", { url: "https://a.io/" }))).toBe(true); expect(isComplete(newBlock("faq", { data: { items: [{ q: "Q", a: "" }] } }))).toBe(true); });
});
describe("migration + themes", () => {
  it("upgrades v1 pages", () => {
    const v1 = { handle: "old", ownerId: "u", title: "Old", bio: "", avatar: "", theme: "lime", buttonStyle: "fill", shape: "pill", links: [{ id: "abcd1234", kind: "header", title: "H", url: "", enabled: true, clicks: 0 }, { id: "abcd1235", kind: "link", title: "L", url: "https://a.io/", enabled: true, clicks: 3 }], socials: [{ kind: "x", url: "https://x.com/a" }], views: 9, daily: {}, createdAt: "2026-01-01" };
    const p = migratePage(v1); expect(p.links[0]!.type).toBe("header"); expect(p.links[1]!.clicks).toBe(3); expect(p.socials[0]!.enabled).toBe(true); expect(p.design.wallpaper.style).toBeTruthy(); expect(p.onboarded).toBe(true); expect(p.pid).toBe("old");
    expect(migratePage(p)).toEqual(p);
  });
  it("has complete themes and applyTheme keeps the header", () => {
    for (const id of THEME_IDS) { expect(THEMES[id].d.button.color).toMatch(/^#[0-9A-F]{6}$/); expect(themeDesign(id).theme).toBe(id); }
    const d = { ...themeDesign("air"), header: "hero" as const, hideFooter: true }; const t = applyTheme(d, "vox"); expect(t.header).toBe("hero"); expect(t.hideFooter).toBe(true); expect(t.theme).toBe("vox");
  });
});
describe("embeds", () => {
  it("embeds known providers only", () => {
    expect(toEmbed("https://www.youtube.com/watch?v=aqz-KE-bpKQ")?.src).toBe("https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ");
    expect(toEmbed("https://open.spotify.com/track/abc123")?.h).toBe(152); expect(toEmbed("https://evil.example/page")).toBeNull();
    expect(sniff("youtu.be/aqz-KE-bpKQ").type).toBe("video"); expect(sniff("instagram.com/me").icon).toBe("instagram");
  });
});
describe("stats", () => {
  it("computes views, clicks, ctr and a zero-filled series", () => {
    const p = demoPage(); const s = stats(p); expect(s.series).toHaveLength(14); expect(s.views).toBe(612); expect(s.top[0]!.title).toMatch(/newsletter/);
    const q = newPage("u", "abc", "x"); bump(q, "v", "2026-10-14"); bump(q, "c", "2026-10-14"); const t = stats(q, 3, new Date("2026-10-14T12:00:00Z")); expect(t.series.at(-1)).toEqual({ day: "2026-10-14", v: 1, c: 1 });
  });
});
