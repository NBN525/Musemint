// app/api/stripe/webhook/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getSheetWebhookTargets, postToSheets } from "@/lib/sheets";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "test" | "live"
  return mode === "test"
    ? (process.env.STRIPE_WEBHOOK_SECRET_TEST || "")
    : (process.env.STRIPE_WEBHOOK_SECRET || "");
}

const resendKey = process.env.RESEND_API_KEY || "";
const resend = resendKey ? new Resend(resendKey) : null;
const debug = (process.env.WEBHOOK_DEBUG || "") === "1";

function logDebug(...args: any[]) {
  if (debug) console.log("[stripe-webhook]", ...args);
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();

  if (!secret) {
    logDebug("Missing webhook secret");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Stripe needs raw text for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    logDebug("Invalid signature", err?.message);
    return NextResponse.json({ error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 });
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

        const targets = getSheetWebhookTargets();
        logDebug("sheet targets:", targets);

        // Fire-and-forget side effects (don’t block Stripe)
        await postToSheets(targets, payload);

        if (resend && process.env.SALES_ALERT_TO) {
          try {
            await resend.emails.send({
              from: `MuseMint <hello@rstglobal.ca>`,
              to: [process.env.SALES_ALERT_TO],
              subject: `✅ New order — ${amount.toFixed(2)} ${currency}`,
              text: `Order ${session.id} from ${email}. Amount: ${amount.toFixed(2)} ${currency}.`,
            });
            logDebug("Resend: sent");
          } catch (e: any) {
            logDebug("Resend error:", e?.message || e);
          }
        } else {
          logDebug("Resend not configured or SALES_ALERT_TO missing");
        }

        break;
      }

      // Add more event handlers as needed (e.g., invoice.paid)
      default:
        logDebug("Unhandled event:", event.type);
        break;
    }
  } catch (err: any) {
    logDebug("Handler error:", err?.message || err);
    // Return 500 so Stripe retries if our handler breaks
    return NextResponse.json({ error: `Webhook handler error` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
