// Review fixes: public view leaks, /go rate limit, short-link rules, guest adoption, handle races, torn reads.
import { describe, it, expect, beforeAll, vi } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
import { NextRequest } from "next/server";

const session = vi.hoisted(() => ({ user: null as null | { id: string; name: string; email: string; demo: boolean; guest: boolean } }));
vi.mock("@/lib/session", () => ({ currentUser: async () => session.user }));

let P: typeof import("@/lib/pages"); let S: typeof import("@/lib/store"); let O: typeof import("@/lib/owned"); let V: typeof import("@/lib/publicpage"); let I: typeof import("@/lib/images");
let dataDir = "";
beforeAll(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "lt-h-")); process.env["ISDEAD_DATA_DIR"] = dataDir;
  P = await import("@/lib/pages"); S = await import("@/lib/store"); O = await import("@/lib/owned"); V = await import("@/lib/publicpage"); I = await import("@/lib/images");
});
const user = (id: string, email: string, guest = false) => ({ id, name: email.split("@")[0] || "x", email, demo: false, guest });
const req = (url: string, init: { method?: string; body?: unknown; ip?: string } = {}) => new NextRequest("http://localhost" + url, { method: init.method ?? "GET", headers: { "x-forwarded-for": init.ip ?? "203.0.113.9", "content-type": "application/json" }, body: init.body === undefined ? undefined : JSON.stringify(init.body) });

describe("public view (1)", () => {
  it("sends only live links and blanks locked URLs; clicks need a live link", async () => {
    const p = await P.ensurePage(user("pv1", "pv@x.io")); const later = new Date(Date.now() + 864e5).toISOString(), past = new Date(Date.now() - 864e5).toISOString();
    await P.savePage("pv1", { links: [
      { id: "live0001", type: "link", url: "https://a.io/" }, { id: "off00001", type: "link", url: "https://off.io/", enabled: false },
      { id: "arch0001", type: "link", url: "https://arch.io/", archived: true }, { id: "soon0001", type: "link", url: "https://soon.io/", schedule: { start: later } },
      { id: "gone0001", type: "link", url: "https://gone.io/", schedule: { end: past } }, { id: "lock0001", type: "link", title: "Secret", url: "https://secret.io/", lock: { kind: "code", code: "77" } },
      { id: "age00001", type: "video", url: "https://youtu.be/aqz-KE-bpKQ", lock: { kind: "age", age: 18 } },
    ] });
    const pub = V.publicView((await P.getPage(p.handle))!); const json = JSON.stringify(pub);
    expect(pub.links.map(l => l.id)).toEqual(["live0001", "lock0001", "age00001"]);
    for (const leak of ["off.io", "arch.io", "soon.io", "gone.io", "secret.io", "aqz-KE-bpKQ", "\"77\""]) expect(json).not.toContain(leak);
    expect(pub.links.find(l => l.id === "live0001")!.url).toBe("https://a.io/");
    expect(await P.recordClick(p.handle, "soon0001")).toBeNull(); expect(await P.recordClick(p.handle, "gone0001")).toBeNull(); expect(await P.recordClick(p.handle, "off00001")).toBeNull();
    expect(await P.recordClick(p.handle, "lock0001", { code: "77" })).toBe("https://secret.io/");
  });
});

describe("/go code tries are rate limited (2) and redirect relatively (3)", () => {
  it("answers 429 after 20 code tries a minute from one IP", async () => {
    const { GET } = await import("@/app/go/[handle]/[id]/route");
    const p = (await P.getPageByOwner("pv1"))!; const params = Promise.resolve({ handle: p.handle, id: "lock0001" });
    const codes: number[] = []; for (let i = 0; i < 22; i++) codes.push((await GET(req(`/go/${p.handle}/lock0001?code=${i}`, { ip: "198.51.100.7" }), { params })).status);
    expect(codes.slice(0, 20).every(c => c === 302)).toBe(true); expect(codes.at(-1)).toBe(429);
    const back = await GET(req(`/go/${p.handle}/nope0001`, { ip: "198.51.100.8" }), { params: Promise.resolve({ handle: p.handle, id: "nope0001" }) });
    expect(back.headers.get("location")).toBe(`/linktreeisdead/u/${p.handle}`);
  });
  it("unknown short codes go home with a relative Location", async () => {
    const { GET } = await import("@/app/s/[code]/route");
    const r = await GET(req("/s/zzzz-none"), { params: Promise.resolve({ code: "zzzz-none" }) }); expect(r.status).toBe(307); expect(r.headers.get("location")).toBe("/linktreeisdead");
  });
});

describe("short links and uploads (4)", () => {
  it("guests get a sign-in prompt; accounts can create; brand/phishing back-halves are refused", async () => {
    const { POST } = await import("@/app/api/short/route");
    session.user = user("g_shortguest01", "", true);
    const g = await POST(req("/api/short", { method: "POST", body: { url: "example.com" } })); expect(g.status).toBe(401); expect((await g.json()).signIn).toBe(true);
    session.user = user("acct-s1", "s1@x.io");
    expect((await POST(req("/api/short", { method: "POST", body: { url: "example.com", code: "my-launch" }, ip: "192.0.2.50" }))).status).toBe(200);
    for (const bad of ["paypal-help", "Apple_ID", "secure-login", "verify-now", "mybank", "wallet"]) expect((await O.createShort("acct-s1", "example.com", bad)).error, bad).toMatch(/brand|bank|sign-in/);
    session.user = null;
  });
  it("limits short-link creation per IP", async () => {
    const { POST } = await import("@/app/api/short/route"); session.user = user("acct-s2", "s2@x.io");
    const st: number[] = []; for (let i = 0; i < 22; i++) st.push((await POST(req("/api/short", { method: "POST", body: { url: "example.com/" + i }, ip: "192.0.2.77" }))).status);
    expect(st.at(-1)).toBe(429); session.user = null;
  });
  it("guests have a small upload quota, accounts the full one", async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(100)]);
    for (let i = 0; i < I.GUEST_QUOTA.files; i++) expect((await I.putImage("g_quotaguest01", png)).url).toBeTruthy();
    const over = await I.putImage("g_quotaguest01", png); expect(over.url).toBeUndefined(); expect(over.signIn).toBe(true);
    for (let i = 0; i < I.GUEST_QUOTA.files + 1; i++) expect((await I.putImage("acct-q1", png)).url).toBeTruthy();
  });
});

