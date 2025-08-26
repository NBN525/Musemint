import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Verify using either live or test signing secret (whichever matches)
function verifyEventWithAnySecret(raw: string, sig: string): Stripe.Event {
  const live = process.env.STRIPE_WEBHOOK_SECRET_LIVE;
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST;

  // Try live first if present
  if (live) {
    try {
      return stripe.webhooks.constructEvent(raw, sig, live);
    } catch {
      /* fall through to try test */
    }
  }
  if (test) {
    return stripe.webhooks.constructEvent(raw, sig, test);
  }

  throw new Error(
    "No webhook signing secrets configured. Add STRIPE_WEBHOOK_SECRET_LIVE and/or STRIPE_WEBHOOK_SECRET_TEST."
  );
}

// Optional GET so hitting this route in a browser doesn’t 405
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = verifyEventWithAnySecret(rawBody, signature);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: deliver file/email, log to Sheets, etc.
        break;
      }
      // Add cases as needed
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
