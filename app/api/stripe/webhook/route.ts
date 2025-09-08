// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------------- INLINE RESEND EMAIL HELPERS ---------------------- */
import { Resend } from "resend";

const RESEND_KEY  = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "MuseMint Receipts <hello@rstglobal.ca>";
const RESEND_TO   = process.env.RESEND_TO || ""; // optional internal inbox

function getResend(): Resend | null {
  return RESEND_KEY ? new Resend(RESEND_KEY) : null;
}
function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
async function sendEmail({
  to, subject, html,
}: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend || !RESEND_FROM || !to) {
    console.log("[email:skip]", { hasKey: !!RESEND_KEY, from: !!RESEND_FROM, to });
    return { skipped: true };
  }
  const text = stripHtml(html);
  const resp = await resend.emails.send({
    from: RESEND_FROM,
    to,
    subject,
    html,
    text,
    reply_to: "support@rstglobal.ca",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@rstglobal.ca>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  console.log("[email:sent]", { to, id: (resp as any)?.id || null });
  return resp;
}
/* -------------------------- SHEETS LOGGING HELPERS -------------------------- */
// expects your Apps Script web app URLs in env:
const SHEETS_MUSEMINT_URL = process.env.SHEETS_MUSEMINT_URL || "";
const SHEETS_RST_URL      = process.env.SHEETS_RST_URL || "";

async function postJson(url: string, payload: any) {
  if (!url) return { skipped: true, reason: "no-url" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Apps Script likes a flat JSON body
      body: JSON.stringify(payload),
      // No need for cache; these run server-side
    });
    const text = await res.text().catch(() => "");
    console.log("[sheets:resp]", { url: url.slice(0, 60) + "...", status: res.status, text });
    return { ok: res.ok, status: res.status, text };
  } catch (err: any) {
    console.error("[sheets:error]", err?.message || err);
    return { ok: false, error: err?.message || "fetch-failed" };
  }
}

// log one entry to MuseMint + RST sheets
async function logStripeToSheets(entry: Record<string, any>) {
  const payload = {
    ...entry,
    timestamp_app: new Date().toISOString(),
    source: "stripe",
  };
  const results: any = {};
  if (SHEETS_MUSEMINT_URL) {
    results.musemint = await postJson(SHEETS_MUSEMINT_URL, payload);
  }
  if (SHEETS_RST_URL) {
    results.rst = await postJson(SHEETS_RST_URL, payload);
  }
  return results;
}
/* --------------------------------------------------------------------------- */

// choose the correct webhook secret
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "live" | "test"
  const live = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST;
  return mode === "test" ? (test as string) : (live as string);
}

const stripe = new Stripe(
  (process.env.STRIPE_SECRET_KEY_LIVE ||
    process.env.STRIPE_SECRET_KEY ||
    "") as string,
  { apiVersion: "2024-06-20" }
);

// Optional GET so /api/stripe/webhook doesn’t 405 in browser
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();

  if (!secret) {
    console.error("[stripe] missing webhook secret");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    console.error("[stripe] invalid signature", err?.message);
    return NextResponse.json({ error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const buyerEmail =
          session.customer_details?.email ||
          (typeof session.customer === "string" ? undefined : (session.customer as any)?.email) ||
          "";

        const amount   = (session.amount_total || 0) / 100;
        const currency = (session.currency || "usd").toUpperCase();
        const product  = session.metadata?.productName || process.env.NEXT_PUBLIC_PRODUCT_NAME || "Product";
        const subj     = `Your ${product} order is confirmed — ${currency} ${amount.toFixed(2)}`;

        // 1) Customer confirmation
        if (buyerEmail) {
          const html = `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
              <h2>Thanks for your purchase!</h2>
              <p>We’ve received your payment for <strong>${product}</strong>.</p>
              <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p><strong>Order:</strong> ${session.id}</p>
              <p>We’ll send product access / next steps shortly.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
              <p style="font-size:12px;color:#666">From: ${RESEND_FROM}</p>
            </div>
          `;
          await sendEmail({ to: buyerEmail, subject: subj, html });
        } else {
          console.log("[email:skip] no buyer email on session", { session: session.id });
        }

        // 2) Internal notification (optional)
        if (RESEND_TO) {
          const adminHtml = `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
              <h3>New ${product} order</h3>
              <p><strong>Session:</strong> ${session.id}</p>
              <p><strong>Customer:</strong> ${buyerEmail || "(none on session)"}</p>
              <p><strong>Total:</strong> ${currency} ${amount.toFixed(2)}</p>
            </div>
          `;
          await sendEmail({
            to: RESEND_TO,
            subject: `New order — ${currency} ${amount.toFixed(2)}`,
            html: adminHtml,
          });
        }

        // 3) Sheets logging (MuseMint + RST)
        await logStripeToSheets({
          event: event.type,
          session_id: session.id,
          amount,
          currency,
          email: buyerEmail || "",
          product,
          mode: session.livemode ? "live" : "test",
        });

        break;
      }

      default:
        console.log("[stripe] unhandled event", event.type);
    }
  } catch (err: any) {
    console.error("[webhook handler error]", err?.message || err);
    return NextResponse.json({ error: `Handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
        }
