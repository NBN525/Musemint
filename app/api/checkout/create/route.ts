import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST() {
  const priceId = process.env.STRIPE_PRICE_ID; // live Price ID (price_xxx)
  if (!priceId) {
    return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?canceled=1`,
    metadata: { source: "musemint-site" },
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
