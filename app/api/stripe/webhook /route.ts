// app/api/stripe-webhook/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

/** Post a row to your Google Sheet webhook (Apps Script) */
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

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err?.message);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Optionally expand line items/customer if you want more detail:
        // const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items", "customer"] });

        await postToSheet({
          timestamp: new Date().toISOString(),
          source: "Stripe",
          type: "checkout.session.completed",
          session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email,
          status: session.payment_status,
        });
        break;
      }

      case "charge.refunded":
      case "charge.succeeded":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        const obj: any = event.data.object;
        await postToSheet({
          timestamp: new Date().toISOString(),
          source: "Stripe",
          type: event.type,
          amount: obj.amount ?? obj.amount_received ?? null,
          currency: obj.currency ?? null,
          customer_email: obj.receipt_email ?? null,
          status: obj.status ?? null,
        });
        break;
      }

      default:
        // no-op for other events
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ received: true, note: "handler error" }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
