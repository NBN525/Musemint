// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Force Node runtime so we can read the raw body for Stripe verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- ENV you need in Vercel ---
// STRIPE_SECRET_KEY_LIVE   = sk_live_...
// STRIPE_SECRET_KEY_TEST   = sk_test_...
// STRIPE_WEBHOOK_SECRET_LIVE = whsec_...(live endpoint’s secret)
// STRIPE_WEBHOOK_SECRET_TEST = whsec_...(test endpoint’s secret)
// SHEET_WEBHOOK_URL (optional) = https://script.google.com/.../exec

const stripeLive = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE || "", { apiVersion: "2023-10-16" });
const stripeTest = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || "", { apiVersion: "2023-10-16" });

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
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // IMPORTANT: we must read the raw text body (not JSON) for Stripe verification
  const rawBody = await req.text();

  const whLive = process.env.STRIPE_WEBHOOK_SECRET_LIVE || "";
  const whTest = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";

  let event: Stripe.Event | null = null;
  let mode: "live" | "test" | null = null;

  // Try LIVE first, then TEST
  try {
    event = Stripe.webhooks.constructEvent(rawBody, sig, whLive);
    mode = "live";
  } catch {
    try {
      event = Stripe.webhooks.constructEvent(rawBody, sig, whTest);
      mode = "test";
    } catch (err) {
      console.error("Stripe signature verification failed for both secrets:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  // Choose the correct Stripe client for any follow-up API calls
  const stripe = mode === "live" ? stripeLive : stripeTest;

  // Handle the events you care about
  try {
    switch (event!.type) {
      case "checkout.session.completed": {
        const session = event!.data.object as Stripe.Checkout.Session;

        // Optionally fetch line items (needs the right client per mode)
        let lineItems: Stripe.ApiList<Stripe.LineItem> | null = null;
        if (session.id) {
          try {
            lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 25 });
          } catch (e) {
            console.warn("Could not fetch line items:", e);
          }
        }

        // Minimal payload for your Sheet (customize as you like)
        await postToSheet({
          timestamp: new Date().toISOString(),
          source: "Stripe",
          env: mode,
          event: event!.type,
          sessionId: session.id,
          customerEmail: session.customer_details?.email ?? null,
          amountTotal: session.amount_total, // in cents
          currency: session.currency,
          paymentStatus: session.payment_status,
          items: lineItems?.data?.map((li) => ({
            desc: li.description,
            qty: li.quantity,
            amount_subtotal: li.amount_subtotal,
            amount_total: li.amount_total,
          })) ?? [],
        });

        break;
      }

      // You can safely ignore other events for now
      default:
        // no-op
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  // Always acknowledge receipt
  return NextResponse.json({ received: true });
}
