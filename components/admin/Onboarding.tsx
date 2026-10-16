"use client";
// First run for new accounts: username, goals, a theme, platforms. Skippable at every step.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BP } from "@/lib/basepath";
import { validateHandle, normalizeSocial, SOCIAL_NAMES, type SocialKind } from "@/lib/model";
import { THEMES, applyTheme, type ThemeId } from "@/lib/themes";
import { wallpaperCss, buttonCss } from "@/components/page/PageView";
import { fontStack } from "@/lib/fonts";
import { SocialIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Btn } from "@/components/admin/ui";
import { track, EVENTS } from "@/lib/analytics";


const GOALS = ["Creator", "Business", "Personal", "Musician", "Shop or brand", "Community"];
const PICKS: ThemeId[] = ["air", "nourish", "blocks", "bloom", "lake", "mineral", "agate", "grid"];
const PLATS: SocialKind[] = ["instagram", "tiktok", "youtube", "x", "threads", "facebook", "linkedin", "spotify", "github", "website"];
export function Onboarding() {
  const { page, edit, rename, flush } = useAdmin(); const router = useRouter();
  const [step, setStep] = useState(0); const [h, setH] = useState(page.handle); const [hErr, setHErr] = useState(""); const [busy, setBusy] = useState(false);
  const [goals, setGoals] = useState<string[]>(page.goals); const [plats, setPlats] = useState<Partial<Record<SocialKind, string>>>({});
  const finish = async (skipped = false) => {
    const socials = Object.entries(plats).flatMap(([k, v]) => { const u = normalizeSocial(k as SocialKind, v ?? ""); return u ? [{ kind: k as SocialKind, url: u, enabled: true }] : []; });
    track(EVENTS.auth_onboarding_completed, { skipped, goals: goals.length, socials: socials.length });
    edit(p => ({ ...p, onboarded: true, goals, socials: [...p.socials.filter(s => !socials.some(x => x.kind === s.kind)), ...socials] })); await flush(); router.push("/app/links");
  };
  const next = async () => {
    if (step === 0 && h !== page.handle) { const bad = validateHandle(h); if (bad) return setHErr(bad); setBusy(true); const e = await rename(h); setBusy(false); if (e) return setHErr(e); }
    if (step === 3) return finish(); setStep(s => s + 1);
  };
  return <div className="ad-onb">
    <header><Mark size={32} /><span>{step + 1} of 4</span><button type="button" className="ad-linkbtn" onClick={() => finish(true)}>Skip for now</button></header>
    <main>
      {step === 0 && <><h1>Claim your username</h1><p>Your page lives at one link you can put in every bio.</p><label className="ad-onb__h"><span>{BP}/u/</span><input autoFocus value={h} onChange={e => { setH(e.target.value.toLowerCase().trim()); setHErr(""); }} aria-label="Username" /></label>{hErr && <p className="ad-err">{hErr}</p>}</>}
      {step === 1 && <><h1>What brings you here?</h1><p>Pick any that fit. It helps us suggest the right blocks.</p><div className="ad-onb__chips">{GOALS.map(g => <button key={g} type="button" className={"ad-chip" + (goals.includes(g) ? " on" : "")} onClick={() => setGoals(x => x.includes(g) ? x.filter(y => y !== g) : [...x, g])}>{g}</button>)}</div></>}
      {step === 2 && <><h1>Pick a theme</h1><p>You can change everything later in Design.</p><div className="ad-themes" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>{PICKS.map(t => { const d = applyTheme(page.design, t); return <button key={t} type="button" className={"ad-theme" + (page.design.theme === t ? " on" : "")} onClick={() => edit(p => ({ ...p, design: applyTheme(p.design, t) }))}><span className="ad-theme__sw" style={{ ...wallpaperCss(d), fontFamily: fontStack(d.font), color: d.titleColor }}><b>Aa</b><i style={{ ...buttonCss(d), color: undefined }} /></span>{THEMES[t].name}</button>; })}</div></>}
      {step === 3 && <><h1>Where can people find you?</h1><p>Add your profiles. They show as icons under your bio.</p><div className="ad-list2">{PLATS.map(k => <label key={k} className="ad-mini"><span style={{ width: 28 }}><SocialIcon kind={k} s={22} /></span><input className="ad-input" placeholder={`${SOCIAL_NAMES[k]} link`} value={plats[k] ?? ""} onChange={e => setPlats(x => ({ ...x, [k]: e.target.value }))} /></label>)}</div></>}
      <div className="ad-mini" style={{ marginTop: 28 }}>{step > 0 && <Btn kind="secondary" onClick={() => setStep(s => s - 1)}>Back</Btn>}<span style={{ flex: 1 }} /><Btn onClick={next} disabled={busy}>{step === 3 ? "Finish" : "Continue"}</Btn></div>
    </main>
  </div>;
}
