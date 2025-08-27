// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { appendToSheet } from "@/lib/sheets";
import { buildSaleEmail } from "@/lib/emailTemplates";

// Ensure Node runtime for raw body
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: choose the right webhook secret (test vs live)
function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "test" | "live"
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

// Optional: quick ping so the route doesn’t 405 in a browser
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

// Stripe sends POST with a signed RAW body
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // IMPORTANT: use raw text body for signature verification
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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Pull line items for product names/qty
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 50 }
        );

        // Build a readable product summary
        const products = lineItems.data.map((li) => {
          const name =
            li.description ||
            (typeof li.price?.product === "string" ? li.price.product : "Item");
          const qty = li.quantity ?? 1;
          return `${name} × ${qty}`;
        });

        const productSummary =
          products.length > 0 ? products.join(" • ") : "Unknown item(s)";

        // Amount & currency
        const amountTotal = (session.amount_total ?? 0) / 100;
        const currency = (session.currency || "usd").toUpperCase();

        // Customer email
        const customerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          "Unknown";

        // Mode (test/live) shows in email + sheet
        const mode = session.livemode ? "LIVE" : "TEST";

        // 1) Email to hello@ (Resend)
        const { subject, html } = buildSaleEmail({
          brand: "MuseMint",
          productSummary,
          amount: amountTotal,
          currency,
          customerEmail,
          sessionId: session.id,
          mode,
        });

        // You can CC/forward later via Gmail rules (already set up)
        await resend.emails.send({
          from: "MuseMint <hello@rstglobal.ca>",
          to: ["hello@rstglobal.ca"], // keep this as your canonical mailbox
          subject,
          html,
        });

        // 2) Log to Google Sheet (non-blocking but we still await for error catch)
        await appendToSheet({
          table2: "musemint-sales", // name whatever you like in your Apps Script
          row: {
            ts: new Date().toISOString(),
            source: "stripe",
            event: event.type,
            mode,
            email: customerEmail,
            session_id: session.id,
            products: productSummary,
            amount: amountTotal,
            currency,
          },
        });

        break;
      }

      default:
        // Ignore other event types for now
        break;
    }
  } catch (err: any) {
    // Your handler threw – surface it so Stripe will retry if needed
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
