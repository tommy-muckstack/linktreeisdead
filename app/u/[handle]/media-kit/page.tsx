import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getPage, getInsights } from "@/lib/pages";
import { normalizeUrl } from "@/lib/model";
import { pageLockCookie, pageLockedFor } from "@/lib/publicpage";
import { PageLock } from "@/components/page/PageLock";
import { today } from "@/lib/model";
import { BP } from "@/lib/basepath";
import { SocialIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import "@/app/admin.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = await getPage((await params).handle); if (!p?.kit.public) return { title: "Not found", robots: { index: false } };
  return { title: pageLockedFor(p, (await cookies()).get(pageLockCookie(p.handle))?.value) ? "Locked page | LinktreeIsDead" : `${p.title}: media kit`, robots: { index: false } };
}
// Public media kit: only when the owner publishes it. Stats come from the page's own last-28-day insights.
export default async function MediaKit({ params }: { params: Promise<{ handle: string }> }) {
  const p = await getPage((await params).handle); if (!p || !p.kit.public) notFound();
  if (pageLockedFor(p, (await cookies()).get(pageLockCookie(p.handle))?.value)) return <PageLock handle={p.handle} />;
  const ins = await getInsights(p.pid); let v = 0, c = 0; for (let i = 0; i < 28; i++) { const d = ins.days[today(new Date(Date.now() - i * 864e5))]; v += d?.v ?? 0; c += d?.c ?? 0; }
  const contact = p.kit.contact; const href = normalizeUrl(contact); // email → mailto:, bare domain → https://, anything else (javascript: …) → no button
  return <div className="ad" style={{ minHeight: "100vh" }}><div className="ad-dbody" style={{ maxWidth: 720 }}>
    <div className="ad-tile" style={{ display: "flex", gap: 20, alignItems: "center" }}>{p.avatar ? <img src={p.avatar} alt="" style={{ width: 96, height: 96, borderRadius: 999, objectFit: "cover" }} /> : <Mark size={72} />}<div><h1 style={{ fontSize: 28 }}>{p.kit.headline || p.title}</h1><a href={`${BP}/u/${p.handle}`} className="ad-muted">{BP}/u/{p.handle}</a></div></div>
    {p.kit.about && <div className="ad-tile" style={{ marginTop: 16, whiteSpace: "pre-line" }}>{p.kit.about}</div>}
    {p.kit.showStats && <div className="ad-tiles" style={{ marginTop: 16 }}><div className="ad-tile ad-stat"><b>{v.toLocaleString()}</b><span>Page views, last 28 days</span></div><div className="ad-tile ad-stat"><b>{c.toLocaleString()}</b><span>Link clicks</span></div><div className="ad-tile ad-stat"><b>{v ? Math.round((c / v) * 1000) / 10 : 0}%</b><span>Click rate</span></div></div>}
    {p.kit.showLinks && p.socials.length > 0 && <div className="ad-tile" style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>{p.socials.filter(s => s.enabled).map(s => <a key={s.kind} href={s.url} target="_blank" rel="noreferrer" aria-label={s.kind}><SocialIcon kind={s.kind} s={28} /></a>)}</div>}
    {p.kit.rates.length > 0 && <div className="ad-tile" style={{ marginTop: 16 }}><h2 className="ad-sec">Rates</h2><table className="ad-table"><tbody>{p.kit.rates.map((r, i) => <tr key={i}><td>{r.label}</td><td style={{ textAlign: "right", fontWeight: 600 }}>{r.price}</td></tr>)}</tbody></table></div>}
    {href && <a className="ad-btn ad-btn--primary" style={{ marginTop: 20 }} href={href}>Work with me</a>}
    <p className="ad-help" style={{ marginTop: 32 }}>Stats measured by LinktreeIsDead from this page's own traffic.</p>
  </div></div>;
}
