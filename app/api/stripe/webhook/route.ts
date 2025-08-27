import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const resendKey = process.env.RESEND_API_KEY || "";
const resend = resendKey ? new Resend(resendKey) : null;

function getWebhookSecret() {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  return mode === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}

async function logToSheet(payload: any) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // swallow logging errors
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
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

        // 1) Log to Google Sheet
        await logToSheet({
          source: "stripe",
          type: event.type,
          mode: process.env.STRIPE_WEBHOOK_MODE || "live",
          session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email || session.customer_email || "",
          timestamp: new Date().toISOString(),
        });

        // 2) Email notification (internal)
        if (resend) {
          const to = "hello@rstglobal.ca";
          const from = process.env.EMAIL_FROM || "MuseMint <hello@rstglobal.ca>";
          const amt = (session.amount_total || 0) / 100;
          await resend.emails.send({
            from,
            to,
            subject: `✅ MuseMint sale: ${amt.toFixed(2)} ${session.currency?.toUpperCase() || ""}`,
            html: `
              <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                <h2>New sale (Stripe Checkout)</h2>
                <p><strong>Session:</strong> ${session.id}</p>
                <p><strong>Amount:</strong> ${amt.toFixed(2)} ${session.currency?.toUpperCase() || ""}</p>
                <p><strong>Customer:</strong> ${session.customer_details?.email || session.customer_email || "n/a"}</p>
                <p><strong>Mode:</strong> ${(process.env.STRIPE_WEBHOOK_MODE || "live").toUpperCase()}</p>
                <p>Logged to Google Sheet.</p>
              </div>
            `,
          });
        }

        // 3) (Optional) Thank-you email to buyer if you want
        // if (resend && (session.customer_details?.email || session.customer_email)) {
        //   await resend.emails.send({
        //     from: process.env.EMAIL_FROM || "MuseMint <hello@rstglobal.ca>",
        //     to: session.customer_details?.email || (session.customer_email as string),
        //     subject: "Thanks for your purchase — MuseMint",
        //     html: `<p>Thanks for your purchase! We'll send your download shortly.</p>`,
        //   });
        // }

        break;
      }

      default:
        // no-op
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
