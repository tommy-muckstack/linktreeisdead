import { describe, it, expect } from "vitest";
import { validateHandle, slugifyHandle, normalizeUrl, sanitizePage, newPage, stats, bump, demoPage, THEME_IDS, THEMES } from "@/lib/model";
describe("handles", () => {
  it("accepts good handles", () => expect(validateHandle("ada.l_99")).toBeNull());
  it("rejects short, uppercase, reserved and edge punctuation", () => { for (const h of ["ab", "Ada", "login", ".abc", "abc_", "a b c"]) expect(validateHandle(h), h).toBeTruthy(); });
  it("slugifies an email local part", () => { expect(slugifyHandle("Ada.Lovelace+x")).toBe("ada.lovelacex"); expect(validateHandle(slugifyHandle("a"))).toBeNull(); });
});
describe("urls", () => {
  it("adds https to bare domains", () => expect(normalizeUrl("example.com/a")).toBe("https://example.com/a"));
  it("keeps http(s) and turns emails into mailto", () => { expect(normalizeUrl("http://x.io")).toBe("http://x.io/"); expect(normalizeUrl("me@x.io")).toBe("mailto:me@x.io"); });
  it("blocks script and data schemes", () => { for (const u of ["javascript:alert(1)", "data:text/html,hi", "ftp://x.io", "vbscript:x", "localhost", ""]) expect(normalizeUrl(u), u).toBeNull(); });
});
describe("sanitizePage", () => {
  const prev = newPage("u1", "ada", "Ada");
  it("drops unsafe links' urls and keeps server-owned counters", () => {
    const withClicks = { ...prev, links: [{ id: "abc12345", kind: "link" as const, title: "A", url: "https://a.io/", enabled: true, clicks: 7 }] };
    const out = sanitizePage({ title: " New ", links: [{ id: "abc12345", title: "A2", url: "https://a.io", clicks: 9999 }, { title: "Bad", url: "javascript:alert(1)" }], views: 5000, handle: "evil", ownerId: "x" }, withClicks);
    expect(out.links[0]!.clicks).toBe(7); expect(out.links[1]!.url).toBe(""); expect(out.views).toBe(0); expect(out.ownerId).toBe("u1"); expect(out.handle).toBe("ada"); expect(out.title).toBe("New");
  });
  it("caps links, dedupes ids and validates enums", () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ id: "same1234", title: "t" + i, url: "https://a.io" }));
    expect(sanitizePage({ links: many }, prev).links).toHaveLength(1);
    expect(sanitizePage({ links: Array.from({ length: 80 }, (_, i) => ({ id: "id" + String(i).padStart(4, "0"), title: "t", url: "a.io" })) }, prev).links).toHaveLength(50);
    const o = sanitizePage({ theme: "nope", shape: "triangle", buttonStyle: "soft" }, prev); expect(o.theme).toBe("lime"); expect(o.shape).toBe("pill"); expect(o.buttonStyle).toBe("soft");
  });
  it("only accepts small data-URL images as avatars", () => {
    expect(sanitizePage({ avatar: "https://evil.io/x.png" }, prev).avatar).toBe("");
    expect(sanitizePage({ avatar: "data:image/jpeg;base64,AAAA" }, prev).avatar).toBe("data:image/jpeg;base64,AAAA");
    expect(sanitizePage({ avatar: "data:image/svg+xml;base64,AAAA" }, prev).avatar).toBe("");
  });
  it("filters socials", () => expect(sanitizePage({ socials: [{ kind: "x", url: "x.com/a" }, { kind: "bogus", url: "x.com" }, { kind: "github", url: "javascript:1" }] }, prev).socials).toEqual([{ kind: "x", url: "https://x.com/a" }]));
});
describe("stats", () => {
  it("computes views, clicks, ctr and a zero-filled 14 day series", () => {
    const p = demoPage(); const s = stats(p); expect(s.series).toHaveLength(14); expect(s.views).toBe(612); expect(s.clicks).toBe(128 + 74 + 41 + 63 + 9); expect(s.top[0]!.title).toMatch(/newsletter/);
    const q = newPage("u", "abc", "x"); bump(q, "v", "2026-10-14"); bump(q, "c", "2026-10-14"); const t = stats(q, 3, new Date("2026-10-14T12:00:00Z")); expect(t.series.at(-1)).toEqual({ day: "2026-10-14", v: 1, c: 1 }); expect(t.series[0]!.v).toBe(0);
  });
  it("has complete themes", () => { for (const id of THEME_IDS) { expect(THEMES[id].bg).toBeTruthy(); expect(THEMES[id].btnBg).toMatch(/^#/); } });
});
