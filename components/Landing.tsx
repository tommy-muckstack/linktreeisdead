import Link from "next/link";
import { Mark } from "@/components/Mark";
import { LtPricing } from "@/components/LtPricing";
import { ClaimBar } from "@/components/ClaimBar";
import "@/app/landing.css";

// Structure mirrors linktr.ee's homepage: promo bar, floating pill nav, full-bleed colour sections, FAQ, purple footer.
// All art is original CSS/SVG; no brand assets are copied.
const Cta = ({ cls = "", children }: { cls?: string; children: React.ReactNode }) => <Link className={"lp-btn " + cls} href="/login?mode=signup">{children}</Link>;
const Phone = ({ bg, name, tint }: { bg: string; name: string; tint: string }) => <div className="lp-phone" style={{ background: bg }}><b style={{ color: tint }}>{name}</b><i /><i /><i /><span style={{ background: tint }} /></div>;
const faq: [string, string][] = [["Is Linktree the original link in bio tool?", "Link-in-bio pages have been around for years. This project is a free, open-source take on the idea, and its code is on GitHub."], ["Can you get paid and sell things from a Linktree?", "Not yet. There are no payments or shop features, but you can link out to any store, tip jar or booking page you already use."], ["Is Linktree safe to use on all of my social media profiles?", "Your page is a normal web link, so you can paste it into any bio. It has no sign-up wall and no tracking scripts for your visitors."], ["What makes Linktree better than the other link in bio options?", "It is free, open source and has no locked features. It does less than the original, so it suits you best if you want a simple page with themes and click analytics."], ["How can I drive more traffic to and through my Linktree?", "Put your page link in every bio, keep your best links at the top, and check the Analytics tab to see which links people actually click."], ["How many links should I have on my Linktree?", "There is no limit in the app. A short list of five to eight links tends to be easiest for visitors to scan."], ["Do I need a website to use Linktree?", "No. Your page lives at its own link, so you don't need a website of your own."], ["Where can I download the app?", "There is no mobile app. The site works in any mobile browser, and you can add it to your home screen."]];
const cols: [string, string[]][] = [["Company", ["The Blog", "Engineering Blog", "Marketplace", "Tools", "What's New", "About", "Newsroom", "Careers", "Link in Bio", "Social Good", "Contact"]], ["Community", ["For Enterprise", "Creator Report", "Previous Report", "Charities", "Profile Directory", "Explore Templates"]], ["Support", ["Help Topics", "Getting Started", "Pro", "Features & How-Tos", "FAQs", "Report a Violation"]], ["Trust & Legal", ["Terms & Conditions", "Privacy Notice", "Cookie Notice", "Trust Center", "Cookies Preferences", "Transparency Report", "Law Enforcement Access Policy", "Human Rights"]]];

