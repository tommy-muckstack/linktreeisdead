import type { PBCfg } from "@/components/PricingBody";
export const pricingCfg: PBCfg = {
  vars: { "--plan-min": "460px", "--ink": "#254f1a", "--accent": "#8129d9", "--accent-ink": "#fff", "--soft": "#e9c0e9", "--bg": "#f3f3f1", "--hero-bg": "#f3f3f1", "--hero-pt": "96px", "--hero-pb": "40px", "--h1": "64px", "--h1-ls": "-1.2px", "--h-weight": "800", "--card-r": "24px", "--btn-r": "9999px", "--plan-h2": "24px", "--plan-h2-lh": "30px", "--row": "44px", "--faq-bg": "#f3f3f1", "--faq-card": "#fff", "--cta-bg": "#8129d9", "--max": "1100px", "--tbl-bg": "#f3f3f1", "--plan-bd": "0" } as Record<string, string>,
  title: "Pick your plan. Make it yours.", toggle: ["Annual", "Monthly"],
  plans: [
    { name: "Free", price: "$0", desc: "Everything you need to start", cta: "Get started for free", lead: "Includes:", feats: ["Unlimited links", "Basic analytics", "Custom themes"] },
    { name: "Starter", price: "$0", per: "/month", desc: "Grow with more control", cta: "Get started", lead: "Everything in Free, plus:", feats: ["Remove branding", "Link scheduling", "Email collection"] },
    { name: "Pro", price: "$0", per: "/month", desc: "Level up with advanced analytics", cta: "Get started", hot: true, tag: "Most popular", lead: "Everything in Starter, plus:", feats: ["Advanced analytics", "Custom fonts", "Priority support", "Social planner"] },
    { name: "Premium", price: "$0", per: "/month", desc: "The full toolkit for creators", cta: "Get started", lead: "Everything in Pro, plus:", feats: ["Team seats", "Sales tools", "Priority review"] },
  ],
  extra: { title: "Agency or Enterprise", text: "Powerful link management for teams, brands and agencies.", cta: "Contact us", bullets: ["Team seats", "SSO", "Dedicated support", "Custom reporting"] },
  tableTitle: "All Features", cols: ["Free", "Starter", "Pro", "Premium"],
  groups: [["Links", ["Unlimited links", "Link scheduling", "Link thumbnails", "Link layouts"]], ["Design", ["Themes", "Custom fonts", "Custom backgrounds", "Remove branding"]], ["Analytics", ["Views and clicks", "Locations", "Referrers", "Conversions"]], ["Monetize", ["Tips and payments", "Product links", "Email collection"]]],
  faqTitle: "Frequently asked questions", faqs: [["Is Linktree free?", "This open-source version is free."], ["Can I upgrade or downgrade?", "There is nothing to upgrade."], ["What payment methods are accepted?", "None needed."], ["Do you offer refunds?", "There is nothing to refund."]],
  cta: { title: "Jumpstart your corner of the internet today", btn: "Get started for free" },
  fill: 140,
  fillMobile: 10,
};
