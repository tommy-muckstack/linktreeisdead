import { describe, it, expect } from "vitest";
import { EVENTS, EVENT_PREFIXES, APP, superProps } from "@/lib/analytics/taxonomy";
describe("analytics taxonomy", () => {
  it("uses the shared prefixes and snake_case", () => { for (const e of Object.values(EVENTS)) { expect(e, e).toMatch(/^[a-z]+(_[a-z]+)+$/); expect(EVENT_PREFIXES.some(p => e.startsWith(p)), e).toBe(true); } });
  it("never puts the product name in an event name", () => { for (const e of Object.values(EVENTS)) expect(e).not.toMatch(/linktree|^link_|^profile_/); });
  it("sends the hub's super properties", () => {
    expect(APP).toBe("linktreeisdead");
    expect(superProps("app")).toEqual({ product: "linktreeisdead", surface: "app", platform: "web" });
    expect(superProps("landing").surface).toBe("landing");
  });
});
import { scrub } from "@/lib/analytics/posthog";
describe("analytics privacy", () => {
  it("strips query strings, hashes, titles and editor ids", () => {
    const e = scrub({ event: "$pageview", properties: { $current_url: "https://yourappisdead.com/linktreeisdead/app/links/edit/abc123?x=1#y", $referrer: "https://google.com/search?q=me", title: "Someone's page" } });
    expect(e.properties.$current_url).toBe("https://yourappisdead.com/linktreeisdead/app/links/edit/:id");
    const f = scrub({ event: "$pageview", properties: { $session_entry_url: "https://a.io/x?q=1", $set_once: { $initial_current_url: "https://a.io/y?z=2#h", $initial_pathname: "/y?z" } }, $set: { $current_url: "https://a.io/z?k=3" } });
    expect(f.properties.$session_entry_url).toBe("https://a.io/x"); expect(f.properties.$set_once.$initial_current_url).toBe("https://a.io/y"); expect(f.properties.$set_once.$initial_pathname).toBe("/y"); expect(f.$set.$current_url).toBe("https://a.io/z"); expect(e.properties.$referrer).toBe("https://google.com/search"); expect("title" in e.properties).toBe(false);
  });
});

import fs from "node:fs"; import path from "node:path";
import { LEGACY_PROPS } from "@/lib/analytics/taxonomy";
describe("tracked properties", () => {
  // Older IsDead taxonomies persisted these as super properties in the shared cookie; boot unregisters them, so an event that
  // sends one (e.g. `source`) would be indistinguishable from that leftover. Scan every track()/trackNow() call's props.
  const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (["node_modules", ".next", "vendor", "tests"].includes(e.name) ? [] : files(path.join(d, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []);
  it("never uses a LEGACY_PROPS key", () => {
    const root = path.resolve(__dirname, "../.."); const bad: string[] = []; let calls = 0;
    for (const f of ["app", "components", "lib"].flatMap(d => files(path.join(root, d)))) {
      const src = fs.readFileSync(f, "utf8");
      for (const m of src.matchAll(/\btrack(?:Now)?\(\s*EVENTS\.\w+\s*,\s*\{([^}]*)\}/g)) {
        calls++;
        for (const k of m[1]!.matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*(?=[:,]|$)/g)) if ((LEGACY_PROPS as readonly string[]).includes(k[1]!)) bad.push(`${path.relative(root, f)}: ${k[1]}`);
      }
    }
    expect(calls).toBeGreaterThan(10); expect(bad).toEqual([]);
  });
});
