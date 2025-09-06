// app/api/stripe/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRODUCT } from "@/app/lib/config";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    const { quantity = 1 } = await req.json().catch(() => ({ quantity: 1 }));
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
    }

    const baseUrl = process.env.SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      customer_creation: "if_required",
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
      // add helpful metadata you can read in your webhook/email
      metadata: {
        product_name: PRODUCT.name,
        product_short: PRODUCT.short,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("create-session error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
