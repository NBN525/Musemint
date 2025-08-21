import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";          // allow raw body
export const dynamic = "force-dynamic";   // no caching

// Health checks so you don't get 405s in browser/Stripe pings
export async function GET()     { return NextResponse.json({ ok: true }); }
export async function HEAD()    { return new Response(null, { status: 200 }); }
export async function OPTIONS() { return new Response(null, { status: 200 }); }

// Webhook POST
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
  const secret = process.env.STRIPE_WEBHOOK_SECRET!; // from this very endpoint in Stripe

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const url = process.env.SHEET_WEBHOOK_URL;
      if (url) {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: "Stripe",
            event: event.type,
            sessionId: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            status: session.status,
          }),
        });
      }
    } catch (e) {
      console.error("Sheet logging failed", e);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
