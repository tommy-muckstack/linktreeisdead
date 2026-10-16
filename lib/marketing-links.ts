// Every link on the logged-out pages (nav menus + footer) lives here, so none can point at a dead end.
// `href` starting with "/" is an in-app route (basePath added by next/link); "/app…" must be a plain <a> (guest redirect).
export const GH = "https://github.com/tommy-muckstack/linktreeisdead";
export const HUB = "https://yourappisdead.com";
export type MLink = { label: string; href: string; desc?: string; icon?: string };
export type MGroup = { title?: string; links: MLink[] };
export type MMenu = { label: string; top?: MLink[]; groups: MGroup[]; foot?: MLink };

export const isApp = (h: string) => h === "/app" || h.startsWith("/app?") || h.startsWith("/app/");
export const isExternal = (h: string) => /^https?:/.test(h);

export const NAV: MMenu[] = [
  { label: "Solutions", groups: [
    { title: "LinktreeIsDead for", links: [
      { label: "Musicians", href: "/use-cases#musicians", icon: "music" }, { label: "YouTubers", href: "/use-cases#youtubers", icon: "play" },
      { label: "Podcasters", href: "/use-cases#podcasters", icon: "mic" }, { label: "Creators", href: "/use-cases#creators", icon: "star" },
      { label: "Small businesses", href: "/use-cases#businesses", icon: "store" }, { label: "Agencies", href: "/use-cases#agencies", icon: "users" }] },
    { title: "What you can do", links: [
      { label: "Grow your audience", desc: "Collect subscribers and messages and see who visits, all on your own page.", href: "/use-cases#grow" },
      { label: "Share everywhere", desc: "One link, a QR code and short links for every bio, post and poster.", href: "/use-cases#share" },
      { label: "Make it yours", desc: "Themes, fonts, colours, wallpapers and button styles, with a live preview.", href: "/use-cases#customize" }] }],
    foot: { label: "See all use cases", href: "/use-cases" } },
  { label: "Features", top: [
      { label: "Link in Bio", desc: "The page your audience lands on", href: "/app", icon: "tree" },
      { label: "Insights", desc: "See what your audience actually clicks", href: "/app", icon: "chart" },
      { label: "Audience", desc: "Subscribers, form entries and messages", href: "/app", icon: "users" },
      { label: "Open source", desc: "Read, fork or self-host the code", href: GH, icon: "code" }],
    groups: [
      { title: "Create and share", links: [{ label: "Short links", href: "/app", icon: "link" }, { label: "QR codes", href: "/app", icon: "qr" }, { label: "Themes and fonts", href: "/app", icon: "brush" }] },
      { title: "Nurture and grow", links: [{ label: "Insights", href: "/app", icon: "chart" }, { label: "Audience manager", href: "/app", icon: "users" }, { label: "Messages", href: "/app", icon: "chat" }] },
      { title: "What's new", links: [{ label: "Recent changes on GitHub", href: GH + "/commits/main", icon: "spark" }] }],
    foot: { label: "See all features", href: "/pricing#ltp-features" } },
  { label: "Integrations", groups: [
    { title: "Embeds that just work", links: [{ label: "YouTube and video", href: "/help#embeds", icon: "play" }, { label: "Spotify and music", href: "/help#embeds", icon: "music" }, { label: "Calendly and booking pages", href: "/help#embeds", icon: "calendar" }, { label: "Google Maps", href: "/help#embeds", icon: "pin" }] },
    { title: "Browse and build", links: [{ label: "Link apps", href: "/help#embeds", icon: "grid" }, { label: "Contribute on GitHub", href: GH, icon: "code" }] }],
    foot: { label: "How embeds work", href: "/help#embeds" } },
  { label: "Resources", groups: [
    { title: "Learn", links: [{ label: "Help centre", href: "/help", icon: "help" }, { label: "Get started", href: "/help#getting-started", icon: "flag" }, { label: "Templates", href: "/app", icon: "brush" }, { label: "FAQs", href: "/#faq", icon: "chat" }] },
    { title: "Community", links: [{ label: "Source code", href: GH, icon: "code" }, { label: "Report an issue", href: GH + "/issues", icon: "flag" }, { label: "More IsDead apps", href: HUB, icon: "grid" }] },
    { title: "Company", links: [{ label: "About", href: "/about", icon: "info" }, { label: "Contact us", href: GH + "/issues/new", icon: "mail" }] }] },
];

export const FOOTER: [string, MLink[]][] = [
  ["Company", [{ label: "About", href: "/about" }, { label: "What's New", href: GH + "/commits/main" }, { label: "Link in Bio", href: "/" }, { label: "Use cases", href: "/use-cases" }, { label: "More IsDead apps", href: HUB }, { label: "Contact", href: GH + "/issues/new" }]],
  ["Community", [{ label: "Source code", href: GH }, { label: "Contribute", href: GH + "/pulls" }, { label: "Explore Templates", href: "/app" }, { label: "Report an issue", href: GH + "/issues" }]],
  ["Support", [{ label: "Help Topics", href: "/help" }, { label: "Getting Started", href: "/help#getting-started" }, { label: "Pricing", href: "/pricing" }, { label: "Features & How-Tos", href: "/pricing#ltp-features" }, { label: "FAQs", href: "/#faq" }, { label: "Report a Violation", href: "/help#report" }]],
  ["Trust & Legal", [{ label: "Terms & Conditions", href: "/terms" }, { label: "Privacy Notice", href: "/privacy" }, { label: "Cookie Notice", href: "/privacy#cookies" }, { label: "License (Apache-2.0)", href: GH + "/blob/main/LICENSE" }]],
];
