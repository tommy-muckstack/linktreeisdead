import Link from "next/link";
import { LtPricing } from "@/components/LtPricing";
import { ClaimBar } from "@/components/ClaimBar";
import { SmartLink } from "@/components/SmartLink";
import { LpNav, LpPromo } from "@/components/LpNav";
import { LpPromises } from "@/components/LpParts";
import { LpFooter } from "@/components/LpFooter";
import "@/app/landing.css";

// Structure mirrors the original homepage: promo bar, floating pill nav, full-bleed colour sections, FAQ, purple footer.
// All art is original CSS/SVG and every profile shown is a made-up sample page (no real people or brands).
const Cta = ({ cls = "", children }: { cls?: string; children: React.ReactNode }) => <SmartLink className={"lp-btn " + cls} href="/app">{children}</SmartLink>;
const Phone = ({ bg, name, tint }: { bg: string; name: string; tint: string }) => <div className="lp-phone" style={{ background: bg }}><b style={{ color: tint }}>{name}</b><i /><i /><i /><span style={{ background: tint }} /></div>;

// Recreated sample profiles for the marquee. Handles describe a kind of page, never a person.
const SAMPLES: { handle: string; kind: string; bg: string; ink: string; shape?: string }[] = [
  { handle: "@vinyl.nights", kind: "Record label", bg: "#D8A59A", ink: "#3b1d17" },
  { handle: "@synth.lab", kind: "Electronic duo", bg: "#2a2a3d", ink: "#C9B6FF", shape: "arch" },
  { handle: "@brass.section", kind: "Jazz band", bg: "#111", ink: "#FFC20E" },
  { handle: "@studio.clay", kind: "Ceramics studio", bg: "#E8C74A", ink: "#3d2b05", shape: "round" },
  { handle: "@late.show.pod", kind: "Podcast", bg: "#254F1A", ink: "#D2E823" },
  { handle: "@corner.bakery", kind: "Small business", bg: "#E9C0E9", ink: "#4A1456", shape: "arch" },
  { handle: "@trail.notes", kind: "Travel creator", bg: "#2665D6", ink: "#fff" },
];
const Tile = ({ s }: { s: (typeof SAMPLES)[number] }) => <i className={"lp-tile" + (s.shape ? " lp-tile--" + s.shape : "")} style={{ background: s.bg, color: s.ink }}><em>Sample</em><span className="lp-tile__av" style={{ background: s.ink }} /><b>{s.handle}</b><small>{s.kind}</small><span className="lp-tile__ln" style={{ background: s.ink }} /><span className="lp-tile__ln" style={{ background: s.ink }} /></i>;

const faq: [string, string][] = [
  ["Is LinktreeIsDead really free?", "Yes. Every feature is free, with no plans, trials or paywall. The code is open source on GitHub under the Apache-2.0 license, so you can also run your own copy."],
  ["Can you sell things from a LinktreeIsDead?", "LinktreeIsDead doesn't take payments, but you can link out to any store, tip jar or booking page you already use."],
  ["Is LinktreeIsDead safe to use on all of my social media profiles?", "Your page is a normal web link, so you can paste it into any bio. Visitors never need to sign up to see it."],
  ["What makes LinktreeIsDead different from other link in bio tools?", "Nothing is locked behind a plan: themes, fonts, insights, scheduling and hiding the footer are all included, and you can read every line of the code."],
  ["How can I drive more traffic to and through my LinktreeIsDead?", "Put your page link in every bio, keep your best links at the top, and check Insights to see which links people actually click."],
  ["How many links should I have on my LinktreeIsDead?", "As many as you like. A short list of five to eight links tends to be easiest for visitors to scan."],
  ["Do I need a website to use LinktreeIsDead?", "No. Your page lives at its own link, so you don't need a website of your own."],
  ["Do I need an account?", "No. You can build your page straight away. Sign in with Google or an email and password when you want to keep it on every device."],
];

