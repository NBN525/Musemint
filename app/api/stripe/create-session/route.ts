// app/api/stripe/create-session/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  try {
    const { quantity = 1 } = await req.json().catch(() => ({ quantity: 1 }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity,
        },
      ],
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      automatic_tax: { enabled: false }, // flip to true if/when you enable Stripe Tax
      metadata: {
        product: "MuseMint Planner",
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("create-session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
