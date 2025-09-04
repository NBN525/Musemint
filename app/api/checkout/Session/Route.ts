// app/api/checkout/session/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe, PRICE_ID } from "@/lib/stripe";

export async function POST() {
  if (!PRICE_ID) {
    return NextResponse.json(
      { error: "Missing STRIPE_PRICE_ID" },
      { status: 500 }
    );
  }

  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/success`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: { product: "MuseMint Supporter Pass" },
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
