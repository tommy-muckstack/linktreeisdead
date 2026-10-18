// Theme presets for the Design > Theme picker. Each one is a full set of design values (wallpaper, buttons, fonts, colours);
// picking a theme copies them in, and any later tweak flips the page to "custom". Original CSS art: gradients and patterns only.
import type { Design } from "@/lib/model";

type T = { name: string; d: Omit<Design, "theme" | "stickers" | "hideFooter" | "header" | "titleStyle" | "logo"> };
const D = (p: Omit<Partial<T["d"]>, "wallpaper" | "button"> & { wallpaper: Partial<T["d"]["wallpaper"]>; button: Partial<T["d"]["button"]> }): T["d"] => ({
  font: "Link Sans", textColor: "#000000", titleFont: "Link Sans", altTitleFont: false, titleColor: "#000000", ...p,
  wallpaper: { style: "fill", color: "#ECEEF1", color2: "#FFFFFF", dir: "down", pattern: "dots", image: "", video: "", blur: 0, ...p.wallpaper },
  button: { style: "solid", radius: 3, shadow: "none", color: "#FFFFFF", text: "#000000", ...p.button },
});

export const THEMES = {
  air: { name: "Air", d: D({ wallpaper: { color: "#ECEEF1" }, button: {} }) },
  agate: { name: "Agate", d: D({ font: "Bricolage Grotesque", titleFont: "Bricolage Grotesque", textColor: "#FFFFFF", titleColor: "#D7F24B", wallpaper: { style: "gradient", color: "#0E6E5C", color2: "#1B3B2F", dir: "down" }, button: { color: "#C8F23A", text: "#10322A" } }) },
  astrid: { name: "Astrid", d: D({ font: "Inter", titleFont: "Inter", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { style: "gradient", color: "#2A2A2E", color2: "#0B0B0D", dir: "radial" }, button: { style: "glass", color: "#FFFFFF", text: "#FFFFFF" } }) },
  aura: { name: "Aura", d: D({ font: "Playfair Display", titleFont: "Playfair Display", textColor: "#3B3A35", titleColor: "#3B3A35", wallpaper: { style: "gradient", color: "#E9E4DA", color2: "#CFC8BA", dir: "down" }, button: { style: "glass", color: "#FFFFFF", text: "#3B3A35" } }) },
  bliss: { name: "Bliss", d: D({ font: "Lora", titleFont: "Lora", textColor: "#2F2F2F", titleColor: "#2F2F2F", wallpaper: { style: "blur", color: "#BDBDBD", color2: "#F2F2F2", dir: "down", blur: 18 }, button: { style: "glass", color: "#FFFFFF", text: "#2F2F2F" } }) },
  blocks: { name: "Blocks", d: D({ font: "DM Sans", titleFont: "DM Sans", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { color: "#7B2CF5" }, button: { radius: 0, shadow: "hard", color: "#E550D8", text: "#FFFFFF" } }) },
  bloom: { name: "Bloom", d: D({ font: "Rubik", titleFont: "Rubik", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { style: "gradient", color: "#C2337A", color2: "#4B3CC9", dir: "down" }, button: { style: "outline", color: "#FFFFFF", text: "#FFFFFF" } }) },
  breeze: { name: "Breeze", d: D({ font: "Albert Sans", titleFont: "Albert Sans", textColor: "#3A1F3D", titleColor: "#3A1F3D", wallpaper: { style: "gradient", color: "#F5B8DA", color2: "#E8A4E8", dir: "down" }, button: { style: "glass", color: "#FFFFFF", text: "#3A1F3D" } }) },
  encore: { name: "Encore", d: D({ font: "Playfair Display", titleFont: "Playfair Display", textColor: "#F1C6B0", titleColor: "#F1C6B0", wallpaper: { style: "gradient", color: "#16161A", color2: "#3A1D14", dir: "radial" }, button: { style: "outline", radius: 0, color: "#F1C6B0", text: "#F1C6B0" } }) },
  grid: { name: "Grid", d: D({ font: "Belanosima", titleFont: "Belanosima", textColor: "#111111", titleColor: "#111111", wallpaper: { style: "pattern", color: "#DDEFA6", color2: "#B9D46A", pattern: "grid" }, button: { radius: 1, shadow: "hard", color: "#FFFFFF", text: "#111111" } }) },
  groove: { name: "Groove", d: D({ font: "Syne", titleFont: "Syne", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { style: "pattern", color: "#E2475A", color2: "#3A5BE0", pattern: "waves" }, button: { color: "#FFFFFF", text: "#1E1E1E" } }) },
  haven: { name: "Haven", d: D({ font: "Lora", titleFont: "Lora", textColor: "#4A4033", titleColor: "#4A4033", wallpaper: { style: "gradient", color: "#C9B9A1", color2: "#A99579", dir: "down" }, button: { style: "glass", radius: 2, color: "#FFFFFF", text: "#4A4033" } }) },
  lake: { name: "Lake", d: D({ font: "Inter", titleFont: "Inter", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { style: "gradient", color: "#1A2238", color2: "#05070D", dir: "down" }, button: { style: "glass", color: "#FFFFFF", text: "#FFFFFF" } }) },
  mineral: { name: "Mineral", d: D({ font: "Manrope", titleFont: "Manrope", textColor: "#4C3A2E", titleColor: "#4C3A2E", wallpaper: { color: "#FBEDE3" }, button: { style: "outline", color: "#4C3A2E", text: "#4C3A2E" } }) },
  nourish: { name: "Nourish", d: D({ font: "Bricolage Grotesque", titleFont: "Bricolage Grotesque", textColor: "#F4F1D0", titleColor: "#E4EC8C", wallpaper: { style: "gradient", color: "#6F7533", color2: "#4E5422", dir: "down" }, button: { color: "#E4EC8C", text: "#333814" } }) },
  rise: { name: "Rise", d: D({ font: "Syne", titleFont: "Syne", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { style: "gradient", color: "#F0764A", color2: "#4FB8A4", dir: "radial" }, button: { style: "outline", color: "#FFFFFF", text: "#FFFFFF" } }) },
  sweat: { name: "Sweat", d: D({ font: "Red Hat Display", titleFont: "Red Hat Display", textColor: "#FFFFFF", titleColor: "#FFFFFF", wallpaper: { style: "gradient", color: "#1C7FE0", color2: "#C21E8C", dir: "down" }, button: { color: "#3E7EF0", text: "#FFFFFF" } }) },
  tress: { name: "Tress", d: D({ font: "Playfair Display", titleFont: "Playfair Display", textColor: "#F3E8C8", titleColor: "#F3E8C8", wallpaper: { style: "gradient", color: "#5A4632", color2: "#2A1F14", dir: "down" }, button: { color: "#C9B98A", text: "#2A1F14" } }) },
  twilight: { name: "Twilight", d: D({ font: "Old Standard TT", titleFont: "Old Standard TT", textColor: "#F6E9FF", titleColor: "#F6E9FF", wallpaper: { style: "gradient", color: "#9A57C9", color2: "#3E3770", dir: "radial" }, button: { color: "#F2C3F1", text: "#3E3770" } }) },
  vox: { name: "Vox", d: D({ font: "Belanosima", titleFont: "Belanosima", textColor: "#FFFFFF", titleColor: "#FFE0D6", wallpaper: { style: "gradient", color: "#D0231E", color2: "#5E0A0A", dir: "radial" }, button: { radius: 2, color: "#B71C1C", text: "#FFFFFF" } }) },
} satisfies Record<string, T>;
export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = ["agate", "air", "astrid", "aura", "bliss", "blocks", "bloom", "breeze", "encore", "grid", "groove", "haven", "lake", "mineral", "nourish", "rise", "sweat", "tress", "twilight", "vox"] as const satisfies readonly ThemeId[];

export function themeDesign(id: ThemeId): Design {
  const t = THEMES[id] ?? THEMES.air;
  return { theme: id, ...structuredCloneSafe(t.d), header: "classic", titleStyle: "text", logo: "", stickers: [], hideFooter: false };
}
const structuredCloneSafe = <X,>(x: X): X => JSON.parse(JSON.stringify(x));
/** Apply a theme to an existing design, keeping the parts a theme doesn't own (header layout, logo, stickers, footer). */
export const applyTheme = (cur: Design, id: ThemeId): Design => ({ ...themeDesign(id), header: cur.header, titleStyle: cur.titleStyle, logo: cur.logo, stickers: cur.stickers, hideFooter: cur.hideFooter });
