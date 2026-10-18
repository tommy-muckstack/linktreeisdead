"use client";
// Browser helpers: Firebase email/password + Google popup, then trade the ID token for the
// shared httpOnly session cookie at `sessionUrl` (each app exposes POST {idToken} → 204).
import type { FirebaseClientConfig } from "./config";
let cached: Promise<import("firebase/auth").Auth> | null = null;
export function clientAuth(config: FirebaseClientConfig) {
  if (!cached) cached = (async () => {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getAuth, inMemoryPersistence, setPersistence } = await import("firebase/auth");
    const app = getApps().find(a => a.name === "isdead") ?? initializeApp(config, "isdead");
    const auth = getAuth(app); await setPersistence(auth, inMemoryPersistence); // the server cookie is the source of truth
    return auth;
  })();
  return cached;
}
async function exchange(sessionUrl: string, idToken: string) {
  const r = await fetch(sessionUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }), credentials: "same-origin" });
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? "Could not start a session");
}
export async function signInWithEmail(config: FirebaseClientConfig, sessionUrl: string, email: string, password: string) {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const c = await signInWithEmailAndPassword(await clientAuth(config), email, password);
  await exchange(sessionUrl, await c.user.getIdToken());
}
export async function signUpWithEmail(config: FirebaseClientConfig, sessionUrl: string, email: string, password: string, name?: string) {
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
  const c = await createUserWithEmailAndPassword(await clientAuth(config), email, password);
  if (name) await updateProfile(c.user, { displayName: name });
  await exchange(sessionUrl, await c.user.getIdToken(true));
}
export async function signInWithGoogle(config: FirebaseClientConfig, sessionUrl: string) {
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const c = await signInWithPopup(await clientAuth(config), new GoogleAuthProvider());
  await exchange(sessionUrl, await c.user.getIdToken());
}
export async function resetPassword(config: FirebaseClientConfig, email: string) {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(await clientAuth(config), email);
}
/** Human-friendly message for a Firebase Auth error. Never shows Firebase's raw "Firebase: Error (auth/…)" text. */
export function authErrorMessage(e: any): string {
  const c = String(e?.code ?? "");
  if (/invalid-credential|wrong-password|user-not-found|invalid-login-credentials/.test(c)) return "Wrong email or password.";
  if (c.includes("email-already-in-use")) return "That email already has an account. Sign in instead.";
  if (c.includes("account-exists-with-different-credential")) return "That email already has an account with a different sign-in method. Try email and password, or the other button.";
  if (c.includes("weak-password")) return "Use at least 6 characters for your password.";
  if (c.includes("missing-password")) return "Enter your password.";
  if (c.includes("invalid-email") || c.includes("missing-email")) return "That email address doesn't look right.";
  if (/popup-closed|cancelled-popup-request|user-cancelled/.test(c)) return "Google sign-in was closed before it finished.";
  if (c.includes("popup-blocked")) return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
  if (c.includes("too-many-requests")) return "Too many attempts. Try again in a few minutes.";
  if (c.includes("user-disabled")) return "This account has been turned off.";
  if (/network-request-failed|timeout/.test(c)) return "Couldn't reach the sign-in service. Check your connection and try again.";
  if (c.includes("requires-recent-login")) return "For your security, sign in again and then retry.";
  if (/unauthorized-domain|operation-not-allowed|invalid-api-key|app-not-authorized|configuration-not-found/.test(c)) return "Sign-in isn't set up for this site yet. Try again later.";
  if (c.startsWith("auth/")) return "Sign-in didn't work. Try again.";
  const m = String(e?.message ?? "");
  return m && !/firebase|auth\//i.test(m) ? m : "Something went wrong. Try again.";
}
