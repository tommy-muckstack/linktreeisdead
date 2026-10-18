// Sticker packs for Design > Stickers. Emoji-based so they cost nothing to ship and render everywhere.
export const STICKER_PACKS: { id: string; name: string; blurb: string; items: { k: string; e: string; n: string }[] }[] = [
  { id: "vibes", name: "Good Vibes", blurb: "Bright, happy accents for any page.", items: [["sparkles", "✨"], ["rainbow", "🌈"], ["heart", "💖"], ["blossom", "🌸"], ["sun", "☀️"], ["star", "⭐"], ["smile", "😊"], ["fire", "🔥"]].map(([n, e]) => ({ k: "vibes-" + n, e: e!, n: n! })) },
  { id: "spooky", name: "Sorta Spooky", blurb: "A little spooky, a lot of fun.", items: [["pumpkin", "🎃"], ["ghost", "👻"], ["bat", "🦇"], ["web", "🕸️"], ["skull", "💀"], ["candy", "🍬"], ["moon", "🌙"], ["cat", "🐈‍⬛"]].map(([n, e]) => ({ k: "spooky-" + n, e: e!, n: n! })) },
  { id: "creator", name: "Like & Subscribe Essentials", blurb: "For video and audio creators.", items: [["play", "▶️"], ["headphones", "🎧"], ["camera", "📸"], ["mic", "🎙️"], ["bell", "🔔"], ["clapper", "🎬"], ["thumbs", "👍"], ["megaphone", "📣"]].map(([n, e]) => ({ k: "creator-" + n, e: e!, n: n! })) },
  { id: "food", name: "Snack Break", blurb: "Tasty bits for food lovers and makers.", items: [["coffee", "☕"], ["donut", "🍩"], ["pizza", "🍕"], ["taco", "🌮"], ["avocado", "🥑"], ["cake", "🍰"], ["boba", "🧋"], ["cherries", "🍒"]].map(([n, e]) => ({ k: "food-" + n, e: e!, n: n! })) },
  { id: "nature", name: "Outdoors", blurb: "Plants, waves and wide skies.", items: [["leaf", "🌿"], ["wave", "🌊"], ["mountain", "⛰️"], ["cactus", "🌵"], ["sunflower", "🌻"], ["butterfly", "🦋"], ["mushroom", "🍄"], ["palm", "🌴"]].map(([n, e]) => ({ k: "nature-" + n, e: e!, n: n! })) },
];
export const STICKER_EMOJI: Record<string, string> = Object.fromEntries(STICKER_PACKS.flatMap(p => p.items.map(i => [i.k, i.e])));
