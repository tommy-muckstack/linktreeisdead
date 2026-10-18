// What the Add menu offers, grouped like Linktree's (Commerce left out: this project doesn't sell).
// Each entry creates a block with a preset; picking it opens the block's editor.
import type { Block, BlockType, SocialKind } from "@/lib/model";

export type Entry = { id: string; name: string; blurb: string; type: BlockType; icon: string; social?: SocialKind; color: string; preset?: Partial<Block>; cats: string[] };
const S = (social: SocialKind, name: string, blurb: string, color: string, cats = ["social"]): Entry => ({ id: social, name, blurb, type: "link", icon: "", social, color, preset: { icon: social, title: name }, cats });
export const CATALOG: Entry[] = [
  { id: "messaging", name: "Messaging", blurb: "Let visitors message you directly from your page", type: "messaging", icon: "send", color: "#111111", cats: ["suggested", "contact"] },
  S("instagram", "Instagram", "Link to your profile, posts and reels", "#E1306C", ["suggested", "social"]),
  S("tiktok", "TikTok", "Send people to your TikTok", "#000000", ["suggested", "social"]),
  { id: "gallery", name: "Image gallery", blurb: "Share a gallery of images", type: "gallery", icon: "image", color: "#3D7BF7", cats: ["suggested", "media"] },
  { id: "youtube", name: "YouTube", blurb: "Play a YouTube video on your page", type: "video", icon: "", social: "youtube", color: "#FF0000", preset: { title: "" }, cats: ["suggested", "media"] },
  { id: "spotify", name: "Spotify", blurb: "Share your latest or favorite music", type: "music", icon: "", social: "spotify", color: "#1DB954", cats: ["suggested", "media"] },
  { id: "maps", name: "Maps", blurb: "Share your location with your visitors", type: "map", icon: "pin", color: "#34A853", cats: ["suggested", "contact"] },
  { id: "calendly", name: "Scheduling", blurb: "Let visitors book time with you (Calendly or Cal.com)", type: "embed", icon: "calendar", color: "#006BFF", preset: { title: "Book a time" }, cats: ["suggested", "contact", "events"] },
  // social
  S("x", "X", "Link to your X profile", "#000000"), S("threads", "Threads", "Link to your Threads profile", "#000000"), S("facebook", "Facebook", "Link to your page or profile", "#1877F2"),
  S("snapchat", "Snapchat", "Add your Snapchat", "#F7D800"), S("pinterest", "Pinterest", "Share your boards", "#E60023"), S("twitch", "Twitch", "Send fans to your stream", "#9146FF"),
  S("linkedin", "LinkedIn", "Link to your professional profile", "#0A66C2"), S("github", "GitHub", "Show off your code", "#181717"), S("bluesky", "Bluesky", "Link to your Bluesky", "#1185FE"),
  S("discord", "Discord server", "Add members to your Discord server", "#5865F2", ["social", "community"]), S("whatsapp", "WhatsApp group", "Add members to your WhatsApp group", "#25D366", ["social", "community"]),
  S("telegram", "Telegram", "Link to your channel or group", "#26A5E4", ["social", "community"]), S("patreon", "Patreon", "Get support from your fans", "#000000", ["social", "community"]),
  S("kofi", "Ko-fi", "Take tips and support", "#FF5E5B", ["social", "community"]), S("substack", "Substack", "Grow your newsletter", "#FF6719", ["social"]),
  { id: "rss", name: "RSS feed", blurb: "Show the latest posts from any blog or podcast feed", type: "rss", icon: "rss", color: "#F26522", preset: { title: "Latest posts" }, cats: ["social", "media"] },
  // media
  { id: "video", name: "Video", blurb: "YouTube, Vimeo or TikTok video, played on your page", type: "video", icon: "video", color: "#E5484D", cats: ["media"] },
  { id: "music", name: "Music", blurb: "Spotify, Apple Music, SoundCloud or Audiomack player", type: "music", icon: "music", color: "#FA243C", cats: ["media"] },
  { id: "podcast", name: "Podcasts", blurb: "Embed a show or an episode", type: "music", icon: "music", color: "#8E44EF", preset: { title: "Listen to the podcast" }, cats: ["media"] },
  { id: "pdf", name: "PDF display", blurb: "Show a PDF right on your page", type: "pdf", icon: "doc", color: "#D93025", cats: ["media"] },
  { id: "canva", name: "Canva design", blurb: "Embed a published Canva design", type: "embed", icon: "palette", color: "#00C4CC", cats: ["media"] },
  // contact
  { id: "form", name: "Contact form", blurb: "Receive messages, leads and questions", type: "form", icon: "form", color: "#7B2CF5", preset: { title: "Get in touch", data: { kind: "contact", fields: ["name", "email", "message"], button: "Send" } }, cats: ["contact"] },
  { id: "email-signup", name: "Email signup", blurb: "Grow your mailing list", type: "form", icon: "mail", color: "#0F9D58", preset: { title: "Join my newsletter", data: { kind: "email", button: "Subscribe" } }, cats: ["contact"] },
  { id: "sms-signup", name: "SMS signup", blurb: "Collect phone numbers for updates", type: "form", icon: "phone", color: "#0B8043", preset: { title: "Get text updates", data: { kind: "sms", button: "Sign up" } }, cats: ["contact"] },
  { id: "poll", name: "Poll", blurb: "Ask your visitors a question", type: "form", icon: "chart", color: "#F29900", preset: { title: "Quick question", data: { kind: "poll", options: ["Yes", "No"], button: "Vote" } }, cats: ["contact"] },
  { id: "embed-form", name: "Typeform or Google Form", blurb: "Embed a form you've already built", type: "embed", icon: "form", color: "#262627", cats: ["contact"] },
  { id: "contact", name: "Contact details", blurb: "A card visitors can save to their phone", type: "contact", icon: "contact", color: "#5F6368", preset: { title: "Contact" }, cats: ["contact"] },
  { id: "faq", name: "FAQs", blurb: "Answer common questions", type: "faq", icon: "faq", color: "#1A73E8", preset: { title: "FAQs", data: { items: [{ q: "", a: "" }] } }, cats: ["contact"] },
  // events
  { id: "events", name: "Tour and events", blurb: "List your upcoming dates", type: "events", icon: "calendar", color: "#C5221F", preset: { title: "Upcoming events", data: { items: [] } }, cats: ["events"] },
  { id: "discount", name: "Discount code", blurb: "Display a code visitors can copy", type: "discount", icon: "percent", color: "#188038", preset: { title: "Discount" }, cats: ["events"] },
  // text
  { id: "text", name: "Text", blurb: "Add a paragraph of text", type: "text", icon: "text", color: "#3C4043", cats: ["text"] },
  { id: "header", name: "Header", blurb: "Split your links into sections", type: "header", icon: "type", color: "#3C4043", preset: { title: "Header" }, cats: ["text"] },
];
export const CATS: { id: string; label: string; icon: string }[] = [{ id: "suggested", label: "Suggested", icon: "bulb" }, { id: "social", label: "Social", icon: "heart" }, { id: "media", label: "Media", icon: "play" }, { id: "contact", label: "Contact", icon: "contact" }, { id: "events", label: "Events", icon: "calendar" }, { id: "text", label: "Text", icon: "text" }, { id: "all", label: "View all", icon: "dots" }];
export const TYPE_META: Record<BlockType, { label: string; icon: string }> = {
  link: { label: "Link", icon: "link" }, header: { label: "Header", icon: "type" }, text: { label: "Text", icon: "text" }, collection: { label: "Collection", icon: "folder" }, video: { label: "Video", icon: "video" }, music: { label: "Music", icon: "music" },
  gallery: { label: "Image gallery", icon: "image" }, map: { label: "Map", icon: "pin" }, faq: { label: "FAQs", icon: "faq" }, contact: { label: "Contact details", icon: "contact" }, form: { label: "Form", icon: "form" }, discount: { label: "Discount code", icon: "percent" },
  embed: { label: "Embed", icon: "calendar" }, pdf: { label: "PDF", icon: "doc" }, events: { label: "Events", icon: "calendar" }, rss: { label: "RSS feed", icon: "rss" }, messaging: { label: "Messaging", icon: "send" },
};
