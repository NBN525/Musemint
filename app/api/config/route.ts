import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const mask = (v?: string) => (v ? `${v.slice(0,4)}…${v.slice(-4)}` : null);

  const cfg = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "n/a",
    productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || "n/a",
    stripe: {
      secret: process.env.STRIPE_SECRET_KEY ? mask(process.env.STRIPE_SECRET_KEY) : null,
      priceId: process.env.STRIPE_PRICE_ID || null,
      whLive: process.env.STRIPE_WEBHOOK_SECRET ? mask(process.env.STRIPE_WEBHOOK_SECRET) : null,
      whTest: process.env.STRIPE_WEBHOOK_SECRET_TEST ? mask(process.env.STRIPE_WEBHOOK_SECRET_TEST) : null,
    },
    sheetsWebhook: process.env.SHEETS_WEBHOOK_URL ? true : false,
    resendKey: process.env.RESEND_API_KEY ? true : false,
  };

  return NextResponse.json({ ok: true, cfg }, { status: 200 });
}
