import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
let P: typeof import("@/lib/pages"); let S: typeof import("@/lib/store"); let O: typeof import("@/lib/owned");
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "lt-")); P = await import("@/lib/pages"); S = await import("@/lib/store"); O = await import("@/lib/owned"); });
const user = (id: string, email: string, guest = false) => ({ id, name: email.split("@")[0]!, email, demo: false, guest });
describe("page store", () => {
  it("creates one page per owner with a unique handle", async () => {
    const a = await P.ensurePage(user("u1", "ada@x.io")); const again = await P.ensurePage(user("u1", "ada@x.io")); const b = await P.ensurePage(user("u2", "ada@y.io"));
    expect(again.handle).toBe(a.handle); expect(b.handle).not.toBe(a.handle);
  });
  it("uses the claimed handle for a new page only when it is valid and free", async () => {
    expect((await P.ensurePage(user("c1", "zed@x.io"), "claimed.one")).handle).toBe("claimed.one");
    expect((await P.ensurePage(user("c2", "amy@x.io"), "claimed.one")).handle).toBe("amy");
    expect((await P.ensurePage(user("c3", "bo@x.io"), "LOGIN")).handle).toBe("bopage");
    expect((await P.ensurePage(user("c1", "zed@x.io"), "other")).handle).toBe("claimed.one");
  });
  it("saves, renames and frees the old handle", async () => {
    const a = (await P.getPageByOwner("u1"))!; const r = await P.savePage("u1", { title: "Ada!", links: [{ type: "link", title: "Hi", url: "hi.io" }], handle: "ada.new" });
    expect(r.error).toBeUndefined(); expect(r.page!.handle).toBe("ada.new"); expect(await P.getPage(a.handle)).toBeNull(); expect(await P.handleAvailable(a.handle)).toBe(true);
    expect((await P.getPageByOwner("u1"))!.handle).toBe("ada.new");
    expect((await P.savePage("u2", { handle: "ada.new" })).error).toMatch(/taken/); expect((await P.savePage("u2", { handle: "login" })).error).toMatch(/reserved/);
  });
  it("counts clicks and views atomically and redirects only to stored urls", async () => {
    const p = (await P.getPageByOwner("u1"))!; const id = p.links[0]!.id; const v = { ref: "instagram", country: "US", device: "mobile", visitor: "abc" };
    const urls = await Promise.all(Array.from({ length: 25 }, () => P.recordClick(p.handle, id, undefined, v))); expect(urls.every(u => u === "https://hi.io/")).toBe(true);
    await Promise.all(Array.from({ length: 10 }, () => P.recordView(p.handle, v)));
    const q = (await P.getPage(p.handle))!; expect(q.links[0]!.clicks).toBe(25); expect(q.views).toBe(10);
    const ins = await P.getInsights(q.pid); const day = Object.values(ins.days)[0]!; expect(day.v).toBe(10); expect(day.c).toBe(25); expect(day.ref.instagram).toBe(10); expect(day.uv).toBe(1);
    expect(await P.recordClick(p.handle, "nope")).toBeNull();
    await P.savePage("u1", { links: [{ ...q.links[0], enabled: false }] }); expect(await P.recordClick(p.handle, id)).toBeNull();
  });
  it("enforces link locks", async () => {
    const p = (await P.getPageByOwner("u1"))!; await P.savePage("u1", { links: [{ id: "lock0001", type: "link", url: "https://x.io/", lock: { kind: "code", code: "42" } }, { id: "lock0002", type: "link", url: "https://y.io/", lock: { kind: "age", age: 18 } }] });
    expect(await P.recordClick(p.handle, "lock0001")).toEqual({ locked: true }); expect(await P.recordClick(p.handle, "lock0001", { code: "41" })).toEqual({ locked: true }); expect(await P.recordClick(p.handle, "lock0001", { code: "42" })).toBe("https://x.io/");
    expect(await P.recordClick(p.handle, "lock0002")).toEqual({ locked: true }); expect(await P.recordClick(p.handle, "lock0002", { ok: true })).toBe("https://y.io/");
    expect(await P.checkCode(p.handle, "lock0001", "42")).toBe(true);
  });
  it("adds UTM tags when turned on", async () => {
    const p = (await P.getPageByOwner("u1"))!; await P.savePage("u1", { settings: { utm: true }, links: [{ id: "utm00001", type: "link", title: "Spring Sale", url: "https://shop.io/a" }] });
    expect(await P.recordClick(p.handle, "utm00001")).toBe("https://shop.io/a?utm_source=linktreeisdead&utm_medium=social&utm_campaign=spring-sale");
  });
  it("moves a guest's page to their account on sign-in", async () => {
    const g = await P.ensurePage(user("g_guest1", "", true)); expect(g.handle).toMatch(/^guest/);
    await S.adoptGuestDocs("g_guest1", "acct9"); const mine = (await P.getPageByOwner("acct9"))!; expect(mine.handle).toBe(g.handle); expect(mine.ownerId).toBe("acct9");
  });
  it("stores contacts and short links", async () => {
    const p = (await P.getPageByOwner("u1"))!; await P.addContact(p.pid, { kind: "email", block: "", name: "", email: "a@b.co", phone: "", message: "", company: "", choice: "" });
    expect((await P.getContacts(p.pid)).items[0]!.email).toBe("a@b.co");
    const s = await O.createShort("u1", "example.com/x", "abc123"); expect(s.short!.url).toBe("https://example.com/x"); expect((await O.createShort("u2", "a.io", "abc123")).error).toMatch(/taken/);
    expect(await O.hitShort("abc123")).toBe("https://example.com/x"); expect((await O.listShorts("u1"))[0]!.clicks).toBe(1); expect(await O.deleteShort("u2", "abc123")).toBe(false);
  });
});
