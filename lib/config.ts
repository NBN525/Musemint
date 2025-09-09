// lib/config.ts
export function env() {
  return {
    productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || "Startup Business Planner (Pro)",
    currency: (process.env.NEXT_PUBLIC_PRODUCT_CURRENCY || "USD").toUpperCase(),
    listPrice: Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE || "99"),
    launchPrice: Number(process.env.NEXT_PUBLIC_PRODUCT_LAUNCH_PRICE || "49"),
    downloadUrl: process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL || "",

    resendFrom: process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>",
    resendTo: process.env.RESEND_TO || "",

    sheetsMuseMintUrl: process.env.SHEETS_MUSEMINT_URL || "",
    sheetsRstUrl: process.env.SHEETS_RST_URL || "",
  };
}
