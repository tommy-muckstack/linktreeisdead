"use client";
import { useState } from "react";

// Rotating statements in the slot where the original shows customer testimonials. These are the project's own
// promises, attributed to the project, so nothing reads as a quote from a real person.
export const PROMISES: [string, string][] = [
  ["Every feature, free. No plans, no trials, no paywall.", "The LinktreeIsDead promise"],
  ["Your page, your links, your data. Export it or self-host it whenever you like.", "Why it's open source"],
  ["No sign-up wall for you or your visitors. Start building straight away.", "How the app works"],
];
export function LpPromises() {
  const [i, setI] = useState(0); const n = PROMISES.length; const [q, who] = PROMISES[i]!;
  return <>
    <blockquote aria-live="polite">“{q}”</blockquote><p>{who}<br />LinktreeIsDead</p>
    <div className="lp-arrows"><button type="button" aria-label="Previous" onClick={() => setI((i + n - 1) % n)}>←</button><button type="button" aria-label="Next" onClick={() => setI((i + 1) % n)}>→</button></div>
  </>;
}
