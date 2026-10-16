"use client";
// Home ("My LinktreeIsDead"): greeting, your page card, the last week at a glance and the setup checklist.
import Link from "next/link";
import { BP } from "@/lib/basepath";
import { I } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { PageView } from "@/components/page/PageView";
import { useAdmin, useOrigin } from "@/components/admin/AdminProvider";
import { DashHead } from "@/components/admin/AdminChrome";
import { setupSteps } from "@/components/admin/setup";
import { useInsights } from "@/components/admin/useInsights";
import { Bars } from "@/components/admin/charts";
import { plural } from "@/components/admin/ui";

const useOriginHost = () => useOrigin().replace(/^https?:\/\//, "");
const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };
export function HomeDash() {
  const { page, user } = useAdmin(); const data = useInsights(7); const steps = setupSteps(page, user);
  const live = page.links.filter(l => !l.archived && l.type !== "header");
  return <>
    <DashHead title={`${greet()}, ${page.handle}`}><a className="ad-pillbtn" href={`${BP}/u/${page.handle}`} target="_blank" rel="noreferrer"><Mark size={18} />{(useOriginHost() + `${BP}/u/${page.handle}`)}<I n="external" s={16} /></a></DashHead>
    <div className="ad-dbody">
      <h2 className="ad-sec" style={{ fontSize: 20 }}>Your LinktreeIsDead</h2>
      <div className="ad-home__card">
        <Link href="/app/links" className="ad-home__prev" aria-label="Edit your page"><div className="ad-home__mini"><PageView page={page} mode="preview" frame="phone" /></div></Link>
        <div className="ad-home__meta"><b>{page.title || "@" + page.handle}</b><span>{plural(live.length, "link")}</span><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}><Link className="ad-btn ad-btn--primary" href="/app/links"><I n="pencil" s={16} />Edit page</Link><Link className="ad-btn ad-btn--secondary" href="/app/design"><I n="design" s={16} />Design</Link></div></div>
      </div>
      <h2 className="ad-sec" style={{ fontSize: 20, marginTop: 36 }}>In the last week</h2>
      <div className="ad-tiles" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Link href="/app/insights" className="ad-tile" style={{ textDecoration: "none" }}><div className="ad-row" style={{ minHeight: 0 }}><b>Visitors</b><span className="ad-muted">Last 7 days <I n="right" s={14} /></span></div>
          {data ? <><div className="ad-stat" style={{ margin: "8px 0" }}><b>{data.totals.views}</b><span>{plural(data.totals.views, "view")} · {plural(data.totals.clicks, "click")}</span></div><Bars series={data.series} height={120} /></> : <p className="ad-muted">Loading…</p>}</Link>
        <div className="ad-tile" id="setup"><div className="ad-row" style={{ minHeight: 0 }}><b>Setup checklist</b><span className="ad-muted">{steps.filter(s => s.done).length} of {steps.length}</span></div>
          <ul className="ad-checks">{steps.map(s => <li key={s.id} className={s.done ? "done" : ""}><span>{s.done ? <I n="check" s={14} w={2.4} /> : null}</span>{s.done ? s.label : <Link href={s.href}>{s.label}</Link>}</li>)}</ul></div>
      </div>
    </div>
  </>;
}
