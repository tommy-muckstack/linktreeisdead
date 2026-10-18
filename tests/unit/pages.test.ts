import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
let P: typeof import("@/lib/pages");
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "lt-")); P = await import("@/lib/pages"); });
const user = (id: string, email: string) => ({ id, name: email.split("@")[0]!, email, demo: false });
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
    const a = (await P.getPageByOwner("u1"))!; const r = await P.savePage("u1", { title: "Ada!", links: [{ title: "Hi", url: "hi.io" }], handle: "ada.new" });
    expect(r.error).toBeUndefined(); expect(r.page!.handle).toBe("ada.new"); expect(await P.getPage(a.handle)).toBeNull(); expect(await P.handleAvailable(a.handle)).toBe(true);
    expect((await P.savePage("u2", { handle: "ada.new" })).error).toMatch(/taken/);
    expect((await P.savePage("u2", { handle: "login" })).error).toMatch(/reserved/);
  });
  it("counts clicks and views atomically and redirects only to stored urls", async () => {
    const p = (await P.getPageByOwner("u1"))!; const id = p.links[0]!.id;
    const urls = await Promise.all(Array.from({ length: 25 }, () => P.recordClick(p.handle, id))); expect(urls.every(u => u === "https://hi.io/")).toBe(true);
    await Promise.all(Array.from({ length: 10 }, () => P.recordView(p.handle)));
    const q = (await P.getPage(p.handle))!; expect(q.links[0]!.clicks).toBe(25); expect(q.views).toBe(10);
    expect(await P.recordClick(p.handle, "nope")).toBeNull();
    await P.savePage("u1", { links: [{ ...q.links[0], enabled: false }] }); expect(await P.recordClick(p.handle, id)).toBeNull();
  });
});
