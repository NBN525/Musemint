// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe clients
const stripeLive = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE || "", { apiVersion: "2023-10-16" });
const stripeTest = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || "", { apiVersion: "2023-10-16" });

// Post to Google Sheets
async function postToSheet(payload: any) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Sheet webhook error:", err);
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();
  const whLive = process.env.STRIPE_WEBHOOK_SECRET_LIVE || "";
  const whTest = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";

  let event: Stripe.Event | null = null;
  let mode: "live" | "test" | null = null;

  try {
    event = Stripe.webhooks.constructEvent(rawBody, sig, whLive);
    mode = "live";
  } catch {
    try {
      event = Stripe.webhooks.constructEvent(rawBody, sig, whTest);
      mode = "test";
    } catch (err) {
      console.error("Signature failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const stripe = mode === "live" ? stripeLive : stripeTest;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // fetch line items
        let lineItems;
        try {
          lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
        } catch (e) {
          console.warn("Line item fetch failed", e);
        }

        await postToSheet({
          timestamp: new Date().toISOString(),
          environment: mode,
          eventType: event.type,
          sessionId: session.id,
          email: session.customer_details?.email,
          amountTotal: session.amount_total / 100, // to CAD/USD
          currency: session.currency,
          paymentStatus: session.payment_status,
          items: lineItems?.data.map(li => ({
            description: li.description,
            qty: li.quantity,
            subtotal: li.amount_subtotal / 100,
            total: li.amount_total / 100
          })) || [],
        });

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handling error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
