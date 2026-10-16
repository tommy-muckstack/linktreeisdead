"use client";
// Linktree-style split login / signup. Art is an original flat illustration.
import { useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { useAuth } from "@/components/useAuth";

const GG = <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;

function Wordmark() {
  return <Link href="/" className="lg-logo" aria-label="Home"><Mark size={34} /><span>LinktreeIsDead</span></Link>;
}
const rot = (a: number, x: number, y: number) => `rotate(${a} ${x} ${y})`;
function ArtLogin() {
  return <svg className="lg-svg" viewBox="0 0 512 594" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <rect width="512" height="594" fill="#2459c9" />
    <polygon points="98,75 236,58 468,38 468,445 98,445" fill="#c4d919" />
    <path d="M276 88 q22 -14 40 4 q22 40 30 120 q4 60 -30 70 l-70 0 q-18 -90 14 -160z" fill="#1f4cae" />
    {/* person */}
    <path d="M186 262 q8 -32 58 -34 q56 -2 74 30 q22 70 18 170 q-2 36 -14 56 l-122 0 q-12 -70 -14 -150 q-2 -40 0 -72z" fill="#1696d8" />
    <path d="M188 262 q-14 70 -10 160 q2 30 6 42 l30 6 q-8 -90 -6 -206z" fill="#1384c4" />
    <path d="M214 300 q50 -14 96 14 M214 346 q50 -14 100 12 M216 392 q50 -12 102 12 M222 436 q46 -10 92 8" stroke="#52c8f2" strokeWidth="3" fill="none" opacity=".75" />
    <path d="M200 488 l122 0 l-4 86 l-102 0z" fill="#c9b08a" /><path d="M262 490 l0 84" stroke="#b49a72" strokeWidth="2" />
    <ellipse cx="160" cy="476" rx="20" ry="14" fill="#c27c5c" transform={rot(-30, 160, 476)} />
    <ellipse cx="204" cy="196" rx="36" ry="48" fill="#2a1a14" />
    <ellipse cx="216" cy="204" rx="29" ry="36" fill="#a8644a" />
    <path d="M176 186 q-4 -72 48 -76 q52 4 50 70 z" fill="#f2e6c6" /><rect x="174" y="168" width="102" height="28" rx="14" fill="#efe2bd" />
    <rect x="186" y="192" width="48" height="24" rx="11" fill="#1a49d8" /><rect x="192" y="197" width="36" height="13" rx="6" fill="#bcd3ff" opacity=".55" />
    <ellipse cx="158" cy="322" rx="70" ry="24" fill="#ece8dc" transform={rot(-12, 158, 322)} /><path d="M92 326 q10 -36 60 -40 q50 -4 70 14 q-24 30 -130 26z" fill="#d6d0bf" /><path d="M96 332 q60 14 128 -10" stroke="#3a3a3a" strokeWidth="5" fill="none" />
    {/* orange circles */}
    {[47, 115, 185].map((y, i) => <g key={y}><circle cx="405" cy={y} r="31" fill="#ff6a00" />{i === 0 && <><rect x="392" y={y - 12} width="26" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="3" /><circle cx="405" cy={y} r="5" fill="none" stroke="#fff" strokeWidth="3" /></>}{i === 1 && <><rect x="389" y={y - 10} width="32" height="22" rx="7" fill="#fff" /><path d={`M401 ${y - 5} l10 6 -10 6z`} fill="#ff6a00" /></>}{i === 2 && <><circle cx="405" cy={y} r="14" fill="#fff" /><path d={`M396 ${y - 4} q9 -3 17 2 M397 ${y + 2} q7 -2 13 2`} stroke="#ff6a00" strokeWidth="2.4" fill="none" /></>}</g>)}
    {/* beach video card */}
    <g transform={rot(0, 100, 100)}><rect x="59" y="52" width="172" height="118" rx="16" fill="#bfd7ee" /><clipPath id="vc"><rect x="59" y="52" width="172" height="118" rx="16" /></clipPath><g clipPath="url(#vc)"><rect x="59" y="52" width="172" height="46" fill="#cfe2f0" /><rect x="59" y="66" width="172" height="26" fill="#6a97a8" /><rect x="59" y="92" width="172" height="80" fill="#a4b06a" /><path d="M59 98 q60 -14 172 -4" stroke="#fff" strokeWidth="3" opacity=".8" fill="none" /></g><circle cx="80" cy="148" r="14" fill="#fff" /><rect x="76" y="141" width="3.4" height="14" fill="#222" /><rect x="82" y="141" width="3.4" height="14" fill="#222" /><rect x="100" y="146" width="48" height="5" rx="2.5" fill="#fff" /></g>
    {/* product card */}
    <g transform={rot(-4, 380, 390)}><rect x="303" y="310" width="133" height="160" rx="20" fill="#f6f0d8" /><rect x="309" y="316" width="121" height="124" rx="14" fill="#fff" /><rect x="360" y="338" width="20" height="14" rx="3" fill="#2b2b2b" /><rect x="368" y="326" width="22" height="6" rx="3" fill="#2b2b2b" /><rect x="350" y="350" width="40" height="76" rx="7" fill="#d6b27a" /><rect x="357" y="378" width="26" height="14" fill="#f6f0d8" /><text x="369" y="456" textAnchor="middle" fontSize="17" fill="#333" fontFamily="inherit">$36</text></g>
  </svg>;
}
function ArtSignup() {
  return <svg className="lg-svg" viewBox="0 0 512 594" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <defs><linearGradient id="vz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6a3fb5" /><stop offset=".5" stopColor="#c8582a" /><stop offset="1" stopColor="#1c6a6a" /></linearGradient></defs>
    <rect width="512" height="594" fill="#d4a22f" />
    <path d="M300 14 q150 -30 200 70 q10 120 -60 250 q-40 -20 -50 -100 q10 -140 -90 -220z" fill="#23282c" />
    <path d="M360 120 q70 30 100 70 q10 100 -40 160 q-50 -30 -60 -110z" fill="url(#vz)" opacity=".92" />
    <g transform={rot(5, 256, 300)}><rect x="148" y="68" width="215" height="462" rx="20" fill="#86593b" transform="translate(0,0)" />
      <circle cx="258" cy="143" r="33" fill="#e8a768" /><path d="M230 145 q4 -42 30 -40 q26 0 28 40 q-10 -22 -28 -22 q-20 0 -30 22z" fill="#2a1a14" /><ellipse cx="258" cy="150" rx="15" ry="19" fill="#8a5233" />
      <text x="258" y="200" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="inherit">Nikole Brake</text><text x="258" y="217" textAnchor="middle" fontSize="10.5" fill="#f4e6d8" fontFamily="inherit">Founder of Shape Shifters</text>
      {[["Slow flow", 245], ["Online courses", 290], ["Wellness retreats", 330]].map(([t, y]) => <g key={t as string}><rect x="158" y={y as number} width="195" height="40" rx="17" fill="#c7ac98" /><text x="238" y={(y as number) + 25} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#3a2a22" fontFamily="inherit">{t}</text><path d={`M326 ${(y as number) + 17} l5 5 5 -5`} stroke="#3a2a22" strokeWidth="2" fill="none" /></g>)}</g>
    <g transform="translate(-512 0)">
    <g transform={rot(-5, 640, 205)}><rect x="556" y="118" width="166" height="177" rx="20" fill="#c71ed9" /><circle cx="595" cy="156" r="25" fill="#e8a768" /><path d="M572 158 q6 -34 24 -30 q20 0 24 30 q-10 -18 -24 -18 q-14 0 -24 18z" fill="#2a1a14" /><rect x="627" y="148" width="46" height="9" rx="4.5" fill="#f3a0ff" /><rect x="627" y="164" width="34" height="9" rx="4.5" fill="#f3a0ff" /><circle cx="697" cy="153" r="12" fill="#fff" /><circle cx="697" cy="153" r="5" fill="none" stroke="#c71ed9" strokeWidth="2" /></g>
    <g transform={rot(-6, 605, 218)}><rect x="537" y="192" width="138" height="52" rx="26" fill="#fff" /><g stroke="#222" strokeWidth="2.6" strokeLinecap="round"><path d="M561 210 v14 M554 213 l14 8 M568 213 l-14 8" /></g><text x="576" y="223" fontSize="14" fontWeight="600" fill="#222" fontFamily="inherit">/shapeshft3rs</text></g>
    {[[601, 409], [654, 414], [708, 418]].map(([x, y], i) => <g key={x}><circle cx={x} cy={y} r="24" fill="#1f2230" />{i === 0 && <path d={`M${x - 9} ${y + 4} q9 5 17 -2 q6 -6 6 -12 q-4 3 -6 3 q-7 -8 -14 0 q-1 3 1 5 q-8 0 -13 -6 q-2 10 5 15z`} fill="#fff" />}{i === 1 && <><rect x={x - 11} y={y - 8} width="22" height="16" rx="5" fill="#fff" /><path d={`M${x - 3} ${y - 4} l7 4 -7 4z`} fill="#1f2230" /></>}{i === 2 && <path d={`M${x + 1} ${y - 11} v16 a5 5 0 1 1 -5 -5 M${x + 1} ${y - 11} q1 6 7 6`} stroke="#fff" strokeWidth="3" fill="none" />}</g>)}
    <g transform={rot(5, 870, 490)}><rect x="774" y="386" width="190" height="204" rx="20" fill="#f1b17a" /><path d="M800 480 q30 -90 100 -100 q40 -8 62 20 l0 190 l-168 0 q-4 -50 6 -110z" fill="#2a1a14" opacity=".9" /><path d="M830 420 q40 -40 100 -20 q8 50 -20 90 q-40 30 -80 -70z" fill="#d78a5a" /><circle cx="807" cy="543" r="22" fill="#fff" /><path d="M800 532 l18 11 -18 11z" fill="#222" /></g>
    </g>
  </svg>;
}
export function AuthScreen({ config, demo, to, signup = false }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup?: boolean }) {
  const a = useAuth({ config, demo, to, signup });
  const su = a.mode === "signup", reset = a.mode === "reset";
  const [focus, setFocus] = useState(false);
  const ready = a.email.trim().length > 0;
  return <main className="lg">
    <section className="lg-left">
      <Wordmark />
      <form className="lg-form" onSubmit={a.submit(true)}>
        <h1>{reset ? "Reset password" : su ? "Join Linktree" : "Welcome back"}</h1>
        <p className="lg-sub">{reset ? "We’ll email you a reset link." : su ? "Sign up for free!" : "Log in to your Linktree"}</p>
        {su ? <input className="lg-in lg-in--plain" type="email" placeholder="Email" aria-label="Email" value={a.email} onChange={e => a.setEmail(e.target.value)} required />
          : <label className={`lg-fl${focus || a.email ? " on" : ""}`}><span>{reset ? "Email" : "Email or username"}</span><input className="lg-in" type={reset ? "email" : "text"} value={a.email} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onChange={e => a.setEmail(e.target.value)} required autoComplete="username" /></label>}
        {a.step === 2 && !reset && <label className="lg-fl on"><span>Password</span><input className="lg-in" type="password" required minLength={6} autoFocus value={a.password} onChange={e => a.setPassword(e.target.value)} autoComplete={su ? "new-password" : "current-password"} /></label>}
        <button className={`lg-cta${ready ? " ready" : ""}`} disabled={a.busy}>{reset ? "Send reset link" : a.step === 2 ? (su ? "Create account" : "Log in") : "Continue"}</button>
        {su && a.step === 1 && <p className="lg-legal">By clicking <b>Continue</b>, you agree to Linktree’s <a href="#" onClick={a.off}>privacy notice</a>, <a href="#" onClick={a.off}>T&amp;Cs</a> and to receive offers, news and updates.</p>}
        {!reset && <><div className="lg-or">OR</div>
          <button type="button" className="lg-prov" onClick={a.google} disabled={a.busy}>{GG}<span>Continue with Google</span></button></>}
        {a.err && <p role="alert" className="lg-err">{a.err}</p>}{a.note && <p role="status" className="lg-ok">{a.note}</p>}
        {!su && !reset && <p className="lg-links"><a href="#" onClick={a.go("reset")}>Forgot password?</a> • <a href="#" onClick={a.off}>Forgot username?</a></p>}
        <p className={`lg-switch${su ? " su" : ""}`}>{reset ? <a href="#" onClick={a.go("signin")}>Back to log in</a> : su ? <>Already have an account? <a href="#" onClick={a.go("signin")}>Log in</a></> : <>Don’t have an account? <a href="#" onClick={a.go("signup")}>Sign up</a></>}</p>
        {a.demo && <button type="button" className="lg-demo" onClick={a.useDemo}>Use the demo account</button>}
      </form>
      {!a.configured && <p className="lg-cfg" role="status">Sign-in isn’t configured on this deployment yet.</p>}
      <span className="lg-cookie">Cookie preferences</span>
    </section>
    <aside className={`lg-right${su ? " su" : ""}`}>{su ? <ArtSignup /> : <ArtLogin />}</aside>
  </main>;
}
