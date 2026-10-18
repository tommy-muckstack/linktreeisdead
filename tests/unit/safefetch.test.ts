// RSS proxy SSRF guard (10): private ranges, DNS answers, and redirects re-checked hop by hop.
import { describe, it, expect, afterAll } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { privateIp, publicHost, safeGetText } from "@/lib/safefetch";

describe("privateIp", () => {
  it("rejects private, loopback, link-local, ULA, CGNAT and IPv4-mapped addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:169.254.169.254", "::127.0.0.1", "64:ff9b::a00:1", "ff02::1"]) expect(privateIp(ip), ip).toBe(true);
  });
  it("allows public addresses", () => { for (const ip of ["93.184.216.34", "8.8.8.8", "172.32.0.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"]) expect(privateIp(ip), ip).toBe(false); });
});

describe("publicHost", () => {
  const dns = (map: Record<string, string[]>) => async (h: string) => (map[h] ?? []).map(address => ({ address, family: address.includes(":") ? 6 : 4 }));
  it("rejects names that resolve to any private address, and localhost names", async () => {
    expect(await publicHost("evil.example", dns({ "evil.example": ["93.184.216.34", "10.0.0.5"] }))).toBe(false);
    expect(await publicHost("meta.example", dns({ "meta.example": ["169.254.169.254"] }))).toBe(false);
    expect(await publicHost("localhost")).toBe(false); expect(await publicHost("api.localhost")).toBe(false); expect(await publicHost("[::1]")).toBe(false);
    expect(await publicHost("ok.example", dns({ "ok.example": ["93.184.216.34"] }))).toBe(true);
    expect(await publicHost("nx.example", dns({}))).toBe(false);
  });
});

describe("safeGetText", () => {
  let hits: string[] = [];
  const server = http.createServer((q, r) => {
    hits.push(q.url ?? "");
    if (q.url === "/to-private") { r.writeHead(302, { location: "http://127.0.0.1:1/secret" }); return r.end(); }
    if (q.url?.startsWith("/loop")) { r.writeHead(302, { location: "/loop" + (Number(q.url.slice(5) || 0) + 1) }); return r.end(); }
    if (q.url === "/hop") { r.writeHead(301, { location: "/feed" }); return r.end(); }
    r.writeHead(200, { "content-type": "application/rss+xml" }); r.end("<rss><item><title>Hi</title><link>https://a.io/</link></item></rss>");
  });
  const port = () => (server.address() as AddressInfo).port;
  // Pretend "feeds.test" is a public host that happens to live on this machine (the test server).
  const viaLocal = async (h: string) => (h === "feeds.test" ? [{ address: "127.0.0.1", family: 4 }] : []);
  afterAll(() => server.close());
  it("refuses a host whose DNS answer is private (also at connect time)", async () => {
    await new Promise<void>(r => server.listen(0, "127.0.0.1", () => r()));
    await expect(safeGetText(`http://feeds.test:${port()}/feed`, {}, viaLocal)).rejects.toThrow(/blocked/);
    await expect(safeGetText(`http://127.0.0.1:${port()}/feed`)).rejects.toThrow(/blocked/);
    expect(hits).toEqual([]);
  });
  it("re-checks every redirect hop and caps hops at 3", async () => {
    const pub = async (h: string) => (h.endsWith(".test") ? [{ address: "93.184.216.34", family: 4 }] : h === "inside.corp" ? [{ address: "10.0.0.8", family: 4 }] : []);
    const seen: string[] = [];
    const fake = async (u: URL) => { seen.push(u.href); const m: Record<string, string> = { "/a": "https://b.test/b", "/b": "/feed", "/evil": "http://inside.corp/admin", "/meta": "http://169.254.169.254/latest", "/l0": "/l1", "/l1": "/l2", "/l2": "/l3", "/l3": "/l4" }; const loc = m[u.pathname]; return loc ? { status: 302, location: loc, text: "" } : { status: 200, text: "ok:" + u.href }; };
    expect((await safeGetText("https://a.test/a", {}, pub, fake)).text).toBe("ok:https://b.test/feed");
    await expect(safeGetText("https://a.test/evil", {}, pub, fake)).rejects.toThrow(/blocked/);
    await expect(safeGetText("https://a.test/meta", {}, pub, fake)).rejects.toThrow(/blocked/);
    await expect(safeGetText("https://a.test/l0", {}, pub, fake)).rejects.toThrow(/too many redirects/);
    await expect(safeGetText("file:///etc/passwd", {}, pub, fake)).rejects.toThrow(/blocked/);
    expect(seen).not.toContain("http://inside.corp/admin");
  });
  it("refuses at connect time when DNS changes its answer after the check (rebinding)", async () => {
    let n = 0; const twoFaced = async (h: string) => (h === "feeds.test" ? [{ address: n++ === 0 ? "93.184.216.34" : "127.0.0.1", family: 4 }] : []);
    await expect(safeGetText(`http://feeds.test:${port()}/feed`, {}, twoFaced)).rejects.toThrow(/blocked/);
    expect(hits).toEqual([]);
  });
});