describe("guest adoption (6)", () => {
  it("moves short links with the account: listed, deletable, owner rewritten; account delete removes them", async () => {
    const guest = "g_adoptguest001", acct = "acct-adopt";
    await P.ensurePage(user(guest, "", true)); const s = (await O.createShort(guest, "example.com/a", "adopt-me")).short!; expect(s.owner).toBe(guest);
    await S.adoptGuestDocs(guest, acct); await P.adoptGuestPage(guest, acct); await O.adoptGuestShorts(guest, acct);
    expect((await P.getPage((await P.getPageByOwner(acct))!.handle))!.ownerId).toBe(acct);
    const mine = await O.listShorts(acct); expect(mine.map(x => x.code)).toEqual(["adopt-me"]); expect(mine[0]!.owner).toBe(acct);
    await O.createShort(acct, "example.com/b", "adopt-two"); await O.deleteAllShorts(acct);
    expect(await S.getDoc("short", "adopt-me")).toBeNull(); expect(await S.getDoc("short", "adopt-two")).toBeNull(); expect(await O.listShorts(acct)).toEqual([]);
  });
  it("trusts index membership even if the owner rewrite never ran", async () => {
    await O.createShort("g_adoptguest002", "example.com/c", "adopt-three"); await S.adoptGuestDocs("g_adoptguest002", "acct-adopt2");
    expect((await O.listShorts("acct-adopt2")).length).toBe(1); expect(await O.deleteShort("g_adoptguest002", "adopt-three")).toBe(false); expect(await O.deleteShort("acct-adopt2", "adopt-three")).toBe(true);
  });
});

describe("handle collisions (7) and torn reads (8)", () => {
  it("two owners renaming to the same handle at once: exactly one wins", async () => {
    await P.ensurePage(user("race1", "race1@x.io")); await P.ensurePage(user("race2", "race2@x.io"));
    const [a, b] = await Promise.all([P.savePage("race1", { handle: "contested" }), P.savePage("race2", { handle: "contested" })]);
    expect([a.error, b.error].filter(Boolean)).toHaveLength(1); const winner = a.error ? "race2" : "race1";
    expect((await P.getPage("contested"))!.ownerId).toBe(winner);
  });
  it("concurrent new pages claiming the same handle get different handles", async () => {
    const pages = await Promise.all(["n1", "n2", "n3"].map(id => P.ensurePage(user(id, id + "@x.io"), "same.name")));
    expect(new Set(pages.map(p => p.handle)).size).toBe(3); expect(pages.filter(p => p.handle === "same.name")).toHaveLength(1);
  });
  it("never reassigns someone else's page through a stale index", async () => {
    const other = (await P.getPageByOwner("race1"))!; await S.putDoc("owners", "intruder", { handle: other.handle });
    expect(await P.getPageByOwner("intruder")).toBeNull(); expect((await P.getPage(other.handle))!.ownerId).toBe("race1");
  });
  it("a torn page read is an error (503), not a new page", async () => {
    const mine = await P.ensurePage(user("torn1", "torn1@x.io"));
    fs.writeFileSync(path.join(dataDir, "pages", mine.handle + ".json"), "{\"pid\":");
    await expect(P.getPageByOwner("torn1")).rejects.toBeInstanceOf(P.PageUnavailable);
    await expect(P.ensurePage(user("torn1", "torn1@x.io"))).rejects.toBeInstanceOf(P.PageUnavailable);
    expect((await S.getDoc<{ handle: string }>("owners", "torn1"))!.handle).toBe(mine.handle);
  });
  it("a dangling owner index (page gone) heals instead of locking the owner out", async () => {
    const mine = await P.ensurePage(user("dang1", "dang1@x.io")); await S.delDoc("pages", mine.handle);
    const fresh = await P.ensurePage(user("dang1", "dang1@x.io"));
    expect(fresh.ownerId).toBe("dang1"); expect((await S.getDoc<{ handle: string }>("owners", "dang1"))!.handle).toBe(fresh.handle);
    expect((await P.getPageByOwner("dang1"))!.handle).toBe(fresh.handle);
  });
  it("an index pointing at someone else's page gets its own page, never theirs", async () => {
    const other = (await P.getPageByOwner("race1"))!; await S.putDoc("owners", "intruder2", { handle: other.handle });
    const own = await P.ensurePage(user("intruder2", "intruder2@x.io"));
    expect(own.handle).not.toBe(other.handle); expect((await P.getPage(other.handle))!.ownerId).toBe("race1");
  });
});

describe("growth caps (9)", () => {
  it("keeps the newest contacts only", async () => {
    for (let i = 0; i < P.MAX_CONTACTS + 5; i++) await P.addContact("capped", { kind: "email", block: "", name: "", email: `${i}@x.io`, phone: "", message: "", company: "", choice: "" });
    const b = await P.getContacts("capped"); expect(b.items).toHaveLength(P.MAX_CONTACTS); expect(b.items[0]!.email).toBe(`${P.MAX_CONTACTS + 4}@x.io`);
  });
});
