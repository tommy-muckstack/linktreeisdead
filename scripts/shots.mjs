// Production smoke test: serves the built app (next start) and runs the full admin + public-page walk-through against it.
// Run after `npm run build`.
import { spawnSync } from "node:child_process";
import { withApp } from "./shotlib.mjs";
await withApp("linktreeisdead", async ({ base }) => {
  const nf = await fetch(base + "/u/nobody-here-" + Date.now()); if (nf.status !== 404) throw new Error(`unknown handle returned ${nf.status}`);
  const r = spawnSync("node", ["scripts/e2e-admin.mjs"], { env: { ...process.env, BASE: base }, stdio: "inherit" });
  if (r.status) throw new Error("e2e-admin failed against the production build");
  console.log("linktreeisdead production smoke OK");
});
