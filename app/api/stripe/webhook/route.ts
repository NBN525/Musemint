// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { appendToSales } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

export async function GET() {
  return NextResponse.json({ received: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Pull some nice-to-have fields (not all are always present)
        const email =
          (session.customer_details && session.customer_details.email) ||
          (session.customer as string | undefined); // if expanded elsewhere
        const name = session.customer_details?.name || "";
        const amount_total = session.amount_total ?? undefined;
        const currency = session.currency || "";
        const payment_status = session.payment_status || "";
        const mode = session.mode || "";
        const session_id = session.id;
        const customer_id = typeof session.customer === "string" ? session.customer : undefined;

        // Log to the new Sales sheet
        await appendToSales({
          event_type: event.type,
          email,
          name,
          amount_total,
          currency,
          payment_status,
          mode,
          session_id,
          customer_id,
          notes: "Stripe checkout.session.completed",
        });

        break;
      }
      default:
        // no-op
        break;
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
