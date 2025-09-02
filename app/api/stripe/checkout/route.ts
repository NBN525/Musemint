import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!secret || !priceId) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME || "MuseMint Planner";
  const successUrlBase = process.env.NEXT_PUBLIC_BASE_URL || "https://ai.rstglobal.ca";

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrlBase}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successUrlBase}/cancel`,
      metadata: { product: productName, site: "MuseMint" },
    });

    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
}
