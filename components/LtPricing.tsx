"use client";
import Link from "next/link";
import { useState } from "react";
import data from "@/lib/ltPricingData.json";
import "@/app/lt-pricing.css";

// Bespoke recreation of linktr.ee/s/pricing below the nav (everything between the nav and the footer).
// Copy follows the original page; all art is original CSS (no brand photos or logos).
const Check = ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Cross = () => <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 2l8 8M10 2l-8 8" stroke="#9a9d93" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const Chev = ({ open }: { open?: boolean }) => <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }}><path d="M1 1l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;

const plans = [
  { name: "Starter", price: "$6", alt: "$8", cta: "Get started", lead: "Everything in Free, plus:", feats: ["Personalized Linktree", "Unlimited featured links", "Basic analytics"] },
  { name: "Pro", price: "$12", alt: "$15", cta: "Try free for 7 days", hot: true, lead: "Everything in Starter, plus:", feats: ["Remove Linktree branding", "Custom designs", "Sell and earn with 0% fees", "Mailing list integrations"] },
  { name: "Premium", price: "$30", alt: "$35", cta: "Try free for 7 days", lead: "Everything in Pro, plus:", feats: ["Link rules and routing", "AI integrations", "All-time analytics", "Data export", "Social media scheduling", "Unlimited Instagram auto-replies"] },
];
const quotes: [string, string][] = [
  ["My page looks great and my followers find everything in one tap. Simple to set up and easy to keep tidy.", "An early user"],
  ["One place to point people to my music, my shop and my newsletter. It makes sharing a lot less fiddly.", "A community member"],
  ["I use it as a control center for all my projects. A concise page, with a wide variety of links.", "An early user"],
  ["Sharing a link to everything I make is quick, and the page loads fast on any phone.", "A community member"],
  ["The click analytics show me which links people actually use, so I know what to promote.", "An early user"],
];
const tiles: [string, string, string, string][] = [
  ["/yourband", "#fff", "#1e2330", "24px"], ["/yourstudio", "#c98b7e", "#fff", "24px"], ["/yourpodcast", "#0b0b24", "#9ec1ff", "999px"], ["/yourshop", "#050505", "#fff", "24px"], ["/yournewsletter", "#e8e0c2", "#1e2330", "24px"], ["/yourartist", "#2a2f6b", "#fff", "999px 999px 24px 24px"], ["/yourcoach", "#d2e823", "#1e2330", "24px"],
];
const earn: [string, string, string][] = [["Digital products", "Instant checkout, no extra tools", "Requires separate storefront"], ["Online courses", "Kajabi-powered, no extra account needed", "Monthly fees, complex setup"], ["Sponsored links", "Built-in traffic monetization", "No native monetization"], ["Affiliate commissions", "Industry-leading commissions", "Lower commission payouts"], ["Setup time", "Minutes", "Hours or days"]];
const growth: [string, string, string][] = [["Stay consistent on social", "Schedule social posts to go live across platforms and never miss a posting day again.", "sched"], ["Grow your email list", "Collect emails on your Linktree so you can stay connected on and off social platforms.", "email"], ["Use insights to optimize", "Get deep insights into your audience and optimize your Linktree for more clicks and engagement.", "insights"]];
const more: [string, string, string][] = [["Enhanced Customization", "From video backgrounds to removing the Linktree logo: get even more power to make your page pop.", "pink"], ["Extended Analytics", "See what’s performing and download extensive analytics to shape your Linktree for success.", "lime"], ["Email & SMS Integrations", "Build an audience you reach anywhere, any time by collecting email and SMS details on your Linktree.", "maroon"]];
const tabs = ["Links & Buttons", "Monetization", "Customization", "Insights", "Marketing Tech", "Management"];
const cols = [{ n: "Free", p: "$0", u: "forever", cta: "Join for free" }, { n: "Starter", p: "$6", u: "USD/mo", cta: "Get Starter" }, { n: "Pro", p: "$12", u: "USD/mo", cta: "Try Pro for free", hot: true }, { n: "Premium", p: "$30", u: "USD/mo", cta: "Get Premium" }];

