// Page fonts. "Link Sans" is the default face; we ship Archivo (OFL) for it. Everything else loads from Google Fonts.
export const LOCAL_FONT = "Link Sans";
export const fontStack = (f: string) => (f === LOCAL_FONT || !f ? `"IsDead Archivo", system-ui, sans-serif` : `"${f}", system-ui, sans-serif`);
const SERIF = new Set(["BioRhyme", "Bitter", "Caudex", "Corben", "Domine", "Hahmlet", "IBM Plex Serif", "Lora", "Merriweather", "Noto Serif", "Old Standard TT", "PT Serif", "Playfair Display", "Roboto Serif", "Roboto Slab", "Source Serif 4"]);
export const isSerif = (f: string) => SERIF.has(f);
/** Google Fonts CSS URL for the given families (deduped, local face skipped). `text` subsets the download (used by the picker). */
export function googleFontsHref(families: string[], text?: string): string | null {
  const fs = [...new Set(families.filter(f => f && f !== LOCAL_FONT))];
  if (!fs.length) return null;
  const q = fs.map(f => "family=" + encodeURIComponent(f).replace(/%20/g, "+") + (text ? "" : ":wght@400;500;600;700")).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap${text ? "&text=" + encodeURIComponent(text) : ""}`;
}
