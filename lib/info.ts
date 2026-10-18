// Small original pages linked from the nav menus and footer (about, help, use cases, terms, privacy).
import { GH } from "@/lib/marketing-links";
export type InfoSection = { id?: string; h: string; p: string[]; li?: string[] };
export type InfoPage = { title: string; lede: string; sections: InfoSection[] };

export const INFO: Record<string, InfoPage> = {
  about: { title: "About LinktreeIsDead", lede: "A free, open-source link in bio. One page for every link you share, with nothing locked behind a plan.", sections: [
    { h: "Why it exists", p: ["Link-in-bio pages are simple: a photo, a few words and a list of links. Paid apps charge monthly for the parts people want most, like themes, insights and removing the footer.", "LinktreeIsDead gives all of it away. It is part of IsDead, a set of open-source versions of popular paid apps."] },
    { h: "Who runs it", p: ["It is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Linktree Pty Ltd."] },
    { h: "Get involved", p: [`The code is on GitHub under the Apache-2.0 license. Report bugs, suggest features or send a pull request at ${GH}.`] }] },
  help: { title: "Help centre", lede: "Short answers for getting your page up and keeping it tidy.", sections: [
    { id: "getting-started", h: "Getting started", p: ["Open the app. You can start right away without an account; sign in with Google or email when you want to keep your page on every device."], li: ["Add a link: paste a URL and give it a title.", "Pick a theme, font and button style. The phone preview updates as you go.", "Copy your page link or QR code and put it in your bios."] },
    { id: "embeds", h: "Embeds and link apps", p: ["Paste a YouTube, Vimeo, Spotify, SoundCloud, Calendly or Google Maps link and it can show as an embed right on your page instead of a plain button. Anything else with a URL works as a normal link."] },
    { id: "account", h: "Accounts and guests", p: ["Without an account your page is kept for this browser. Sign in with Google or with an email and password to save it to your account. We never send verification emails; password reset emails are only sent when you ask for one."] },
    { id: "report", h: "Report a violation", p: [`If a page breaks the rules in our terms (illegal content, harassment, scams or malware), open an issue at ${GH}/issues with the page link and what is wrong. Don't post personal information in the issue.`] },
    { id: "security", h: "Security", p: [`Found a security problem? Please open a GitHub issue asking for a private contact instead of posting the details.`] }] },
  "use-cases": { title: "Use cases", lede: "One link that works for whatever you make.", sections: [
    { id: "musicians", h: "Musicians", p: ["Put your latest release, tour dates, merch store and every streaming service on one page. Embed a track so people can listen without leaving."] },
    { id: "youtubers", h: "YouTubers", p: ["Pin your newest video at the top, link your channel, sponsors and socials, and see which links your viewers actually click."] },
    { id: "podcasters", h: "Podcasters", p: ["Send listeners to every podcast app from a single link, and collect emails for episode updates."] },
    { id: "creators", h: "Creators", p: ["Group links into collections, schedule links to appear when a launch goes live, and keep your page looking like you."] },
    { id: "businesses", h: "Small businesses", p: ["Share your booking page, menu, map and contact details, and print the QR code on your counter or packaging."] },
    { id: "agencies", h: "Agencies", p: ["Build pages for clients without a seat fee. The code is open, so you can also run your own copy."] },
    { id: "grow", h: "Grow your audience", p: ["Turn visitors into subscribers with a subscribe button and forms, read their messages, and export your contacts whenever you like."] },
    { id: "share", h: "Share everywhere", p: ["Your page has one short address, a downloadable QR code and share buttons for the places your audience already is."] },
    { id: "customize", h: "Make it yours", p: ["Choose a theme or start from scratch with your own wallpaper, fonts, colours, button shapes and shadows."] }] },
  terms: { title: "Terms & Conditions", lede: "Plain-language rules for using LinktreeIsDead.", sections: [
    { h: "Using the service", p: ["LinktreeIsDead is free and provided as is, without warranties. We may change or stop the hosted service at any time; the code stays available under its open-source license."] },
    { h: "Your content", p: ["You own what you put on your page. You are responsible for it and for the links you share. Don't use LinktreeIsDead for anything illegal, for harassment, scams, malware or for sharing other people's private information."] },
    { h: "Removal", p: ["We may remove pages that break these rules or put visitors at risk."] },
    { h: "Trademarks", p: ["LinktreeIsDead is not affiliated with, endorsed by or sponsored by Linktree Pty Ltd. Linktree is a trademark of its owner."] }] },
  privacy: { title: "Privacy Notice", lede: "What we keep, and why.", sections: [
    { h: "What we store", p: ["Your page content, your account email if you sign in, and simple counts of page views and link clicks so you can see your own insights. Visitors who subscribe or send a message share only what they type into your page."] },
    { h: "Sign-in", p: ["Sign-in uses Firebase Authentication (Google or email and password). We don't sell your data or show ads."] },
    { id: "cookies", h: "Cookies", p: ["We use a sign-in cookie to keep you logged in and a guest cookie so you can try the app without an account. We don't use advertising cookies."] },
    { h: "Deleting your data", p: ["You can delete links and your page at any time from the app. For anything else, open an issue on GitHub."] }] },
};
