import { LpNav, LpPromo } from "@/components/LpNav";
import { LpFooter } from "@/components/LpFooter";
import { INFO } from "@/lib/info";
import "@/app/landing.css";

// Simple original pages for the nav menus and footer, in the homepage's shell.
export function InfoPage({ slug }: { slug: keyof typeof INFO }) {
  const pg = INFO[slug]!;
  return <div className="lp lp--info">
    <LpPromo />
    <header className="lp-hero lp-hero--info"><LpNav /><div className="lp-info__head"><h1>{pg.title}</h1><p>{pg.lede}</p></div></header>
    <main className="lp-info">{pg.sections.map(s => <section key={s.h} id={s.id}><h2>{s.h}</h2>{s.p.map((t, i) => <p key={i}>{t}</p>)}{s.li && <ul>{s.li.map(t => <li key={t}>{t}</li>)}</ul>}</section>)}</main>
    <LpFooter />
  </div>;
}
export const infoMeta = (slug: keyof typeof INFO) => ({ title: `${INFO[slug]!.title} | LinktreeIsDead`, description: INFO[slug]!.lede });
