import { BP } from "@/lib/basepath";
import { THEMES, SOCIAL_LABEL, type Page } from "@/lib/model";
// Renders a link-in-bio page. `hrefFor` is null in the editor preview (links are inert) and the click-counting redirect on the public page.
export function PagePreview({ page, hrefFor, footer = true }: { page: Pick<Page, "title" | "bio" | "avatar" | "theme" | "buttonStyle" | "shape" | "links" | "socials">; hrefFor: ((id: string) => string) | null; footer?: boolean }) {
  const t = THEMES[page.theme] ?? THEMES.lime; const radius = page.shape === "pill" ? 999 : page.shape === "round" ? 14 : 2;
  const btn = (pageStyle: string): React.CSSProperties => pageStyle === "outline" ? { background: "transparent", color: t.text, border: `2px solid ${t.btnBorder}` } : pageStyle === "soft" ? { background: `color-mix(in srgb, ${t.btnBg} 16%, transparent)`, color: t.text, border: "2px solid transparent" } : { background: t.btnBg, color: t.btnText, border: `2px solid ${t.btnBorder}` };
  const initial = (page.title.trim()[0] ?? "?").toUpperCase();
  return <div className="lt-page" data-testid="page-preview" style={{ background: t.bg, color: t.text }}>
    <div className="lt-page__in">
      {page.avatar ? <img className="lt-avatar" src={page.avatar} alt="" /> : <div className="lt-avatar" style={{ background: t.avatarBg, color: t.avatarText }}>{initial}</div>}
      <h1 className="lt-title">{page.title}</h1>
      {page.bio && <p className="lt-bio" style={{ color: t.muted }}>{page.bio}</p>}
      {page.socials.length > 0 && <div className="lt-socials">{page.socials.map((s, i) => <a key={i} aria-label={s.kind} href={hrefFor ? s.url : undefined} onClick={hrefFor ? undefined : e => e.preventDefault()} rel="noopener noreferrer" style={{ color: t.text, borderColor: t.text }}>{SOCIAL_LABEL[s.kind]}</a>)}</div>}
      <div className="lt-links">{page.links.filter(l => l.enabled && (l.kind === "header" ? l.title : l.title && l.url)).map(l => l.kind === "header"
        ? <h2 key={l.id} className="lt-header" style={{ color: t.text }}>{l.title}</h2>
        : <a key={l.id} className="lt-btn" data-link-id={l.id} href={hrefFor ? hrefFor(l.id) : undefined} onClick={hrefFor ? undefined : e => e.preventDefault()} rel="noopener noreferrer" style={{ ...btn(page.buttonStyle), borderRadius: radius }}>{l.title}</a>)}</div>
      {footer && <a className="lt-foot" href={`${BP}/`} style={{ color: t.muted }}>Made with LinktreeIsDead</a>}
    </div>
  </div>;
}
