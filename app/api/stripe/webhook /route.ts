// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";         // raw body supported
export const dynamic = "force-dynamic";  // don’t cache webhook

// (A) Lightweight GET/HEAD handlers so any pings/health checks don't 405
export async function GET() {
  return NextResponse.json({ ok: true });
}
export async function HEAD() {
  return new Response(null, { status: 200 });
}

// (B) Your existing POST handler ↓ (keep your verification logic)
export async function POST(req: NextRequest) {
  // IMPORTANT: read the raw body as text for signature verification
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
  }

  // handle only events you care about
  if (event.type === "checkout.session.completed") {
    // ... your logic (sheet write, etc.)
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
