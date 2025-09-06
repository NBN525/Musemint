// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendThankYouEmail, sendInternalSaleAlert } from "@/lib/email";
import { logSaleToSheets } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

function getMode(): "live" | "test" {
  return (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase() === "test"
    ? "test"
    : "live";
}

function getStripe(): Stripe {
  const key =
    (process.env.STRIPE_SECRET_KEY_LIVE ||
      process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET) ?? "";
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();
  const mode = getMode();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Invalid Stripe signature:", err?.message);
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const paid =
        session.payment_status === "paid" ||
        (session.status && session.status === "complete");

      const customerEmail =
        session.customer_details?.email || session.customer_email || undefined;
      const customerName = session.customer_details?.name || null;

      let receiptUrl: string | null = null;
      if (session.payment_intent && typeof session.payment_intent === "string") {
        try {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
          const chargeId = pi.latest_charge as string | undefined;
          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId);
            receiptUrl = charge.receipt_url || null;
          }
        } catch (e) {
          // non-fatal
        }
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 10,
      });
      const first = lineItems.data[0];
      const productName = first?.description || "MuseMint purchase";
      const amount =
        typeof session.amount_total === "number" ? session.amount_total : undefined;
      const currency = session.currency || undefined;

      // 1) Log to Sheets (both sheets if env URLs set)
      await logSaleToSheets({
        time: new Date().toISOString(),
        source: "stripe",
        mode,
        email: customerEmail || "",
        name: customerName,
        product: productName,
        amount,
        currency,
        sessionId: session.id,
        receiptUrl,
      });

      // 2) Internal alert (hello@ + any others), non-fatal
      try {
        await sendInternalSaleAlert({
          email: customerEmail,
          name: customerName,
          productName,
          amount,
          currency,
          mode,
          sessionId: session.id,
          receiptUrl,
        });
      } catch (e: any) {
        console.error("❌ Internal sale alert failed:", e?.message || e);
      }

      // 3) Customer thank-you (only if paid)
      if (paid && customerEmail) {
        try {
          await sendThankYouEmail({
            to: customerEmail,
            productName,
            amount,
            currency,
            receiptUrl,
            customerName,
          });
        } catch (e: any) {
          console.error("❌ Resend thank-you failed:", e?.message || e);
        }
      }
    }
  } catch (err: any) {
    console.error("❌ Webhook handler error:", err?.message || err);
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
    }
