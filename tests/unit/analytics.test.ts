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
    expect(e.properties.$current_url).toBe("https://yourappisdead.com/linktreeisdead/app/links/edit/:id"); expect(e.properties.$referrer).toBe("https://google.com/search"); expect("title" in e.properties).toBe(false);
  });
});
