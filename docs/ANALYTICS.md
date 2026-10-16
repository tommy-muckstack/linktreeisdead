# Analytics (PostHog) — IsDead family taxonomy

One PostHog project (US cloud, project **666931**) collects every IsDead sub-app. This document is the contract each
sub-app follows so one set of insights and dashboards works across all of them.

## Setup per sub-app
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token (safe in the browser); `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`. No key → analytics is a no-op.
- Reverse proxy through the app's own origin: `/<basePath>/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true` so `/ingest/e/` is passed through unchanged).
- Mount `<Analytics />` once in the root layout; it boots the client and sends one `*_page_viewed` per route change (`capture_pageview` is off, autocapture is off, session replay is off).
- posthog-js drops events from bots and automated browsers (headless / `navigator.webdriver`), so Playwright never produces captures. In dev, `localStorage.lt_ph_debug = "1"` turns on verbose logs and lets automated browsers capture (used by the verification script); production keeps the bot filter.

## Super properties (registered on every event)
| property | values | meaning |
| --- | --- | --- |
| `app` | `linktreeisdead`, `calendlyisdead`, … | which sub-app |
| `app_family` | `yourappisdead` | the family; lets one dashboard filter all sub-apps |
| `surface` | `hub` \| `site` \| `app` | `hub` = the yourappisdead.com hub (already live), `site` = a sub-app's logged-out marketing pages (home, pricing, sign-in), `app` = the signed-in product |
| `base_path` | `/linktreeisdead` | the sub-app's mount path |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `demo` | registered after identification |

## Identity
Signed-in users are identified by their Firebase uid (shared across the family) with `account_type: "firebase"`. Demo
sessions are never identified (no person profile); `account_type: "demo"` is registered instead. Sign-out calls `reset()`.

## Event naming
`snake_case`, prefixed by domain. Prefixes are the same in every sub-app:

| prefix | scope | examples |
| --- | --- | --- |
| `site_` | logged-out pages (home, pricing, login) | `site_page_viewed` |
| `auth_` | sign in / sign up | `auth_signed_out`, `auth_onboarding_completed` (`skipped`, `goals`, `socials`: counts) |
| `app_` | admin dashboard | `app_page_viewed` (`path`, edit ids replaced by `:id`), `app_username_changed`, `app_contacts_exported`, `app_short_link_created` (`custom`), `app_planner_post_saved` (`status`, `platforms`), `app_media_kit_published` (`published`), `app_business_card_downloaded` (`format`), `app_data_deleted` |
| `link_` | LinktreeIsDead's page editor | `link_block_added` (`block_type`, `source`: paste \| catalog \| quick \| collection), `link_block_archived` / `_deleted` (`count`), `link_block_toggled` (`visible`), `link_powerup_set` (`powerup`, `value`), `link_theme_applied` (`theme`, `source`), `link_header_layout_set` (`layout`), `link_social_added` (`platform`), `link_setting_changed` (`setting`, `on`), `link_enhance_applied` (`tip`), `link_page_shared` (`method`), `link_qr_downloaded` (`format`) |
| `profile_` | visitors on a public page (`surface: site`) | `profile_viewed` (`blocks`, `has_video`), `profile_link_clicked` (`block_type`, `locked`), `profile_form_submitted` (`kind`), `profile_shared` (`method`) |

Rules:
- Properties are `snake_case`. Never send user content (text, emails, titles, file names) as a property; send kinds, counts and ids only.
- Adding an event = add it to `lib/analytics/taxonomy.ts` (the only place event names are defined) and this table. The unit test rejects names outside the prefixes.
- Page views: `site_page_viewed` on the marketing surface, `app_page_viewed` inside the product, both with `path` and `$current_url` (so Web Analytics still works).

## Where the calls live (LinktreeIsDead)
`lib/analytics/` (client + taxonomy), `components/admin/*` (editor and dashboard: AdminProvider identifies the user), `components/page/PageView.tsx` (public profile). The public page doesn't send `site_page_viewed`; it sends `profile_viewed` instead.
