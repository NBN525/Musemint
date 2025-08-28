// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { appendToSheet, appendToSales } from "@/lib/sheets";
import { sendSaleEmail } from "@/lib/email";

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
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    console.error("Missing webhook secret env");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Signature error:", err?.message);
    return NextResponse.json({ error: `Invalid signature: ${err?.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toUpperCase() as "LIVE" | "TEST";
      const amount_total = (session.amount_total ?? 0) / 100;
      const currency = (session.currency || "cad").toUpperCase();
      const email = session.customer_details?.email || "";
      const name = session.customer_details?.name || "";
      const payment_status = session.payment_status || "";
      const session_id = session.id;
      const customer_id =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      // Fire the three side effects and wait; Stripe will retry if we return 5xx
      const results = await Promise.allSettled([
        appendToSheet({
          table: "Stripe",
          row: {
            timestamp: new Date().toISOString(),
            source: "stripe",
            event: "checkout.session.completed",
            amount: String(amount_total),
            currency,
            mode,
            customer: email,
          },
        }),
        appendToSales({
          event_type: "checkout.session.completed",
          email,
          name,
          amount_total,
          currency,
          payment_status,
          session_id,
          customer_id,
          mode,
        }),
        sendSaleEmail({
          to: process.env.SALES_NOTIFY_TO || "",
          amount: amount_total,
          currency,
          email,
          sessionId: session_id,
          mode,
        }),
      ]);

      // Log outcomes for visibility
      results.forEach((r, i) => {
        const label = ["RST sheet", "Sales sheet", "Email"][i];
        if (r.status === "rejected") console.error(label, "rejected:", r.reason);
        else if (!(r.value as any)?.ok) console.error(label, "not ok:", r.value);
      });

      // If all three failed, ask Stripe to retry
      const allFailed = results.every(
        (r) => r.status === "rejected" || ((r as any).value && (r as any).value.ok === false)
      );
      if (allFailed) {
        return NextResponse.json({ error: "All side-effects failed" }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: `Webhook handler error: ${err?.message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
