import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Choose the correct signing secret by mode (set this via env var)
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "test" | "live"
  return mode === "test"
    ? (process.env.STRIPE_WEBHOOK_SECRET_TEST as string)
    : (process.env.STRIPE_WEBHOOK_SECRET as string);
}

// Optional: so visiting the route in a browser doesn’t 405
export async function GET() {
  return NextResponse.json({ received: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // IMPORTANT: raw body
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: send email via Resend + deliver download + log to Sheets
        break;
      }
      default:
        // no-op for other events for now
        break;
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
