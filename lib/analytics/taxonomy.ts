// Analytics taxonomy for the shared IsDead PostHog project (contract: yourappisdead/ANALYTICS.md, mirrored in docs/ANALYTICS.md).
// Super properties: product ("linktreeisdead"), surface ("landing" = logged-out marketing pages, "app" = the editor and the
// public pages it publishes), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>`: the product name lives in `product`, never in the event name. Visitor events on a
// public page are `app_profile_*`. Never send user content (titles, URLs, emails) as properties.
export const APP = "linktreeisdead" as const;
export type Surface = "landing" | "app";

export const EVENTS = {
  // ---- account ----
  app_signed_up: "app_signed_up",                  // method ("password")
  app_signed_in: "app_signed_in",                  // method ("password" | "google")
  app_signed_out: "app_signed_out",
  app_onboarding_completed: "app_onboarding_completed", // skipped (bool), goals (count), socials (count)
  // ---- dashboard ----
  app_username_changed: "app_username_changed",
  app_contacts_exported: "app_contacts_exported",  // box ("contacts")
  app_short_link_created: "app_short_link_created", // custom (bool)
  app_planner_post_saved: "app_planner_post_saved", // status, platforms (count)
  app_media_kit_published: "app_media_kit_published", // published (bool)
  app_business_card_downloaded: "app_business_card_downloaded", // format ("png" | "vcf")
  app_data_deleted: "app_data_deleted",
  // ---- page editor ----
  app_block_added: "app_block_added",              // block_type, source ("paste" | "catalog" | "quick" | "collection")
  app_block_archived: "app_block_archived",        // count
  app_block_deleted: "app_block_deleted",          // count
  app_block_toggled: "app_block_toggled",          // visible (bool)
  app_powerup_set: "app_powerup_set",              // powerup ("schedule" | "lock" | "animation" | "prioritize" | "redirect"), value
  app_theme_applied: "app_theme_applied",          // theme, source ("picker" | "shuffle" | "onboarding" | "enhance")
  app_header_layout_set: "app_header_layout_set",  // layout
  app_social_added: "app_social_added",            // platform
  app_setting_changed: "app_setting_changed",      // setting, on (bool)
  app_enhance_applied: "app_enhance_applied",      // tip
  app_page_shared: "app_page_shared",              // method ("copy" | "qr" | social id)
  app_qr_downloaded: "app_qr_downloaded",          // format ("png" | "svg")
  // ---- public profile (visitors) ----
  app_profile_viewed: "app_profile_viewed",        // has_video (bool), blocks (count)
  app_profile_link_clicked: "app_profile_link_clicked", // block_type, locked (bool)
  app_profile_form_submitted: "app_profile_form_submitted", // kind ("contact" | "email" | "sms" | "poll" | "subscribe" | "message")
  app_profile_shared: "app_profile_shared",        // method
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: APP, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment", "ads_blocked", "account_type"] as const;
