// Server-side fetch of a user-supplied URL (RSS block) that can't be pointed at our own network: every hop's host is
// resolved and rejected if any address is private, loopback, link-local, ULA, CGNAT, multicast or IPv4-mapped/compat,
// and redirects are followed by hand (max 3) so each new location is checked the same way. The connecting socket uses the
// same check in its DNS lookup hook, so a rebinding answer between the check and the connect is refused too.
import { lookup } from "node:dns/promises";
import net from "node:net";

function v4Private(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number) as [number, number];
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}
/** Is this literal IP address somewhere a public fetch must never go? */
export function privateIp(ip: string): boolean {
  const kind = net.isIP(ip); if (kind === 4) return v4Private(ip); if (kind !== 6) return true;
  const x = ip.toLowerCase().replace(/^\[|\]$/g, "").split("%")[0]!;
  if (x === "::" || x === "::1") return true;
  const mapped = x.match(/^(?:0*:)*:?(?:ffff(?::0+)?:)?(\d+\.\d+\.\d+\.\d+)$/); if (mapped) return v4Private(mapped[1]!); // ::ffff:a.b.c.d, ::a.b.c.d
  const hexMapped = x.match(/^(?:0*:)*:?ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) { const hi = parseInt(hexMapped[1]!, 16), lo = parseInt(hexMapped[2]!, 16); return v4Private(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`); }
  const first = parseInt(x.split(":")[0] || "0", 16);
  return (first & 0xfe00) === 0xfc00 /* fc00::/7 ULA */ || (first & 0xffc0) === 0xfe80 /* link-local */ || (first & 0xff00) === 0xff00 /* multicast */ || x.startsWith("64:ff9b:") /* NAT64 */ || x.startsWith("2002:") /* 6to4 */ || first === 0;
}
/** Resolve a hostname and say whether it is safe to fetch (every address public). */
export async function publicHost(host: string, resolve = (h: string) => lookup(h, { all: true, verbatim: true })): Promise<boolean> {
  const h = host.replace(/^\[|\]$/g, "");
  if (!h || /^localhost$|\.localhost$|\.local$|\.internal$/i.test(h)) return false;
  if (net.isIP(h)) return !privateIp(h);
  try { const addrs = await resolve(h); return addrs.length > 0 && addrs.every(a => !privateIp(a.address)); } catch { return false; }
}
type Resolver = NonNullable<Parameters<typeof publicHost>[1]>;
/** The address the socket connects to is checked too (in the lookup hook), so DNS can't change its answer between check and connect. */
function guardedLookup(resolve: Resolver) {
  return (host: string, _o: unknown, cb: (err: Error | null, address: string | { address: string; family: number }[], family?: number) => void) => {
    resolve(host).then(addrs => { const bad = !addrs.length || addrs.some(a => privateIp(a.address)); if (bad) cb(new Error("blocked host"), ""); else if ((_o as { all?: boolean })?.all) cb(null, addrs); else cb(null, addrs[0]!.address, addrs[0]!.family); }, e => cb(e, ""));
  };
}
const defaultResolve: Resolver = h => lookup(h, { all: true, verbatim: true });
/** GET a public http(s) URL as text, following at most `maxHops` redirects and re-validating each hop. Throws when blocked. */
type Hop = (u: URL, headers: Record<string, string>, timeoutMs: number, maxBytes: number, resolve: Resolver) => Promise<{ status: number; location?: string; text: string }>;
export async function safeGetText(url: string, opts: { timeoutMs?: number; maxBytes?: number; headers?: Record<string, string>; maxHops?: number } = {}, resolve: Resolver = defaultResolve, hopFn: Hop = get): Promise<{ status: number; text: string }> {
  const { timeoutMs = 5000, maxBytes = 2_000_000, maxHops = 3 } = opts; const deadline = Date.now() + timeoutMs;
  let cur = new URL(url);
  for (let hop = 0; ; hop++) {
    if (cur.protocol !== "http:" && cur.protocol !== "https:") throw new Error("blocked scheme");
    if (cur.username || cur.password) throw new Error("blocked credentials");
    if (!(await publicHost(cur.hostname, resolve))) throw new Error("blocked host");
    const r = await hopFn(cur, opts.headers ?? {}, Math.max(1, deadline - Date.now()), maxBytes, resolve);
    if (r.status >= 300 && r.status < 400 && r.location) { if (hop >= maxHops) throw new Error("too many redirects"); cur = new URL(r.location, cur); continue; }
    return { status: r.status, text: r.text };
  }
}
async function get(u: URL, headers: Record<string, string>, timeoutMs: number, maxBytes: number, resolve: Resolver): Promise<{ status: number; location?: string; text: string }> {
  const mod = u.protocol === "https:" ? await import("node:https") : await import("node:http");
  return new Promise((res, rej) => {
    const req = mod.get(u, { headers: { "user-agent": "LinktreeIsDead-RSS/1.0", ...headers }, lookup: guardedLookup(resolve) as never, timeout: timeoutMs }, r => {
      const status = r.statusCode ?? 0; const location = r.headers.location;
      if (status >= 300 && status < 400) { r.resume(); return res({ status, location, text: "" }); }
      let size = 0; const chunks: Buffer[] = [];
      r.on("data", (c: Buffer) => { size += c.length; if (size > maxBytes) { chunks.push(c.subarray(0, Math.max(0, maxBytes - (size - c.length)))); r.destroy(); res({ status, text: Buffer.concat(chunks).toString("utf8") }); } else chunks.push(c); });
      r.on("end", () => res({ status, text: Buffer.concat(chunks).toString("utf8") })); r.on("error", rej);
    });
    req.on("timeout", () => req.destroy(new Error("timeout"))); req.on("error", rej);
    setTimeout(() => req.destroy(new Error("timeout")), timeoutMs).unref();
  });
}
