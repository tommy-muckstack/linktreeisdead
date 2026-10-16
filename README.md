# LinktreeIsDead

A free, open-source link-in-bio page builder. Part of [IsDead](https://yourappisdead.com): the open-source clones of paid SaaS. Served at `https://yourappisdead.com/linktreeisdead`.

- **Homepage** (`/`): mirrors the Linktree homepage structure with original copy and art, plus a price comparison (`#pricing`).
- **Login** (`/login`): shared IsDead Firebase auth (email/password + Google), one demo account in demo mode.
- **App** (`/app`): a Linktree-style admin with every paid-plan feature free. Editor (Content, Header, Design, Enhance, Settings) with live phone preview; Insights, Audience, Messaging, Media kit, Business cards, Social planner (offline), Link shortener; My account. Guests use it without signing up. See `docs/PARITY_REPORT.md`.
- **Public page** (`/u/<handle>`): server-rendered with themes, embeds, forms and locks. Links go through `/go/<handle>/<id>`, which counts the click and redirects only to the stored URL. Short links live at `/s/<code>`.

Design: theme `linktree` in `vendor/isdead-design` (canonical source `/workspace/isdead-design`), font Bricolage Grotesque (OFL), a lookalike for Linktree's proprietary face.

## Run

```
npm ci
npm run dev            # http://localhost:3000/linktreeisdead  (demo account available in dev)
npm test && npm run typecheck
npm run build && npm run shots   # production build smoke test (runs scripts/e2e-admin.mjs against next start)
```

Env (production): `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `AUTH_SECRET` (guest sessions), `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (analytics, see docs/ANALYTICS.md), optional `DEMO_MODE=1`, `ISDEAD_DATA_DIR`.

## Gaps

- Left out on purpose: selling (Earn/Shop), AI features, social-API tools (Instagram auto-reply, follower stats), wallet passes, third-party mailing-list sync (export CSV instead). See `docs/PARITY_REPORT.md`.
- Uploads (photos, thumbnails, galleries, wallpapers, logos, planner images, MP4 wallpapers up to 3.5 MB) are resized in the browser and stored as their own files (`img/<id>`, served at `/img/<id>`, 150 MB per account). Files nothing uses are cleaned up after 6 hours.

Not affiliated with Linktree. Apache-2.0.
