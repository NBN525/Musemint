// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { sendSaleEmail } from "@/lib/email"; // path works if you have baseUrl='.'; otherwise use ../../../../lib/email

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// choose the right secret
function getWebhookSecret(): string | undefined {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();

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
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // --- Build email body ---
        const amount =
          typeof session.amount_total === "number"
            ? (session.amount_total / 100).toFixed(2)
            : "—";

        const currency = (session.currency || "cad").toUpperCase();
        const customer = session.customer_details?.email || "Unknown";
        const mode = session.mode?.toUpperCase() || "LIVE";

        const html = `
          <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a">
            <h2 style="margin:0 0 8px;">New sale (Stripe Checkout)</h2>
            <p><strong>Session:</strong> ${session.id}</p>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Customer:</strong> ${customer}</p>
            <p><strong>Mode:</strong> ${mode}</p>
            <p style="margin-top:16px;color:#475569">Logged to Google Sheet.</p>
          </div>
        `;

        // send to your ops inbox; fallback BCC handled in lib/email.ts
        await sendSaleEmail({
          to: "hello@rstglobal.ca",
          subject: `MuseMint sale: ${amount} ${currency}`,
          html,
        });

        // also log to Sheets (both logs)
        const { appendToSales, appendToSheet } = await import("@/lib/sheets");
        await appendToSales({
          event_type: "checkout.session.completed",
          email: session.customer_details?.email || "",
          name: session.customer_details?.name || "",
          amount_total: session.amount_total ?? 0,
          currency: session.currency || "cad",
          payment_status: session.payment_status || "",
          session_id: session.id,
          customer_id: typeof session.customer === "string" ? session.customer : "",
          mode: session.mode || "payment",
        });

        await appendToSheet({
          table2: "stripe",
          row: { event: "checkout.session.completed" },
        });

        break;
      }
      default:
        // ignore others for now
        break;
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