function Art({ k }: { k: string }) {
  if (k === "sched") return <div className="ltp-art ltp-art--sched"><i className="a" /><i className="b" /><span><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="#1e2330" strokeWidth="2" /><path d="M12 7v5l3 2" fill="none" stroke="#1e2330" strokeWidth="2" /></svg>Scheduled</span></div>;
  if (k === "email") return <div className="ltp-art ltp-art--email"><div className="f"><b>Add a question</b><em /><em /><em /><u>Save</u></div><div className="m"><b>23</b><small>Messages received</small></div></div>;
  if (k === "insights") return <div className="ltp-art ltp-art--ins"><span><i />Views</span><span><i className="d" />Email Subscribers</span><svg viewBox="0 0 220 110" aria-hidden><path d="M0 110V70L35 20 70 80 100 30 130 85 160 60 190 75 220 70V110Z" fill="#d2e823" /><path d="M0 110V95L40 80 80 100 120 85 160 92 200 78 220 85V110Z" fill="#5a6a2e" /></svg></div>;
  if (k === "pink") return <div className="ltp-art ltp-art--themes"><i /><i /><i /><b>Aa</b><p><s style={{ background: "#ff4d5e" }} /><s style={{ background: "#e11bd6" }} /><s style={{ background: "#2665d6" }} /><s style={{ background: "#00a5c0" }} /></p></div>;
  if (k === "lime") return <div className="ltp-art ltp-art--an"><span>Views</span><span className="k">Clicks</span><svg viewBox="0 0 220 110" aria-hidden><path d="M0 105L30 40 55 70 85 10 120 80 150 45 190 80 220 60V110H0Z" fill="#e9c0e9" /><path d="M0 110V95L45 85 90 100 140 82 180 95 220 90V110Z" fill="#1d4a1a" /></svg></div>;
  return <div className="ltp-art ltp-art--sub"><div><u /><b>Subscribe for updates</b><em>Email address</em></div></div>;
}