export function Landing({ page }: { page?: "pricing" } = {}) {
  return <div className={"lp" + (page === "pricing" ? " is-pr" : "")}>
    <LpPromo />
    <header className="lp-hero">
      <LpNav active={page} />
      <div className="lp-hero__body">
        <div className="lp-hero__copy"><h1>A link in bio built for you.</h1><p>Join the people using LinktreeIsDead for their link in bio. One free, open-source link to help you share everything you create, curate and post from your Instagram, TikTok, X, YouTube and other social media profiles.</p>
          <ClaimBar placeholder="yourname" cta="Get started for free" btn="lp-btn--green" /></div>
        <div className="lp-hero__art"><div className="lp-photo"><div className="lp-photo__fig" /><div className="lp-photo__phone"><Phone bg="#fff" name="studio.ink" tint="#2665D6" /></div><small>Sample page: a lettering and illustration studio.</small></div><div className="lp-photo lp-photo--2"><div className="lp-photo__fig lp-photo__fig--2" /></div></div>
      </div>
    </header>

    <section className="lp-sec lp-sec--blue"><div className="lp-art lp-art--create"><div className="lp-disc" /><div className="lp-card1"><b>studio.clay</b><i /><i /></div><div className="lp-card2"><span /></div><div className="lp-dots"><i /><i /><i /></div></div>
      <div className="lp-copy"><h2 className="lp-h2 lp-h2--lime">Create and customize your LinktreeIsDead in minutes</h2><p>Connect all your content across social media, websites, stores and more in one link in bio. Customize every detail or let LinktreeIsDead suggest tweaks that match your brand and drive more clicks.</p><Cta cls="lp-btn--lime">Get started for free</Cta></div></section>

    <section className="lp-sec lp-sec--maroon"><div className="lp-copy"><h2 className="lp-h2 lp-h2--pink">Share your LinktreeIsDead anywhere you like!</h2><p>Add your unique URL to all the platforms and places you find your audience. Then use your QR code to drive your offline traffic back to your link in bio.</p><Cta cls="lp-btn--pink">Get started for free</Cta></div><div className="lp-art" /></section>

    <section className="lp-sec lp-sec--sage"><div className="lp-art lp-art--stats"><div className="lp-t lp-t--olive"><small>43,500</small><b>Clicks</b></div><div className="lp-t lp-t--pink"><small>643</small><b>Subscribers</b></div><div className="lp-t lp-t--mag"><small>12.4%</small><b>Click rate</b></div><div className="lp-t lp-t--navy"><span className="lp-globe" /><small>960</small><b>Visits</b></div></div>
      <div className="lp-copy"><h2 className="lp-h2 lp-h2--ink">Analyze your audience and keep them engaged</h2><p>Track your engagement over time, see where visitors come from and learn which links they click. Make informed updates on the fly to keep them coming back.</p><Cta cls="lp-btn--pink">Get started for free</Cta></div></section>

    <section className="lp-trust"><h2 className="lp-h2 lp-h2--ink">The free link in bio for every <em>musician</em></h2>
      <div className="lp-marq" aria-label="Sample pages"><div className="lp-tiles">{[...SAMPLES, ...SAMPLES].map((s, i) => <Tile key={i} s={s} />)}</div></div></section>

    <section className="lp-bento"><div className="lp-bento__l"><article className="lp-b lp-b--pink"><div className="lp-b__row"><i /><i /><i /></div><h3>Share every type of content in limitless ways</h3></article><article className="lp-b lp-b--lime"><div className="lp-b__shop"><i style={{ background: "#5a2a7a" }} /><i style={{ background: "#d6a43a" }} /><i style={{ background: "#9e1f3a" }} /><i style={{ background: "#14a0b8" }} /></div><h3>Collect subscribers, messages and form replies in one place</h3></article></div>
      <article className="lp-b lp-b--navy"><div className="lp-b__tall"><Phone bg="#2F6BD8" name="synth.lab" tint="#cde" /><div className="lp-b__sheet"><b>Add a question</b><i /><i /><i /></div></div><h3>Grow, own and engage your audience across all of your channels</h3></article></section>

    <section className="lp-fast"><h2 className="lp-h2 lp-h2--ink">The fast, friendly and powerful link in bio tool.</h2><Link className="lp-btn lp-btn--pink" href="/pricing">Explore all plans</Link></section>
    <section className="lp-feat"><h2 className="lp-h2 lp-h2--ink">Works with the links you already have…</h2><div className="lp-chips">{["YouTube", "Spotify", "Calendly", "Google Maps", "SoundCloud"].map(c => <span key={c}>{c}</span>)}</div></section>

    <section className="lp-quote"><div className="lp-arch" aria-hidden><i /></div><LpPromises /></section>

    <section className="lp-faq" id="faq"><h2 className="lp-h2 lp-h2--pink">Questions? Answered</h2>{faq.map(([q, a]) => <details key={q}><summary>{q}<svg width="12" height="8" viewBox="0 0 12 8" aria-hidden><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></summary><p>{a}</p></details>)}</section>
    {page === "pricing" && <LtPricing />}
    <LpFooter />
  </div>;
}
