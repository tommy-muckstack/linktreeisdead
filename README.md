# LinktreeIsDead

A free, open-source link-in-bio page builder. Part of [IsDead](https://yourappisdead.com): the open-source clones of paid SaaS. Served at `https://yourappisdead.com/linktreeisdead`.

- **Homepage** (`/`): mirrors the Linktree homepage structure with original copy and art, plus a price comparison (`#pricing`).
- **Login** (`/login`): shared IsDead Firebase auth (email/password + Google), one demo account in demo mode.
- **App** (`/app`): links and headers (add, edit, drag or arrow reorder, hide), 8 themes, 3 button styles, 3 shapes, profile photo, social icons, analytics (views, clicks, CTR, 14-day chart, top links), handle change.
- **Public page** (`/u/<handle>`): server-rendered; links go through `/go/<handle>/<id>`, which counts the click and redirects to the stored URL only.

Design: theme `linktree` in `vendor/isdead-design` (canonical source `/workspace/isdead-design`), font Bricolage Grotesque (OFL), a lookalike for Linktree's proprietary face.

## Run

```
npm ci
npm run dev            # http://localhost:3000/linktreeisdead  (demo account available in dev)
npm test && npm run typecheck
npm run build && npm run shots   # production build smoke test + screenshots
```

Env (production): `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `AUTH_SECRET`, optional `DEMO_MODE=1`, `ISDEAD_DATA_DIR`.

## Gaps

- **Storage:** pages live in `lib/store.ts` (JSON files). That works locally but Vercel's disk is ephemeral, so production needs the Firestore swap (same collection/id → JSON shape).
- **Not built yet:** custom domains, link scheduling, email/music/video embeds, QR codes, removing the "Made with" footer toggle, per-link icons and thumbnails.
- Page views count every server render (including bots and link previews); there is no bot filtering or unique-visitor logic.
- Sign-in has not been tested against the live Firebase project (keys are pending).

Not affiliated with Linktree. Apache-2.0.
