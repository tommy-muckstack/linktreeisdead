import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
let I: typeof import("@/lib/images"); let P: typeof import("@/lib/pages");
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "lt-img-")); I = await import("@/lib/images"); P = await import("@/lib/pages"); });
describe("uploads", () => {
  it("stores by magic bytes and serves back", async () => {
    const r = await I.putImage("o1", PNG); expect(r.url).toMatch(/\/img\/[A-Za-z0-9_-]{20}$/);
    const f = await I.getImage(I.imgIdOf(r.url!)!); expect(f!.type).toBe("image/png"); expect(f!.bytes.equals(PNG)).toBe(true);
  });
  it("rejects non-images, empty and oversized files", async () => {
    expect((await I.putImage("o1", Buffer.from("<svg onload=alert(1)>"))).error).toMatch(/JPEG/);
    expect((await I.putImage("o1", Buffer.alloc(0))).error).toBeTruthy();
    expect((await I.putImage("o1", Buffer.concat([PNG, Buffer.alloc(I.MAX_IMAGE)]))).error).toMatch(/too big/);
    expect(await I.getImage("../../etc/passwd")).toBeNull();
  });
  it("moves inline images out of the page on save and cleans up unused ones", async () => {
    const u = { id: "o2", name: "o2", email: "o2@x.io", demo: false };
    await P.ensurePage(u); const data = "data:image/png;base64," + PNG.toString("base64");
    const r = await P.savePage("o2", { avatar: data, links: [{ type: "gallery", data: { images: [{ src: data }] } }] });
    expect(r.page!.avatar).toMatch(/\/img\//); expect((r.page!.links[0]!.data.images as { src: string }[])[0]!.src).toMatch(/\/img\//);
    const keep = I.imgIdOf(r.page!.avatar)!; const orphan = I.imgIdOf((await I.putImage("o2", PNG)).url!)!;
    expect(await I.collectGarbage("o2", I.referencedIds(r.page), 0)).toBe(1);
    expect(await I.getImage(orphan)).toBeNull(); expect(await I.getImage(keep)).not.toBeNull();
  });
});
