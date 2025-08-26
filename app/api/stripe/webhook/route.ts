import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Try verification with live first (if present), then test.
function verifyWithEitherSecret(raw: Buffer, signature: string): Stripe.Event {
  const live = process.env.STRIPE_WEBHOOK_SECRET_LIVE?.trim();
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST?.trim();

  if (!live && !test) {
    throw new Error("No webhook signing secrets configured.");
  }

  if (live) {
    try {
      return stripe.webhooks.constructEvent(raw, signature, live);
    } catch {
      // fall through
    }
  }
  if (test) {
    return stripe.webhooks.constructEvent(raw, signature, test);
  }
  throw new Error("Verification failed with all configured secrets.");
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature") || "";
    // IMPORTANT: use the raw bytes as a Buffer
    const raw = Buffer.from(await req.arrayBuffer());

    const event = verifyWithEitherSecret(raw, signature);

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: fulfill, email, Sheets, etc.
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }
}
