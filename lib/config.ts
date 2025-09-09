// lib/config.ts
export const PRODUCT_NAME =
  process.env.NEXT_PUBLIC_PRODUCT_NAME || "Startup Business Planner (Pro)";

export const PRODUCT_PRICE = Number(
  process.env.NEXT_PUBLIC_PRODUCT_PRICE || 99
);

export const PRODUCT_CURRENCY =
  process.env.NEXT_PUBLIC_PRODUCT_CURRENCY || "CAD";

export const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL || ""; // Stripe Payment Link
export const PRODUCT_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL || ""; // Drive/Notion/Zip

// For convenience in UIs that import `PRODUCT`
export const PRODUCT = {
  name: PRODUCT_NAME,
  price: PRODUCT_PRICE,
  currency: PRODUCT_CURRENCY,
  buyUrl: BUY_URL,
  downloadUrl: PRODUCT_DOWNLOAD_URL,
};
