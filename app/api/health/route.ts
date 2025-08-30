import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const vars = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
    "SHEET_WEBHOOK_URL",
  ];

  const present = vars.filter((k) => !!process.env[k]);
  const missing = vars.filter((k) => !process.env[k]);

  return NextResponse.json({
    ok: missing.length === 0,
    present,
    missing,
    mode: process.env.STRIPE_WEBHOOK_MODE || "live",
    now: new Date().toISOString(),
  });
}
