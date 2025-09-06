// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendThankYouEmail } from "@/lib/email";

// If you log to Google Sheets elsewhere, keep your existing imports/helpers here:
// import { logSaleToSheets, logEventToSheets } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Choose secret by mode (TEST vs LIVE)
function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

function getStripe(): Stripe {
  const key =
    (process.env.STRIPE_SECRET_KEY_LIVE ||
      process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET) ?? "";
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

// Optional GET so hitting this URL in a browser doesn’t 405
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // IMPORTANT: read raw text body for signature verification
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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only send after payment success
        const paid =
          session.payment_status === "paid" ||
          (session.status && session.status === "complete");

        const customerEmail =
          session.customer_details?.email || session.customer_email || undefined;

        // Collect receipt URL (if available) from latest payment
        let receiptUrl: string | null = null;
        if (session.payment_intent && typeof session.payment_intent === "string") {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
          const chargeId = pi.latest_charge as string | undefined;
          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId);
            receiptUrl = charge.receipt_url || null;
          }
        }

        // Derive product name + amount
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 10 }
        );
        const first = lineItems.data[0];
        const productName =
          first?.description ||
          "Your MuseMint purchase"; // fallback if missing
        const amount = typeof session.amount_total === "number"
          ? session.amount_total
          : undefined;
        const currency = session.currency || undefined;

        // LOG to Sheets (if you already have a helper, call it here)
        // await logSaleToSheets({
        //   time: new Date().toISOString(),
        //   email: customerEmail || "",
        //   product: productName,
        //   amount,
        //   currency,
        //   source: "stripe",
        //   mode: (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(),
        // });

        // Send customer thank-you email (Resend)
        if (paid && customerEmail) {
          try {
            await sendThankYouEmail({
              to: customerEmail,
              productName,
              amount,
              currency,
              receiptUrl,
              customerName: session.customer_details?.name || null,
            });
          } catch (e: any) {
            console.error("❌ Resend thank-you failed:", e?.message || e);
          }
        }

        // (Optional) internal alert email/logs can also fire here

        break;
      }

      // Add other handlers if you care (e.g., invoice.paid/refunded)
      default:
        // no-op
        break;
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
