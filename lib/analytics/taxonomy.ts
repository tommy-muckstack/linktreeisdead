// Analytics taxonomy shared by every IsDead sub-app (one PostHog project for the family). See docs/ANALYTICS.md.
// Super properties: app, app_family, surface ("site" = logged-out pages incl. public profiles, "app" = the editor), base_path, env.
// Events are snake_case with a domain prefix: site_, auth_, app_ and this app's product nouns: link_ (editing blocks/design in
// the editor) and profile_ (visitors on a public page). Never send user content (titles, URLs, emails) as properties.
export const APP = "linktreeisdead" as const;
export const APP_FAMILY = "yourappisdead" as const;
export type Surface = "hub" | "site" | "app";

export const EVENTS = {
  // ---- marketing site ----
  site_page_viewed: "site_page_viewed",            // path
  // ---- auth ----
  auth_signed_out: "auth_signed_out",
  auth_onboarding_completed: "auth_onboarding_completed", // skipped (bool), goals (count), socials (count)
  // ---- admin dashboard ----
  app_page_viewed: "app_page_viewed",              // path
  app_username_changed: "app_username_changed",
  app_contacts_exported: "app_contacts_exported",  // box ("contacts")
  app_short_link_created: "app_short_link_created", // custom (bool)
  app_planner_post_saved: "app_planner_post_saved", // status, platforms (count)
  app_media_kit_published: "app_media_kit_published", // published (bool)
  app_business_card_downloaded: "app_business_card_downloaded", // format ("png" | "vcf")
  app_data_deleted: "app_data_deleted",
  // ---- page editor ----
  link_block_added: "link_block_added",            // block_type, source ("paste" | "catalog" | "quick" | "collection")
  link_block_archived: "link_block_archived",      // count
  link_block_deleted: "link_block_deleted",        // count
  link_block_toggled: "link_block_toggled",        // visible (bool)
  link_powerup_set: "link_powerup_set",            // powerup ("schedule" | "lock" | "animation" | "prioritize" | "redirect"), value
  link_theme_applied: "link_theme_applied",        // theme, source ("picker" | "shuffle" | "onboarding" | "enhance")
  link_header_layout_set: "link_header_layout_set", // layout
  link_social_added: "link_social_added",          // platform
  link_setting_changed: "link_setting_changed",    // setting, on (bool)
  link_enhance_applied: "link_enhance_applied",    // tip
  link_page_shared: "link_page_shared",            // method ("copy" | "qr" | social id)
  link_qr_downloaded: "link_qr_downloaded",        // format ("png" | "svg")
  // ---- public profile (visitors) ----
  profile_viewed: "profile_viewed",                // has_video (bool), blocks (count)
  profile_link_clicked: "profile_link_clicked",    // block_type, locked (bool)
  profile_form_submitted: "profile_form_submitted", // kind ("contact" | "email" | "sms" | "poll" | "subscribe" | "message")
  profile_shared: "profile_shared",                // method
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["site_", "auth_", "app_", "link_", "profile_"] as const;
