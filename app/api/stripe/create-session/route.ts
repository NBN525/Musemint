// app/api/stripe/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * ENV expected:
 * - STRIPE_SECRET_KEY_LIVE (or STRIPE_SECRET_KEY)
 * - STRIPE_PRICE_ID                (the Price ID for this product)
 * - SITE_URL                       (e.g., https://ai.rstglobal.ca)
 * - PRODUCT_NAME   (optional; used in metadata, fallback "Startup Planner (Pro)")
 * - PRODUCT_SKU    (optional; used in metadata, fallback "PLANNER-PRO")
 */
function getStripe() {
  const key =
    process.env.STRIPE_SECRET_KEY_LIVE ||
    process.env.STRIPE_SECRET_KEY ||
    "";
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    // Allow client to pass quantity; default = 1
    const { quantity = 1 } = await req.json().catch(() => ({ quantity: 1 }));

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const productName =
      process.env.PRODUCT_NAME || "Startup Planner (Pro)";
    const productSku =
      process.env.PRODUCT_SKU || "PLANNER-PRO";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      // Capture email so it's available in the webhook
      customer_creation: "if_required",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },

      // Helpful for downstream logging & emails
      metadata: {
        product: productName,
        sku: productSku,
        app: "musemint",
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("[create-session] error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
