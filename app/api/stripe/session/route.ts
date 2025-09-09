// app/api/stripe/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
const stripe = new Stripe(
  (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || "") as string,
  { apiVersion: "2024-06-20" }
);

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("session_id");
    if (!id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    const s = await stripe.checkout.sessions.retrieve(id, { expand: ["customer_details"] });
    return NextResponse.json({
      id: s.id,
      amount: s.amount_total,
      currency: s.currency?.toUpperCase() || null,
      email: s.customer_details?.email || null,
      payment_status: s.payment_status,
      mode: s.mode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load session" }, { status: 500 });
  }
}
