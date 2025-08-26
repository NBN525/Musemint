// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { appendToSheet } from "../../../../lib/sheets";
import { buildReceiptEmail } from "../../../../lib/emailTemplates";

// Ensure Node runtime (needed for raw body & stripe crypto)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Stripe & Resend clients ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Pick the right webhook secret (test or live) based on mode env
function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "test").toLowerCase(); // "test" | "live"
  return mode === "live"
    ? process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET_TEST;
}

// Optional GET so visiting the URL doesn’t 405
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

// Stripe sends POST with a signed *raw* body
export async function POST(req: NextRequest) {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
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

        // Retrieve full session with line items & products for nicer receipt
        const full = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items.data.price.product"],
        });

        const email = full.customer_details?.email || session.customer_email || "";
        const currency = (full.currency || "usd").toUpperCase();
        const amount = (full.amount_total || 0) / 100;

        const items =
          full.line_items?.data?.map((li) => {
            const p = (li.price?.product as Stripe.Product) || undefined;
            const name =
              (p && p.name) ||
              li.description ||
              li.price?.nickname ||
              "Product";
            const qty = li.quantity || 1;
            return `${name} × ${qty}`;
          }) || [];

        const productSummary = items.join(", ") || "Purchase";

        // --- 1) Log to Google Sheet via your existing webhook URL ---
        await appendToSheet({
          table: "Stripe Sales",
          row: {
            timestamp: new Date().toISOString(),
            email,
            product: productSummary,
            amount,
            currency,
            payment_status: full.payment_status || "paid",
            checkout_mode: full.mode || "",
            stripe_session_id: full.id,
          },
        });

        // --- 2) Send receipt email via Resend ---
        if (email) {
          const from =
            process.env.EMAIL_FROM || "MuseMint <noreply@rstglobal.ca>";
          const { subject, html, text } = buildReceiptEmail({
            productSummary,
            amount,
            currency,
            supportEmail: "hello@rstglobal.ca",
            brandUrl: "https://ai.rstglobal.ca",
          });

          await resend.emails.send({
            from,
            to: email,
            subject,
            html,
            text,
          });
        }

        break;
      }

      // (Add more cases here if/when you need them)

      default:
        // no-op for other event types
        break;
    }
  } catch (err: any) {
    // If your internal work fails, return 200 so Stripe doesn’t spam retries,
    // but log the error so we can diagnose.
    console.error("Webhook handler error:", err);
    return NextResponse.json({ received: true, note: "handler-error" }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
