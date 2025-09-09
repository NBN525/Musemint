// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Force Node runtime for raw body handling + Stripe SDK
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- Minimal email helper (optional) ----------
import { Resend } from "resend";
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM =
  process.env.RESEND_FROM || "MuseMint Receipts <hello@rstglobal.ca>";
const RESEND_TO = process.env.RESEND_TO || ""; // internal copy (optional)

function safeText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY || !RESEND_FROM || !to) {
    console.log("[email:skip]", { hasKey: !!RESEND_KEY, to, from: RESEND_FROM });
    return;
  }
  const resend = new Resend(RESEND_KEY);
  const text = safeText(html);
  try {
    const r = await resend.emails.send({
      from: RESEND_FROM,
      to,
      subject,
      html,
      text,
      reply_to: "support@rstglobal.ca",
    });
    console.log("[email:sent]", { to, id: (r as any)?.id });
  } catch (e: any) {
    // email should never crash the webhook
    console.error("[email:error]", e?.message || e);
  }
}
// ------------------------------------------------------

// Select the right signing secret based on mode
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  const live =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "";
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";
  return mode === "test" ? test : live;
}

const stripe = new Stripe(
  (process.env.STRIPE_SECRET_KEY_LIVE ||
    process.env.STRIPE_SECRET_KEY ||
    "") as string,
  { apiVersion: "2024-06-20" }
);

// Optional GET so you can hit the URL in a browser without 405
export async function GET() {
  const hasKeys = {
    sk: !!(process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY),
    wh: !!getWebhookSecret(),
  };
  return NextResponse.json({ ok: true, env: hasKeys }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const secret = getWebhookSecret();
  if (!secret) {
    console.error("[stripe] Missing webhook signing secret env");
    return NextResponse.json(
      { error: "Server not configured (signing secret missing)" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  let rawBody = "";
  let sig = "";

  try {
    rawBody = await req.text(); // IMPORTANT: raw body for signature check
    sig = req.headers.get("stripe-signature") || "";
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (e: any) {
    console.error("[stripe] Signature verification failed", {
      msg: e?.message,
      haveSig: !!sig,
    });
    return NextResponse.json(
      { error: `Invalid signature: ${e?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const buyerEmail =
          session.customer_details?.email ||
          (typeof session.customer === "string"
            ? undefined
            : session.customer?.email) ||
          "";

        const amount = (session.amount_total || 0) / 100;
        const currency = (session.currency || "usd").toUpperCase();

        // --- customer receipt (soft-fail) ---
        if (buyerEmail) {
          const html = `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
              <h2>Thanks for your purchase!</h2>
              <p>We've received your payment.</p>
              <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p><strong>Order:</strong> ${session.id}</p>
              <p>We’ll send product access or next steps shortly.</p>
            </div>`;
          await sendEmail(
            buyerEmail,
            `Your order is confirmed — ${currency} ${amount.toFixed(2)}`,
            html
          );
        } else {
          console.log("[email:skip] no buyer email on session", { id: session.id });
        }

        // --- internal notification (soft-fail) ---
        if (RESEND_TO) {
          const adminHtml = `
            <div style="font-family:system-ui">
              <h3>New order</h3>
              <p><b>Session:</b> ${session.id}</p>
              <p><b>Customer:</b> ${buyerEmail || "(none on session)"}</p>
              <p><b>Total:</b> ${currency} ${amount.toFixed(2)}</p>
            </div>`;
          await sendEmail(
            RESEND_TO,
            `New order — ${currency} ${amount.toFixed(2)}`,
            adminHtml
          );
        }

        // --- sheets logging (soft-fail) ---
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/debug/sheets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source: "stripe-webhook",
              event: event.type,
              session_id: session.id,
              email: buyerEmail,
              currency,
              amount,
            }),
          });
        } catch (e: any) {
          console.error("[sheets:log:error]", e?.message || e);
        }

        break;
      }

      default:
        console.log("[stripe] Unhandled event", event.type);
    }
  } catch (e: any) {
    // Never 500 on side-effects; log and acknowledge
    console.error("[webhook:handler:error]", e?.message || e);
  }

  // Always acknowledge so Stripe stops retrying (unless signature invalid)
  return NextResponse.json({ received: true }, { status: 200 });
}
