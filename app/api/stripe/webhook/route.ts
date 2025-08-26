import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// Ensure this runs on the Node runtime (not edge) so raw body works.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Helper: choose correct webhook secret by mode
function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "test" or "live"
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

/** Optional GET so checking this route in a browser doesn’t 405 */
export async function GET() {
  return NextResponse.json({ received: true }, { status: 200 });
}

/** Stripe sends POST with a signed raw body */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // IMPORTANT: use the raw text, not JSON-parsed body
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    // Handle events you care about
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: your business logic here (log to Sheets, send email, etc.)
        break;
      }
      // Add more cases as needed
      default:
        // no-op for unhandled events
        break;
    }
  } catch (err: any) {
    // Your handler threw
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
