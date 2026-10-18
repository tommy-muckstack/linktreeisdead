# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead sub-app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how LinktreeIsDead follows it.

## Setup per sub-app
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token (safe in the browser); `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`. No key → analytics is a no-op.
- Reverse proxy through the app's own origin: `/<basePath>/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true` so `/ingest/e/` is passed through unchanged).
- Mount `<Analytics />` once in the root layout; it boots the client and sends PostHog's built-in `$pageview` per route change (link-editor ids replaced by `:id`) (`capture_pageview` is off, autocapture is off, session replay is off).
- posthog-js drops events from bots and automated browsers (headless / `navigator.webdriver`), so Playwright never produces captures. In dev, `localStorage.isdead_ph_debug = "1"` turns on verbose logs and lets automated browsers capture (used by the verification script); production keeps the bot filter.

## Super properties (registered on every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `linktreeisdead` | the one property to filter by (the hub sends `yourappisdead`) |
| `surface` | `landing` \| `app` | `landing` = logged-out marketing pages (home, pricing, sign-in, footer pages); `app` = the editor and what it publishes (public pages `/u/*`, `/go/*`, short links `/s/*`) |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `demo` | registered after identification |

## Identity
Signed-in users are identified by their Firebase uid (shared across the family) with `account_type: "firebase"`. Demo
sessions are never identified (no person profile); `account_type: "demo"` is registered instead. Sign-out calls `reset()`.

## Event naming
`app_<object>_<action>`, snake_case, past tense. The product name is never in an event name (it's in `product`).

| group | events |
| --- | --- |
| account | `app_signed_up` (`method`: password), `app_signed_in` (`method`: password \| google), `app_signed_out`, `app_onboarding_completed` (`skipped`, `goals`, `socials`: counts) |
| dashboard | `app_username_changed`, `app_contacts_exported`, `app_short_link_created` (`custom`), `app_planner_post_saved` (`status`, `platforms`), `app_media_kit_published` (`published`), `app_business_card_downloaded` (`format`), `app_data_deleted` |
| page editor | `app_block_added` (`block_type`, `source`: paste \| catalog \| quick \| collection), `app_block_archived` / `_deleted` (`count`), `app_block_toggled` (`visible`), `app_powerup_set` (`powerup`, `value`), `app_theme_applied` (`theme`, `source`), `app_header_layout_set` (`layout`), `app_social_added` (`platform`), `app_setting_changed` (`setting`, `on`), `app_enhance_applied` (`tip`), `app_page_shared` (`method`), `app_qr_downloaded` (`format`) |
| public page visitors | `app_profile_viewed` (`blocks`, `has_video`), `app_profile_link_clicked` (`block_type`, `locked`), `app_profile_form_submitted` (`kind`), `app_profile_shared` (`method`) |

Rules:
- Properties are `snake_case`. Never send user content (text, emails, titles, file names) as a property; send kinds, counts and ids only.
- Adding an event = add it to `lib/analytics/taxonomy.ts` (the only place event names are defined) and this table. The unit test rejects names outside `app_` / `landing_` and names containing the product.
- `resetIdentity()` (sign-out) re-registers the super properties, since PostHog's `reset()` clears them.

## Where the calls live (LinktreeIsDead)
`lib/analytics/` (client + taxonomy), `components/admin/*` (editor and dashboard: AdminProvider identifies the user), `components/page/PageView.tsx` (public profile). Sign-in events fire from `components/useAuth.ts` with `trackNow` (sent before the redirect).