export function LtPricing() {
  const [q, setQ] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState(0);
  const [faq, setFaq] = useState<number | null>(null);
  const groups = data.groups as [string, [string, (string | number)[], string][]][];
  return <div className="ltp">
    <section className="ltp-hero">
      <h1>Pick your plan. Make it yours.</h1><p className="ltp-sub">Simple pricing with powerful features, cancel anytime.</p>
      <div className="ltp-plans"><article className="ltp-plan ltp-plan--free"><header><h3>Free</h3></header><div className="ltp-plan__b"><div className="ltp-price"><b>$0</b><span>forever</span></div><p className="ltp-bill">Everything you need to start</p><Link className="ltp-pbtn" href="/login?mode=signup">Get started</Link><hr /><h5>Includes:</h5><ul><li><i><Check s={10} /></i>Unlimited basic links</li><li><i><Check s={10} /></i>Email and phone sign-ups</li></ul></div></article>{plans.map(p => <article key={p.name} className={"ltp-plan" + (p.hot ? " is-hot" : "")}>
        {p.hot && <span className="ltp-rec"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="currentColor" /></svg>Recommended</span>}
        <header><h3>{p.name}</h3></header>
        <div className="ltp-plan__b"><div className="ltp-price"><b>{p.price}</b><span>/mo</span></div><p className="ltp-bill">Billed annually, or {p.alt} monthly</p>
          <Link className="ltp-pbtn" href="/login?mode=signup">{p.cta}</Link><hr /><h5>{p.lead}</h5>
          <ul>{p.feats.map(f => <li key={f}><i><Check s={10} /></i>{f}</li>)}</ul></div></article>)}</div>
      <div className="ltp-quote"><blockquote><p>“{quotes[q][0]}”</p><cite>{quotes[q][1]}</cite><small>Pro member</small></blockquote>
        <div className="ltp-qnav"><span><b>{q + 1}</b> / {quotes.length}</span><button aria-label="Previous" onClick={() => setQ((q + quotes.length - 1) % quotes.length)}>‹</button><button aria-label="Next" onClick={() => setQ((q + 1) % quotes.length)}>›</button></div></div>
      <div className="ltp-wide"><div><h3>Agency or Enterprise</h3><p>Get team seats, dedicated support, and custom contracts</p></div><Link className="ltp-obtn" href="/login">Get in touch <span aria-hidden>→</span></Link></div>
      <div className="ltp-wide ltp-wide--free"><div><h3>Free</h3><ul><li><i><Check s={10} /></i>Unlimited basic links</li><li><i><Check s={10} /></i>Email and phone sign-ups</li></ul></div><Link className="ltp-obtn" href="/login?mode=signup">Get started</Link></div>
    </section>
    <div className="ltp-explore"><a href="#ltp-features">Explore all features <span aria-hidden>↓</span></a></div>

    <section className="ltp-trust"><h2>The only link in bio trusted by 70M+<br /><em>musicians</em></h2>
      <p>Never update your link in bio again. Use one link to share everything you create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.</p>
      <div className="ltp-marq"><div>{[...tiles, ...tiles].map(([h, bg, fg, r], i) => <i key={i} style={{ background: bg, color: fg, borderRadius: r }}><b>{h}</b></i>)}</div></div></section>

    <section className="ltp-growth"><small>MANAGE YOUR AUDIENCE</small><h2>Your growth starts here.</h2>
      <p>Manage your entire online following on Linktree. Schedule your social posts, grow your email list, track visitors and get even more followers.</p>
      <div className="ltp-cards">{growth.map(([t, d, k]) => <article key={t}><div className="ltp-cards__art"><Art k={k} /></div><h3>{t}</h3><p>{d}</p></article>)}</div>
      <Link className="ltp-dark" href="/login?mode=signup">Get started for free</Link></section>

    <section className="ltp-earn"><h2>Get more ways to earn.</h2><p className="ltp-earn__s">Linktree gives you multiple ways to monetize your platform without complicated setups or high platform fees.</p>
      <div className="ltp-et"><div className="ltp-et__h"><span /><b>Linktree Earn</b><b>Other Platforms</b></div>
        {earn.map(([a, b, c]) => <div key={a} className="ltp-et__r"><strong>{a}</strong><span><i className="ok">✓</i>{b}</span><span><i className="no">✗</i>{c}</span></div>)}</div>
      <p className="ltp-earn__n">Some features are not available to all users. See here for more details.<br />**Transaction and processing fees may apply. See here for more details.</p></section>

    <section className="ltp-feat" id="ltp-features"><h2>All Features</h2>
      <div className="ltp-tbl">
        <div className="ltp-tbl__h"><span />{cols.map(c => <div key={c.n} className={c.hot ? "hot" : ""}>{c.hot && <em>7-day free trial</em>}<h4>{c.n}</h4><p><b>{c.p}</b> <small>{c.u}</small></p><Link href="/login?mode=signup" className={c.hot ? "o" : ""}>{c.cta}</Link></div>)}</div>
        <div className="ltp-tbl__b">
          <nav className="ltp-tabs"><div>{tabs.map((t, i) => <a key={t} href={`#ltp-g${i}`} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>{t}</a>)}</div></nav>
          <div className="ltp-tbl__c">{groups.map(([g, rows], gi) => <div key={g} id={`ltp-g${gi}`} className="ltp-grp">{rows.map(([label, cells, desc]) => { const k = g + label; const o = !!open[k]; return <div key={k} className="ltp-row">
            <div className="ltp-row__l"><button type="button" aria-expanded={o} onClick={() => setOpen({ ...open, [k]: !o })}><span className="ch"><Chev open={o} /></span><span>{label}</span></button>{o && <p>{desc}</p>}</div>
            {cells.map((c, ci) => <div key={ci} data-plan={cols[ci].n} className={"ltp-row__c" + (ci === 2 ? " hot" : "") + (typeof c === "string" ? " t" : "")}>{c === 1 ? <Check /> : c === 0 ? <Cross /> : <small>{c}</small>}</div>)}</div>; })}</div>)}</div></div>
      </div></section>

    <section className="ltp-more"><h2>Everything you need,<br />and then some.</h2>
      <div className="ltp-cards ltp-cards--more">{more.map(([t, d, k]) => <article key={t} className={"c-" + k}><div className="ltp-cards__art"><Art k={k} /></div><h3>{t}</h3><p>{d}</p><div className="ltp-chips"><span>Premium</span><span>Pro</span><span>Starter</span></div></article>)}</div>
      <Link className="ltp-pinkbtn" href="/login?mode=signup">Join the Pros</Link></section>

    <section className="ltp-person"><div className="ltp-arch"><i className="blob" /><i className="head" /><i className="body" /></div>
      <blockquote>“I’d recommend this to other creators! It’s very powerful for getting more eyes on your content.”</blockquote><p>An early user,<br />Designer, Art Director and Financial Independence Educator (sample testimonial)</p></section>

    <section className="ltp-agency"><div><h2>Agency or<br />Enterprise</h2><p>Big teams, big goals. Connect with us and we’ll build a custom plan to get you there.</p><Link className="ltp-dark" href="/login">Get in touch</Link></div>
      <div className="ltp-agency__art"><div className="ph"><i /><b>Omar Neybiri</b><small>3D animator based in Brooklyn</small></div><div className="msg"><b>23</b><small>Messages received</small></div><div className="form"><b>Contact me</b><em>Name*</em><em>Email address*</em><em className="t">Message*</em><u>Send message</u></div></div></section>

    <section className="ltp-faq"><h2>Frequently asked questions</h2>
      <div>{data.faqs.map(([qq, a], i) => <details key={qq} open={faq === i} onClick={e => { e.preventDefault(); setFaq(faq === i ? null : i); }}><summary><span>{qq}</span><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden style={{ transform: faq === i ? "rotate(180deg)" : undefined }}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></summary><div>{(a as string).split("\n\n").map((t, j) => <p key={j}>{t}</p>)}</div></details>)}</div></section>
  </div>;
}
