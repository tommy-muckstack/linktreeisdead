// Turns a pasted URL into an embeddable iframe source for the media blocks. Only well-known providers are embedded;
// anything else falls back to a plain link button, so a page can never iframe an arbitrary site by accident.
export type Embed = { src: string; h: number; ratio?: number; provider: string };

export function toEmbed(raw: string): Embed | null {
  let u: URL; try { u = new URL(raw); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, ""); const p = u.pathname;
  if (host === "youtube.com" || host === "youtu.be" || host === "music.youtube.com") {
    const id = host === "youtu.be" ? p.slice(1) : u.searchParams.get("v") ?? p.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
    return id && /^[\w-]{6,}$/.test(id) ? { src: `https://www.youtube-nocookie.com/embed/${id}`, h: 0, ratio: 16 / 9, provider: "YouTube" } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") { const id = p.match(/(\d{5,})/)?.[1]; return id ? { src: `https://player.vimeo.com/video/${id}`, h: 0, ratio: 16 / 9, provider: "Vimeo" } : null; }
  if (host === "tiktok.com") { const id = p.match(/video\/(\d{8,})/)?.[1]; return id ? { src: `https://www.tiktok.com/embed/v2/${id}`, h: 740, provider: "TikTok" } : null; }
  if (host === "open.spotify.com") { const m = p.match(/\/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/); return m ? { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, h: m[1] === "track" || m[1] === "episode" ? 152 : 352, provider: "Spotify" } : null; }
  if (host === "music.apple.com" || host === "podcasts.apple.com") return { src: `https://embed.${host}${p}${u.search}`, h: p.includes("/song/") || u.searchParams.get("i") ? 175 : 450, provider: "Apple Music" };
  if (host === "soundcloud.com") return { src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.toString())}&color=%23000000&visual=false`, h: 166, provider: "SoundCloud" };
  if (host === "audiomack.com") return { src: `https://audiomack.com/embed${p}`, h: 252, provider: "Audiomack" };
  if (host === "calendly.com") return { src: `https://calendly.com${p}?hide_gdpr_banner=1`, h: 680, provider: "Calendly" };
  if (host === "cal.com") return { src: `https://cal.com${p}?embed=true`, h: 680, provider: "Cal.com" };
  if (host === "docs.google.com" && /\/forms\//.test(p)) return { src: `https://docs.google.com${p.replace(/\/(viewform|edit).*$/, "/viewform")}?embedded=true`, h: 700, provider: "Google Forms" };
  if (host === "form.typeform.com" || host.endsWith(".typeform.com")) return { src: u.toString(), h: 560, provider: "Typeform" };
  if (host === "canva.com" && p.includes("/design/")) return { src: `https://www.canva.com${p.replace(/\/(edit|view).*$/, "/view")}?embed`, h: 0, ratio: 16 / 9, provider: "Canva" };
  if (/\.pdf$/i.test(p)) return { src: u.toString(), h: 560, provider: "PDF" };
  return null;
}
/** A still image for the editor preview, where iframes stay unloaded. YouTube only (its thumbnails are public and need no key). */
export const posterFor = (src: string) => { const id = src.match(/youtube-nocookie\.com\/embed\/([\w-]+)/)?.[1]; return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""; };
export const mapEmbed = (address: string, zoom = 14) => `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`;
export const mapLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Guess the right block type and platform icon for a pasted URL (used by the Add dialog). */
export function sniff(raw: string): { type: "link" | "video" | "music" | "embed" | "pdf"; icon: string; title: string } {
  let u: URL; try { u = new URL(/^https?:/i.test(raw) ? raw : "https://" + raw); } catch { return { type: "link", icon: "", title: "" }; }
  const h = u.hostname.replace(/^www\.|^m\./, "");
  const icon = ({ "instagram.com": "instagram", "tiktok.com": "tiktok", "youtube.com": "youtube", "youtu.be": "youtube", "x.com": "x", "twitter.com": "x", "facebook.com": "facebook", "threads.net": "threads", "snapchat.com": "snapchat", "pinterest.com": "pinterest", "linkedin.com": "linkedin", "github.com": "github", "twitch.tv": "twitch", "discord.gg": "discord", "discord.com": "discord", "wa.me": "whatsapp", "chat.whatsapp.com": "whatsapp", "t.me": "telegram", "open.spotify.com": "spotify", "music.apple.com": "applemusic", "soundcloud.com": "soundcloud", "bsky.app": "bluesky", "substack.com": "substack", "patreon.com": "patreon", "ko-fi.com": "kofi", "cash.app": "cashapp", "venmo.com": "venmo" } as Record<string, string>)[h] ?? (h.endsWith(".substack.com") ? "substack" : "");
  const e = toEmbed(u.toString());
  const type = !e ? "link" : ["YouTube", "Vimeo", "TikTok"].includes(e.provider) ? "video" : ["Spotify", "Apple Music", "SoundCloud", "Audiomack"].includes(e.provider) ? "music" : e.provider === "PDF" ? "pdf" : "embed";
  const names: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", x: "X", facebook: "Facebook", threads: "Threads", snapchat: "Snapchat", pinterest: "Pinterest", linkedin: "LinkedIn", github: "GitHub", twitch: "Twitch", discord: "Discord", whatsapp: "WhatsApp", telegram: "Telegram", spotify: "Spotify", applemusic: "Apple Music", soundcloud: "SoundCloud", bluesky: "Bluesky", substack: "Substack", patreon: "Patreon", kofi: "Ko-fi", cashapp: "Cash App", venmo: "Venmo" };
  const base = h.split(".").slice(-2, -1)[0] ?? "";
  return { type, icon, title: names[icon] ?? e?.provider ?? (base ? base[0]!.toUpperCase() + base.slice(1) : "") };
}
