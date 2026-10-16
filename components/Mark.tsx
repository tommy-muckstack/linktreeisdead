// LinktreeIsDead brand mark: the IsDead tombstone (shared silhouette with the other clones) in Linktree lime and forest green. Original art.
export const BRAND = { lime: "#D2E823", forest: "#254F1A" };
export function Mark({ size = 28, rounded = true }: { size?: number; rounded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
    <rect width="32" height="32" rx={rounded ? 8 : 0} fill={BRAND.lime} />
    <g fill={BRAND.forest}><path d="M16 5.5a8 8 0 0 1 8 8V24H8V13.5a8 8 0 0 1 8-8z" /><rect x="5" y="23" width="22" height="4.5" rx="1.6" /></g>
    <path d="M12.2 11.8l7.6 7.6M19.8 11.8l-7.6 7.6" stroke={BRAND.lime} strokeWidth="2.6" strokeLinecap="round" fill="none" />
  </svg>;
}
