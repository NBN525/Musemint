import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST() {
  try {
    // Bare portal for now; you can pass a customer id if you store one later.
    const session = await stripe.billingPortal.sessions.create({
      return_url: process.env.SITE_URL || "https://ai.rstglobal.ca",
    });
    return NextResponse.json({ url: session.url });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
