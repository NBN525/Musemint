// app/api/stripe/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
  // Use LIVE by default; you can switch to TEST by swapping the env key
  const key =
    process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    // Optional: accept quantity from the client; default to 1
    const { quantity = 1 } = await req.json().catch(() => ({ quantity: 1 }));

    // Your fixed price ID (the one you created in Stripe)
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID" },
        { status: 500 }
      );
    }

    // Base site URL for redirects (env set in step 1)
    const baseUrl = process.env.SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      // Collect email so it appears on your success page
      customer_creation: "if_required",
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
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
