# LinktreeIsDead parity report

Reference: Linktree's logged-out pages and a free account's admin (with the 7-day Pro trial), walked on 2026-10-16. Owner scope: the home page, login and the app must look like Linktree. The app gets every paid-plan feature for free, with no login unless an action needs an account (guests land straight in the editor).

## Owner decisions
- **Auth:** Google + email/password only, through the shared yourappisdead Firebase. No Apple, SSO or verification emails. Password reset emails are fine.
- **Guests:** `/app` works without an account. A guest's page moves to their account when they sign in.
- **No selling:** Earn, Shop, products, orders and payouts are left out.
- **AI:** Enhance is a free rule-based check-up. Post ideas and the "Ask" assistant are left out, since they would cost money per call.
- **Social APIs:** the Social planner is offline (plan, copy and mark posted; it doesn't publish). Instagram auto-reply, follower growth and top-posts insights are left out.
- **Copy:** says "LinktreeIsDead". Only the legal not-affiliated line says Linktree. No Upgrade or Free-plan chrome.

## QA findings (LINKTREEISDEAD_FIX_PROMPT.md, 2026-10-16)
| # | Area | Status |
|---|---|---|
| 1 | Landing nav menus, marquee, nav sprite | Fixed in PR #4 |
| 2 | Footer links | Fixed in PR #4 |
| 3 | Pricing sync + testimonial | Fixed in PR #4 |
| 4 | Login: Apple, forgot username / password | Fixed in PR #4. Apple button left out on purpose (owner rule) |
| 5 | Signup: spinner, username, onboarding | Spinner in PR #4. Username picker + onboarding (goals, theme, platforms) at `/app/welcome` in this PR |
| 6 | URL-first add flow | Fixed: Add opens "Paste a link or search…". The URL is detected (video, music, platform icon, title) and opens the block editor |
| 7 | Delete confirmation / archive | Fixed: delete asks first, Archive keeps stats and restores |
| 8 | Thumbnails, layouts, scheduling, lock, redirect, prioritize, animations, collections | Fixed: Classic/Featured, thumbnail or icon, schedule start/end, code/age/sensitive lock, redirect, prioritize, 5 animations, collections (stack/grid/carousel) |
| 9 | Social icons | Fixed: 27 platforms with SVG icons, top/bottom position, per-icon on/off |
| 10 | Profile photo | Fixed: upload (resized in the browser, stored as its own file at `/img/<id>`), 5 header layouts, logo title |
| 11 | Themes / fonts / backgrounds / colours | Fixed: 20 themes recreated in CSS. Wallpaper fill/gradient/blur/pattern/image/video, button solid/glass/outline + 4 radii + 4 shadows + colours, 37 fonts, alt title font, stickers, hide footer |
| 12 | Live preview | Kept: phone preview on the right, preview toggle under 1180px |
| 13 | Public profile Share / Shop / rich cards | Share sheet, embeds, forms, FAQ, gallery, map, events, contact card, discount. Shop is an exception (no selling) |
| 14 | Counting + "1 clicks" | Fixed: correct plurals, per-link clicks, bot filter |
| 15 | Analytics | Fixed: 7/28/90/365-day ranges, views/clicks/unique visitors/contacts with change vs previous period, traffic sources, locations, devices, top links, lifetime totals, per-link insights |
| 16 | Settings | Fixed: username, email, password, sign out, delete data (My account) + page settings (SEO, pixels, UTM, lock, sensitive, subscribe, messages, support banner, about) |
| 17 | Dead sidebar / top-bar links | Fixed: every nav item is a real page. Upgrade removed (owner rule) |
| 18 | Share sheet + QR | Fixed: Share popover (copy, QR with PNG/SVG download, social intents, business card) |
| 19 | Signed-out `/app` opens a guest workspace | Exception: guest sessions are the owner's rule (no login unless needed) |
| 20 | Branded 404 | Fixed in PR #4 |
| 21 | Console | Clean: e2e asserts no page errors. Hydration mismatches fixed (origin is read after mount). Sign-in errors never show Firebase's raw text |
| 22 | 390px | Editor has a bottom tab bar + preview toggle, public page and dashboards are responsive. e2e checks no horizontal scroll |

## Admin surface vs Linktree
| Linktree | LinktreeIsDead |
|---|---|
| My Linktree (home: greeting, page card, last week, setup checklist) | `/app` |
| Editor rail: Content / Header / Design / Enhance / Settings | `/app/links`, `/header`, `/design` (#theme #wallpaper #buttons #text #colors #stickers #footer), `/enhance`, `/settings` |
| Add menu: Suggested, Social, Media, Contact, Events, Text, View all | Same categories (Commerce left out). Blocks: link, header, text, collection, video, music, gallery, map, FAQ, contact card, forms (contact/email/SMS/poll), discount, events, embed (Calendly, Cal.com, Typeform, Google Forms, Canva), PDF, RSS, messaging |
| Link editor: Details / Power-ups / Insights | `/app/links/edit/[id]` |
| Audience (contacts + integrations) | `/app/audience`: contacts, search, poll results, CSV export (replaces third-party sync) |
| Insights | `/app/insights` |
| Messaging | `/app/messaging` (visitor Message button → inbox, reply by email) |
| Media kit | `/app/media-kit` + public `/u/<handle>/media-kit` when published |
| Business cards (digital + physical) | `/app/business-cards`: card preview with QR, colour, vCard, print-ready PNG. Wallet passes left out (need paid developer accounts) |
| Social planner | `/app/social-planner`: offline calendar + list |
| Link shortener | `/app/link-shortener`: `/s/<code>`, custom back-halves, QR, click counts |
| Instagram auto-reply, Post ideas, Earn, curated celebrity themes, MCP/agent access, Canva/Mailchimp/etc. integrations | Left out (social API, AI cost, no selling, no people's names, third-party accounts) |

## Verification
- `scripts/e2e-admin.mjs`: guest deep link, paste-to-add, lock codes, archive/restore, themes, header layout, socials, public page (embed, locked link, form, message, share), Audience, Messaging, Insights, short link, planner, 390px. Runs against dev (`BASE=…`) and production (`npm run shots`).
- Unit tests: model (sanitising, migration, schedule, themes, embeds), store (rename, atomic counts, insights buckets, locks, UTM, guest adoption, contacts, short links), analytics taxonomy.
