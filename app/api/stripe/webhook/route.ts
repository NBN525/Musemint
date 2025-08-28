// /app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { appendToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const amount = (session.amount_total ?? 0) / 100;
      const currency = (session.currency || "cad").toUpperCase();
      const customer = session.customer_details?.email || "";

      const row = {
        timestamp: new Date().toISOString(),
        source: "Stripe",
        event: "checkout.session.completed",
        amount: String(amount),
        currency,
        mode: (process.env.STRIPE_WEBHOOK_MODE || "live").toUpperCase(),
        customer,
      };

      // Log to both sheets (no errors if one is missing)
      await appendToSheet({
        url: process.env.SHEETS_WEBHOOK_URL,
        table: "RST_SMS_Log",
        row,
      });

      await appendToSheet({
        url: process.env.SHEETS_SALES_WEBHOOK_URL,
        table: "MuseMint_Sales_Log",
        row,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
