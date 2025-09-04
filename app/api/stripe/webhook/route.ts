// app/api/stripe/webhook/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { postToSheets } from "@/lib/sheets";
import { Resend } from "resend";

// --- Stripe client (server-side secret) ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Pick test vs live webhook secret by env flag
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? (process.env.STRIPE_WEBHOOK_SECRET_TEST || "")
    : (process.env.STRIPE_WEBHOOK_SECRET || "");
}

// Optional Resend notifier
const resendKey = process.env.RESEND_API_KEY || "";
const resend = resendKey ? new Resend(resendKey) : null;

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
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

  // IMPORTANT: use raw text, not JSON
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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email =
          session.customer_details?.email ||
          session.customer_email ||
          "unknown@example.com";
        const amount = (session.amount_total ?? 0) / 100;
        const currency = (session.currency ?? "usd").toUpperCase();

        // Compose a single payload you can pivot in Sheets
        const payload = {
          source: "stripe",
          event: event.type,
          email,
          amount,
          currency,
          mode: session.mode,
          session_id: session.id,
          payment_status: session.payment_status,
          created_at: new Date().toISOString(),
        };

        // Post to one or both sheet webhooks (set any that apply)
        await postToSheets(
          [
            process.env.SHEET_WEBHOOK_URL_MUSEMINT, // MuseMint Sales Log
            process.env.SHEET_WEBHOOK_URL_RST,      // RST Global log
            process.env.SHEET_WEBHOOK_URL,          // Legacy/fallback
          ],
          payload
        );

        // Optional internal alert email (won’t block response)
        if (resend && process.env.SALES_ALERT_TO) {
          await resend.emails.send({
            from: `MuseMint <hello@rstglobal.ca>`,
            to: [process.env.SALES_ALERT_TO],
            subject: `✅ New order — ${amount.toFixed(2)} ${currency}`,
            text: `Order ${session.id} from ${email}. Amount: ${amount.toFixed(
              2
            )} ${currency}.`,
          });
        }
        break;
      }

      // You can add more events here (e.g., invoice.paid, customer.created)
      default:
        // no-op
        break;
    }
  } catch (err: any) {
    // If your handler throws, keep the 500 so Stripe retries
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
