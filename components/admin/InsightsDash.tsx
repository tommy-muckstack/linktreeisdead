"use client";
// Insights: date range, views / clicks / contacts, activity chart, traffic sources, locations, devices, top links, lifetime totals.
import { useState } from "react";
import { I, SocialIcon } from "@/components/icons";
import { DashHead } from "@/components/admin/AdminChrome";
import { useInsights } from "@/components/admin/useInsights";
import { Bars, Meters } from "@/components/admin/charts";
import { useAdmin } from "@/components/admin/AdminProvider";

const RANGES = [[7, "Last 7 days"], [28, "Last 28 days"], [90, "Last 90 days"], [365, "Last 365 days"]] as const;
const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0);
const flag = (cc: string) => cc.length === 2 && cc !== "??" ? String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt(0))) : "🌐";
const region = (cc: string) => { try { return cc === "??" ? "Unknown" : new Intl.DisplayNames(undefined, { type: "region" }).of(cc) ?? cc; } catch { return cc; } };
const SOCIAL_SOURCES = new Set(["instagram", "tiktok", "youtube", "x", "facebook", "threads", "linkedin", "pinterest", "snapchat", "bluesky"]);
export function InsightsDash() {
  const [days, setDays] = useState(7); const d = useInsights(days); const { page } = useAdmin();
  const stat = (n: string, label: string, v: number, prev?: number, suffix = "") => <div className="ad-tile ad-stat"><I n={n} s={22} /><b>{v.toLocaleString()}{suffix}</b><span>{label}{prev !== undefined && <em className={"ad-delta" + (v >= prev ? " up" : " down")}>{v >= prev ? "▲" : "▼"} {Math.abs(delta(v, prev))}%</em>}</span></div>;
  return <>
    <DashHead title="Insights"><select className="ad-input" style={{ width: 170 }} aria-label="Date range" value={days} onChange={e => setDays(Number(e.target.value))}>{RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></DashHead>
    <div className="ad-dbody ad-dbody--wide">
      {!d ? <p className="ad-muted">Loading…</p> : <>
        <div className="ad-tiles">{stat("eye", "Views", d.totals.views, d.prev.views)}{stat("cursor", "Clicks", d.totals.clicks, d.prev.clicks)}{stat("users", "Unique visitors", d.totals.uv, d.prev.uv)}{stat("user", "New contacts", d.totals.contacts)}</div>
        <div className="ad-tile" style={{ marginTop: 16 }}><div className="ad-row" style={{ minHeight: 0 }}><b>Activity</b><span className="ad-muted">Click rate {d.totals.ctr}%</span></div>{d.totals.views + d.totals.clicks === 0 ? <div className="ad-empty" style={{ padding: 24 }}><p>No activity during this time. Share your page to start seeing visits.</p></div> : <Bars series={d.series} />}</div>
        <div className="ad-tiles" style={{ marginTop: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          <div className="ad-tile"><b>Top traffic sources</b><Meters rows={d.refs} empty="No visits during this time." fmt={k => <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>{SOCIAL_SOURCES.has(k) ? <SocialIcon kind={k} s={16} /> : <I n={k === "direct" ? "link" : "globe"} s={16} />}{k === "direct" ? "Direct" : k[0]!.toUpperCase() + k.slice(1)}</span>} /></div>
          <div className="ad-tile"><b>Most clicked links</b>{d.links.length ? <table className="ad-table"><tbody>{d.links.slice(0, 8).map(l => <tr key={l.id}><td>{l.title || "Untitled"}</td><td style={{ textAlign: "right", fontWeight: 600 }}>{l.clicks}</td></tr>)}</tbody></table> : <p className="ad-muted">No clicks during this time.</p>}</div>
          <div className="ad-tile"><b>Visitor locations</b><Meters rows={d.geo} empty="No visits during this time." fmt={k => <span>{flag(k)} {region(k)}</span>} /></div>
          <div className="ad-tile"><b>Devices</b><Meters rows={d.dev.filter(([k]) => k)} empty="No visits during this time." fmt={k => <span style={{ textTransform: "capitalize" }}>{k}</span>} /></div>
        </div>
        <h2 className="ad-sec" style={{ fontSize: 20, marginTop: 32 }}>Lifetime totals</h2>
        <div className="ad-tile ad-life">{[["eye", d.lifetime.views, "Views"], ["cursor", d.lifetime.clicks, "Clicks"], ["percent", d.lifetime.ctr + "%", "Click rate"], ["user", d.lifetime.contacts, "Contacts"]].map(([n, v, l]) => <div key={l as string}><I n={n as string} s={22} /><b>{typeof v === "number" ? v.toLocaleString() : v}</b><span>{l}</span></div>)}</div>
        <p className="ad-help" style={{ marginTop: 16 }}>Bots and link previews aren't counted. Unique visitors are estimated per day without cookies. Page: /u/{page.handle}</p>
      </>}
    </div>
  </>;
}
