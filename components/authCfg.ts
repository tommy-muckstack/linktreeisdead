import type { AuthCfg } from "@/components/AuthScreen";
export const authCfg: AuthCfg = { layout: "splitL", accent: "#8129d9", ctaBg: "#d2e823", ctaFg: "#1e2330", radius: 8, ink: "#1e2330", muted: "#676b5f",
  title: "Welcome back", signupTitle: "Join in seconds", sub: "Log in to your link page", signupSub: "Create your free link page today", emailLabel: "Email or username", providersAfter: true, emailFirst: true,
  providers: [{ id: "google", label: "Continue with Google" }, { id: "apple", label: "Continue with Apple" }], ctaNext: "Continue", cta: "Log in",
  art: { kind: "color", bg: "#2f3bff", fg: "#fff", title: "Everything you are, in one simple link", sub: "Share your links, grow your audience, and earn.", blocks: ["#d2e823", "#ff7a59", "#ffffff", "#fcb1e3"] }, switchText: ["Don't have an account?", "Sign up"] };
