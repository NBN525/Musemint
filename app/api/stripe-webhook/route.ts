// works for GET (health) and POST (Stripe)
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

// Health check in the browser
export async function GET() {
  return NextResponse.json({ ok: true, route: "stripe webhook" });
}

// Optional: log to Google Sheet
async function postToSheet(payload: any) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((e) => console.error("sheet webhook error", e));
}

// Stripe webhook
export async function POST(req: NextRequest) {
  const raw = await req.text(); // raw body for signature verification
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing stripe-signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error("Signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await postToSheet({ source: "stripe", type: event.type, sessionId: session.id, ts: new Date().toISOString() });
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