export function Landing({ page }: { page?: "pricing" } = {}) {
  return <div className={"lp" + (page === "pricing" ? " is-pr" : "")}>
    <div className="lp-promo"><span>Make your page the best it can be. <Link href="/login?mode=signup">Claim yours today.</Link></span><button aria-label="Dismiss">×</button></div>
    <header className="lp-hero">
      <nav className="lp-nav"><Link href="/" className="lp-logo"><Mark size={30} />LinktreeIsDead</Link>
        <div className="lp-links"><button>Solutions</button><button>Features</button><button>Integrations</button><button>Resources</button><Link href="/pricing">Pricing</Link></div>
        <div className="lp-navcta"><Link className="lp-login" href="/login">Log in</Link><Link className="lp-signup" href="/login?mode=signup">Sign up free</Link></div></nav>
      <div className="lp-hero__body">
        <div className="lp-hero__copy"><h1>A link in bio built for you.</h1><p>Join thousands of people using an open-source link in bio. One link to help you share everything you create, curate and sell from your social media profiles.</p>
          <ClaimBar placeholder="linktr.ee/yourname" cta="Get started for free" btn="lp-btn--green" /></div>
        <div className="lp-hero__art"><div className="lp-photo"><div className="lp-photo__fig" /><div className="lp-photo__phone"><Phone bg="#fff" name="Koy" tint="#2665D6" /></div><small>Koy S. Lettering artist and illustrator.</small></div><div className="lp-photo lp-photo--2"><div className="lp-photo__fig lp-photo__fig--2" /></div></div>
      </div>
    </header>

    <section className="lp-sec lp-sec--blue"><div className="lp-art lp-art--create"><div className="lp-disc" /><div className="lp-card1"><b>AMBER</b><i /><i /></div><div className="lp-card2"><span /></div><div className="lp-dots"><i /><i /><i /></div></div>
      <div className="lp-copy"><h2 className="lp-h2 lp-h2--lime">Create and customize your page in minutes</h2><p>Connect all your content across social media, websites, stores and more in one link in bio. Customize every detail or let the app automatically match your brand and drive more clicks.</p><Cta cls="lp-btn--lime">Get started for free</Cta></div></section>

    <section className="lp-sec lp-sec--maroon"><div className="lp-copy"><h2 className="lp-h2 lp-h2--pink">Share your page anywhere you like!</h2><p>Add your unique URL to all the platforms and places you find your audience. Then use your QR code to drive your offline traffic back to your link in bio.</p><Cta cls="lp-btn--pink">Get started for free</Cta></div><div className="lp-art" /></section>

    <section className="lp-sec lp-sec--sage"><div className="lp-art lp-art--stats"><div className="lp-t lp-t--olive"><small>43,500</small><b>Clicks</b></div><div className="lp-t lp-t--pink"><small>643</small><b>Track Plays</b></div><div className="lp-t lp-t--mag"><small>$2,362</small><b>Sales</b></div><div className="lp-t lp-t--navy"><span className="lp-globe" /><small>960</small><b>Visits</b></div></div>
      <div className="lp-copy"><h2 className="lp-h2 lp-h2--ink">Analyze your audience and keep them engaged</h2><p>Track your engagement over time, monitor revenue and learn what’s converting your audience. Make informed updates on the fly to keep them coming back.</p><Cta cls="lp-btn--pink">Get started for free</Cta></div></section>

    <section className="lp-trust"><h2 className="lp-h2 lp-h2--ink">The only link in bio trusted by thousands of <em>musicians</em></h2>
      <div className="lp-tiles"><i style={{ background: "#D8A59A" }} /><i style={{ background: "#2a2a3d", borderRadius: "50% 50% 14px 14px" }} /><i style={{ background: "#111" }}><b>BRAND</b></i><i style={{ background: "#0a0a0a" }}><b className="lp-c">C</b></i><i style={{ background: "#e8c74a" }} /></div></section>

    <section className="lp-bento"><div className="lp-bento__l"><article className="lp-b lp-b--pink"><div className="lp-b__row"><i /><i /><i /></div><h3>Share every type of content in limitless ways</h3></article><article className="lp-b lp-b--lime"><div className="lp-b__shop"><i style={{ background: "#5a2a7a" }} /><i style={{ background: "#d6a43a" }} /><i style={{ background: "#9e1f3a" }} /><i style={{ background: "#14a0b8" }} /></div><h3>Sell products, collect payments and make monetization simple</h3></article></div>
      <article className="lp-b lp-b--navy"><div className="lp-b__tall"><Phone bg="#2F6BD8" name="emilio" tint="#cde" /><div className="lp-b__sheet"><b>Add a question</b><i /><i /><i /></div></div><h3>Grow, own and engage your audience across all of your channels</h3></article></section>

    <section className="lp-fast"><h2 className="lp-h2 lp-h2--ink">The fast, friendly and powerful link in bio tool.</h2><Link className="lp-btn lp-btn--pink" href="/pricing">Explore all plans</Link></section>
    <section className="lp-feat"><h2 className="lp-h2 lp-h2--ink">As featured in…</h2><div className="lp-chips">{["TechCrunch", "Insider", "Forbes", "Mashable", "Fortune"].map(c => <span key={c}>{c}</span>)}</div></section>

    <section className="lp-quote"><div className="lp-arch"><i /></div><blockquote>“A single link made it simple for me to share every part of what I make, in one inclusive place.”</blockquote><p>Riley L.,<br />Creator</p><div className="lp-arrows"><button aria-label="Previous">←</button><button aria-label="Next">→</button></div></section>

    <section className="lp-faq"><h2 className="lp-h2 lp-h2--pink">Questions? Answered</h2>{faq.map(([q, a]) => <details key={q}><summary>{q}<svg width="12" height="8" viewBox="0 0 12 8" aria-hidden><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></summary><p>{a}</p></details>)}</section>
    {page === "pricing" && <LtPricing />}

    <footer className="lp-ft"><div className="lp-ft__blob" /><div className="lp-ft__cta"><h2 className="lp-h2 lp-h2--pink">Jumpstart your corner of the internet today</h2><ClaimBar placeholder="linktr.ee/" cta="Claim your page" btn="lp-btn--lime" /></div>
      <div className="lp-ft__card"><div className="lp-ft__cols">{cols.map(([h, ls]) => <div key={h}><h4>{h}</h4>{ls.map(l => <Link key={l} href="/login">{l}</Link>)}</div>)}</div><div className="lp-ft__lang"><b>English</b><span>Português (Brasil)</span></div>
        <div className="lp-ft__bar"><div><Link className="lp-login" href="/login">Log in</Link><Link className="lp-btn lp-btn--lime lp-btn--sm" href="/login?mode=signup">Get started for free</Link></div><div className="lp-ft__soc"><span className="lp-store">App Store</span><span className="lp-store">Google Play</span><i /><i /><i /><i /><i /></div></div></div>
      <div className="lp-ft__flags"><i /><i /></div><p className="lp-ft__ack">LinktreeIsDead is an independent open-source project, not affiliated with Linktree Pty Ltd. We acknowledge the Traditional Custodians of the land on which this internet was built, and pay our respects to Elders past, present and emerging. <a href="https://github.com/tommy-muckstack/linktreeisdead">View on GitHub</a></p></footer>
  </div>;
}
