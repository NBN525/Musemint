// /lib/config.ts
export const PRODUCT = {
  name: process.env.PRODUCT_NAME ?? "",
  short: process.env.PRODUCT_SHORT ?? "",
  desc: process.env.PRODUCT_DESC ?? "",
  bullets: (process.env.PRODUCT_BULLETS ?? "")
    .split(";")
    .map(s => s.trim())
    .filter(Boolean),
  badge: process.env.PRODUCT_BADGE ?? "",
  priceNote: process.env.PRICE_NOTE ?? "",
  currency: process.env.NEXT_PUBLIC_PRODUCT_CURRENCY ?? "USD",
  price: process.env.NEXT_PUBLIC_PRODUCT_PRICE
    ? Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE)
    : undefined,
};
