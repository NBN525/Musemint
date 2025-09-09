// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>";
const RESEND_TO = process.env.RESEND_TO || "";
const PRODUCT_DOWNLOAD_URL = process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL || "";

function getResend(): Resend | null { return RESEND_KEY ? new Resend(RESEND_KEY) : null; }
function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
async function sendEmail(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend || !RESEND_FROM || !to) return;
  await resend.emails.send({
    from: RESEND_FROM, to, subject, html, text: stripHtml(html),
    reply_to: "support@rstglobal.ca",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@rstglobal.ca>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  const live = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST;
  return mode === "test" ? (test as string) : (live as string);
}

const stripe = new Stripe(
  (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || "") as string,
  { apiVersion: "2024-06-20" }
);

export async function GET() { return NextResponse.json({ ok: true }); }

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const buyerEmail =
          session.customer_details?.email ||
          (typeof session.customer === "string" ? undefined : session.customer?.email) || "";
        const amount = (session.amount_total || 0) / 100;
        const currency = (session.currency || "usd").toUpperCase();

        // --- Confirmation email (now with optional download button) ---
        const dlButton = PRODUCT_DOWNLOAD_URL
          ? `<p style="margin:20px 0">
               <a href="${PRODUCT_DOWNLOAD_URL}" style="display:inline-block;background:#FCD53C;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:600">
                 Download your product
               </a>
             </p>`
          : "";

        const html = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;line-height:1.5">
            <h2>Thanks for your purchase!</h2>
            <p>We’ve received your payment.</p>
            <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
            <p><strong>Order:</strong> ${session.id}</p>
            ${dlButton}
            <p style="font-size:12px;color:#666">From: ${RESEND_FROM}</p>
          </div>
        `;

        if (buyerEmail) await sendEmail(buyerEmail, `Your MuseMint order — ${currency} ${amount.toFixed(2)}`, html);

        if (RESEND_TO) {
          const adminHtml = `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
              <h3>New MuseMint order</h3>
              <p><b>Session:</b> ${session.id}</p>
              <p><b>Customer:</b> ${buyerEmail || "(none)"}</p>
              <p><b>Total:</b> ${currency} ${amount.toFixed(2)}</p>
            </div>
          `;
          await sendEmail(RESEND_TO, `New order — ${currency} ${amount.toFixed(2)}`, adminHtml);
        }

        // Sheets logging is already handled elsewhere in your app

        break;
      }
      default:
        // ignore others
        break;
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
    }
