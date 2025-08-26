import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Pick secret by Vercel environment
function getWebhookSecret(): string {
  // VERCEL_ENV is "production" | "preview" | "development"
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  if (env === "production") {
    const live = process.env.STRIPE_WEBHOOK_SECRET_LIVE;
    if (!live) throw new Error("Missing STRIPE_WEBHOOK_SECRET_LIVE");
    return live;
  }
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST;
  if (!test) throw new Error("Missing STRIPE_WEBHOOK_SECRET_TEST");
  return test;
}

// GET helps avoid 405 when you visit the route in a browser
export async function GET() {
  return NextResponse.json({ received: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();

  // Use raw body (text) for verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: send email, deliver file, log to Sheets, etc.
        break;
      }
      default:
        break;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
