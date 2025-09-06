// app/lib/config.ts
export const PRODUCT = {
  name: process.env.PRODUCT_NAME || "MuseMint Planner Pro",
  short: process.env.PRODUCT_SHORT || "Pro planner + dashboard bundle",
  desc:
    process.env.PRODUCT_DESC ||
    "A polished, plug-and-play planning suite: weekly/monthly planners, goals, habit & finance trackers, plus a clean web dashboard and priority support.",
  bullets: (process.env.PRODUCT_BULLETS ||
    "Weekly & monthly planners;Goals + habit tracking;Finance & expenses dashboard;Export to PDF/Sheets;Priority email support").split(";"),
  priceNote:
    process.env.PRICE_NOTE ||
    "Intro special: $1 test purchase today, full license delivered instantly.",
  badge: process.env.PRODUCT_BADGE || "Instant download & updates",
};
