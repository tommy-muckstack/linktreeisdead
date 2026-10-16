import { describe, it, expect } from "vitest";
import { authErrorMessage } from "@/lib/isdead-auth/client";
describe("authErrorMessage", () => {
  it("never shows Firebase's raw text", () => {
    for (const code of ["auth/network-request-failed", "auth/internal-error", "auth/some-new-code", "auth/popup-blocked", "auth/unauthorized-domain"]) {
      const m = authErrorMessage({ code, message: `Firebase: Error (${code}).` }); expect(m, code).not.toMatch(/firebase|auth\//i);
    }
    expect(authErrorMessage(new Error("Firebase: Error (auth/x)."))).toBe("Something went wrong. Try again.");
  });
  it("keeps our own server messages", () => expect(authErrorMessage(new Error("Sign-in failed. Try again."))).toBe("Sign-in failed. Try again."));
  it("maps common codes", () => { expect(authErrorMessage({ code: "auth/invalid-credential" })).toBe("Wrong email or password."); expect(authErrorMessage({ code: "auth/network-request-failed" })).toMatch(/connection/); });
});
