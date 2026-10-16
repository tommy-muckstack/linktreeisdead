import { describe, it, expect } from "vitest";
import { EVENTS, EVENT_PREFIXES, APP } from "@/lib/analytics/taxonomy";
describe("analytics taxonomy", () => {
  it("uses the shared family prefixes and snake_case", () => { for (const e of Object.values(EVENTS)) { expect(e, e).toMatch(/^[a-z]+(_[a-z]+)+$/); expect(EVENT_PREFIXES.some(p => e.startsWith(p)), e).toBe(true); } });
  it("names the app", () => expect(APP).toBe("linktreeisdead"));
});
