"use client";
// Tiny dependency-free charts for Insights: paired view/click bars and ranked meters.
import { plural } from "@/components/admin/ui";
export function Bars({ series, height = 200, labels = true }: { series: { day: string; v: number; c: number }[]; height?: number; labels?: boolean }) {
  const max = Math.max(1, ...series.map(s => Math.max(s.v, s.c))); const step = Math.ceil(series.length / 14);
  return <div><div className="ad-bar" style={{ height }} role="img" aria-label="Views and clicks per day">{series.map((s, i) => <div key={s.day} title={`${new Date(s.day + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${plural(s.v, "view")}, ${plural(s.c, "click")}`}>
    <div className="ad-bar__pair"><i style={{ height: `${(s.v / max) * 100}%` }} /><i style={{ height: `${(s.c / max) * 100}%` }} /></div>
    {labels && <small style={{ visibility: i % step === 0 ? "visible" : "hidden" }}>{new Date(s.day + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small>}</div>)}</div>
    {labels && <div className="ad-legend"><span><i />Views</span><span><i />Clicks</span></div>}</div>;
}
export function Meters({ rows, empty, fmt = (k: string) => k }: { rows: [string, number][]; empty: string; fmt?: (k: string) => React.ReactNode }) {
  const total = rows.reduce((a, r) => a + r[1], 0); if (!rows.length) return <p className="ad-muted">{empty}</p>;
  return <div>{rows.map(([k, n]) => <div key={k} className="ad-meter"><b>{fmt(k)}</b><span className="ad-meter__t"><i style={{ width: `${(n / total) * 100}%` }} /></span><span>{Math.round((n / total) * 100)}%</span></div>)}</div>;
}
