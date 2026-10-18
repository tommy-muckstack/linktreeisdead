"use client";
// PostHog client for the IsDead family. Requests go through our own origin (/ingest → PostHog) so ad blockers don't
// drop them; the key is the project's publishable token. Without NEXT_PUBLIC_POSTHOG_KEY everything is a no-op.
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { superProps, LEGACY_PROPS, type EventName, type Surface } from "./taxonomy";
import { BP } from "@/lib/basepath";
type PH = typeof import("posthog-js").default;
let ph: PH | null = null; let loading: Promise<PH | null> | null = null;
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com";
export const analyticsEnabled = !!KEY;
// "app" = the editor plus what it publishes (public pages, short links); everything else is the marketing site.
const surfaceOf = (path: string): Surface => (/^\/(app|u|go|s)(\/|$)/.test(path.slice(BP.length)) ? "app" : "landing");

async function client(): Promise<PH | null> {
  if (!KEY || typeof window === "undefined") return null;
  if (ph) return ph;
  loading ??= import("posthog-js").then(m => {
    const p = m.default;
    const debug = process.env.NODE_ENV !== "production" && typeof localStorage !== "undefined" && localStorage.getItem("isdead_ph_debug") === "1"; // dev only: verbose logs + accept automated browsers (posthog-js drops bot/webdriver traffic by default)
    p.init(KEY, {
      api_host: `${location.origin}${BP}/ingest`, ui_host: UI_HOST,
      capture_pageview: false, capture_pageleave: true, autocapture: false, disable_session_recording: true, capture_heatmaps: false, capture_performance: false,
      persistence: "localStorage+cookie", person_profiles: "always", debug, opt_out_useragent_filter: debug,
    });
    // product/surface/platform are persisted super properties, so set them here or the hub's values (product=yourappisdead)
    // leak onto this app's events via the shared cookie.
    // Every IsDead app shares the yourappisdead.com cookie, so drop super properties other apps' older taxonomy left behind.
    for (const k of LEGACY_PROPS) p.unregister(k);
    p.register({ ...superProps(surfaceOf(location.pathname)), env: process.env.NODE_ENV === "production" ? "production" : "development" });
    ph = p; if (process.env.NODE_ENV !== "production") (window as unknown as { __posthog?: PH }).__posthog = p;
    return p;
  }).catch(err => { if (process.env.NODE_ENV !== "production") console.warn("[analytics] PostHog failed to start", err); return null; });
  return loading;
}
/** Fire a taxonomy event. Safe to call anywhere on the client; drops silently when analytics is off. */
export function track(event: EventName, props: Record<string, string | number | boolean | null | undefined> = {}) {
  void client().then(p => p?.capture(event, { surface: surfaceOf(location.pathname), ...props }));
}
/** Like track, but sent immediately; await it before navigating away (sign-in redirects). Never throws or hangs past 1.5s. */
export async function trackNow(event: EventName, props: Record<string, string | number | boolean | null | undefined> = {}) {
  await Promise.race([client().then(p => { p?.capture(event, { surface: surfaceOf(location.pathname), ...props }, { send_instantly: true }); }).catch(() => {}), new Promise(r => setTimeout(r, 1500))]);
}
export function identify(uid: string, props: { account_type: "firebase" | "demo" | "guest"; app?: string }) {
  void client().then(p => { if (!p) return; if (props.account_type === "firebase") p.identify(uid, { account_type: props.account_type }); else p.register({ account_type: props.account_type }); });
}
// reset() wipes super properties too, so put this app's back straight away.
export function resetIdentity() { void client().then(p => { p?.reset(); p?.register(superProps(surfaceOf(location.pathname))); }); }
/** Mount once in the root layout: boots the client and sends a page view per route change. */
export function Analytics() {
  const path = usePathname();
  useEffect(() => { if (!path) return; void client().then(p => { if (!p) return; p.register({ surface: surfaceOf(location.pathname) }); p.capture("$pageview", { $current_url: location.href.replace(/\/app\/links\/edit\/[a-z0-9]+/, "/app/links/edit/:id") }); }); }, [path]);
  return null;
}
