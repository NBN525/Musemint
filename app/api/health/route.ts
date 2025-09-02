import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const present = (k: string) => Boolean(process.env[k] && String(process.env[k]).length);

  const env = {
    STRIPE_SECRET_KEY: present("STRIPE_SECRET_KEY"),
    STRIPE_PRICE_ID: present("STRIPE_PRICE_ID"),
    STRIPE_WEBHOOK_SECRET: present("STRIPE_WEBHOOK_SECRET") || present("STRIPE_WEBHOOK_SECRET_TEST"),
    SHEETS_WEBHOOK_URL: present("SHEETS_WEBHOOK_URL"),
    RESEND_API_KEY: present("RESEND_API_KEY"),
    TWILIO_ACCOUNT_SID: present("TWILIO_ACCOUNT_SID"),
  };

  return NextResponse.json({ ok: true, env }, { status: 200 });
}
