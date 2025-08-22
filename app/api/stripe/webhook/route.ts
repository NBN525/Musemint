// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Run on Node (not Edge) so we can read the raw body for signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

// optional: log to your Google Sheet
async function postToSheet(payload: any) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("sheet webhook error", e);
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Read raw body (required by Stripe verification)
  const rawBody = await req.text();

  // If we don’t have a secret configured, don’t break Stripe delivery
  if (!whSecret || !sig) {
    console.warn("Webhook signature checks disabled or missing header.");
    await postToSheet({
      when: new Date().toISOString(),
      source: "Stripe",
      note: "Missing STRIPE_WEBHOOK_SECRET or signature header",
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, whSecret);
  } catch (err: any) {
    console.error("❌ Signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Do your fulfillment here…
        await postToSheet({
          when: new Date().toISOString(),
          source: "Stripe",
          event: event.type,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email,
          status: session.payment_status,
        });
        break;
      }

      // A few common events — we just acknowledge them
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "customer.created":
      case "product.created":
      case "price.created": {
        // Acknowledge to avoid retries; log lightweight info
        await postToSheet({
          when: new Date().toISOString(),
          source: "Stripe",
          event: event.type,
        });
        break;
      }

      default: {
        // Ignore everything else with 200 OK (prevents retries)
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Handler error:", err?.message || err);
    // Return 200 so Stripe doesn’t endlessly retry non‑critical paths
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
