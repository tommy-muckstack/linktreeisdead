"use client";
// My account: sign-in state, username, email, password (Firebase, shared across IsDead apps), sign out, delete data.
import { useState } from "react";
import { BP } from "@/lib/basepath";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { I } from "@/components/icons";
import { DashHead } from "@/components/admin/AdminChrome";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Btn, Field, Row } from "@/components/admin/ui";
import { track, EVENTS, resetIdentity } from "@/lib/analytics";

export function AccountDash({ config }: { config: FirebaseClientConfig | null }) {
  const { page, user, rename, toast } = useAdmin();
  const [h, setH] = useState(page.handle); const [hErr, setHErr] = useState("");
  const [email, setEmail] = useState(user.email); const [eMsg, setEMsg] = useState("");
  const [cur, setCur] = useState(""); const [pw, setPw] = useState(""); const [pMsg, setPMsg] = useState(""); const [busy, setBusy] = useState("");
  const signIn = `${BP}/login?callbackUrl=${encodeURIComponent(BP + "/app/account")}`;
  const changePw = async () => {
    if (!config) return setPMsg("Sign-in isn't configured on this deployment."); if (pw.length < 6) return setPMsg("Use at least 6 characters.");
    setBusy("pw"); setPMsg("");
    try { const { clientAuth } = await import("@/lib/isdead-auth/client"); const { signInWithEmailAndPassword, updatePassword } = await import("firebase/auth"); const auth = await clientAuth(config); const cred = await signInWithEmailAndPassword(auth, user.email, cur); await updatePassword(cred.user, pw); setCur(""); setPw(""); setPMsg("Password updated."); }
    catch (e: any) { setPMsg(e?.code === "auth/wrong-password" || e?.code === "auth/invalid-credential" ? "Your current password isn't right." : e?.code === "auth/weak-password" ? "Pick a stronger password." : "Couldn't change your password. If you sign in with Google, manage it in your Google account."); }
    setBusy("");
  };
  return <>
    <DashHead title="My account" />
    <div className="ad-dbody">
      {user.guest ? <div className="ad-note ad-note--info"><I n="user" s={18} /><div><b>You're using LinktreeIsDead as a guest.</b><br />Your page works and is public, but it lives in this browser's session. Create a free account (Google or email) to keep it and edit it anywhere.<div className="ad-mini" style={{ marginTop: 12 }}><a className="ad-btn ad-btn--primary" href={`${BP}/login?mode=signup&callbackUrl=${encodeURIComponent(BP + "/app/account")}`}>Create free account</a><a className="ad-btn ad-btn--secondary" href={signIn}>Sign in</a></div></div></div>
        : <div className="ad-tile"><Row label="Signed in as" sub={user.demo ? "Demo account (resets)" : user.email}><Btn kind="secondary" onClick={async () => { track(EVENTS.app_signed_out); resetIdentity(); await fetch(`${BP}/api/session/logout`, { method: "POST" }); location.assign(`${BP}/`); }}>Sign out</Btn></Row></div>}

      <div className="ad-tile" style={{ marginTop: 16 }}><h3 className="ad-sec">Username</h3><p className="ad-sub">Your page link is {BP}/u/{page.handle}</p>
        <div className="ad-mini"><input className="ad-input" aria-label="Username" value={h} onChange={e => { setH(e.target.value.toLowerCase().trim()); setHErr(""); }} /><Btn disabled={h === page.handle || busy === "h"} onClick={async () => { setBusy("h"); const e = await rename(h); setBusy(""); if (e) setHErr(e); else toast("Username updated"); }}>Save</Btn></div>{hErr && <p className="ad-help ad-err">{hErr}</p>}</div>

      {!user.guest && !user.demo && <>
        <div className="ad-tile" style={{ marginTop: 16 }}><h3 className="ad-sec">Email</h3><p className="ad-sub">Your sign-in email is shared by every IsDead app.</p>
          <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); setEMsg(""); }} />
          <Btn disabled={email === user.email || busy === "e"} onClick={async () => { setBusy("e"); const r = await fetch(`${BP}/api/account`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const j = await r.json().catch(() => ({})); setBusy(""); setEMsg(r.ok ? "Email updated. Use it next time you sign in." : j.error ?? "Couldn't change it."); }}>Change email</Btn>{eMsg && <p className="ad-help" role="status">{eMsg}</p>}</div>
        <div className="ad-tile" style={{ marginTop: 16 }}><h3 className="ad-sec">Password</h3>
          <Field label="Current password" type="password" value={cur} onChange={setCur} /><Field label="New password" type="password" value={pw} onChange={setPw} />
          <Btn disabled={!cur || !pw || busy === "pw"} onClick={changePw}>{busy === "pw" ? "Saving…" : "Change password"}</Btn>{pMsg && <p className="ad-help" role="status">{pMsg}</p>}</div>
      </>}

      {!user.demo && <div className="ad-tile" style={{ marginTop: 16 }}><h3 className="ad-sec">Delete your LinktreeIsDead data</h3><p className="ad-sub">Deletes your page, its insights, contacts, messages and planned posts, then signs you out. Your sign-in for other IsDead apps stays.</p>
        <Btn kind="danger" icon="trash" onClick={async () => { if (prompt(`Type ${page.handle} to delete your page for good.`) !== page.handle) return; track(EVENTS.app_data_deleted); resetIdentity(); await fetch(`${BP}/api/account`, { method: "DELETE" }); location.assign(`${BP}/`); }}>Delete my page and data</Btn></div>}
    </div>
  </>;
}
