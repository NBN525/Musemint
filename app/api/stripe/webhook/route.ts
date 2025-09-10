// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- Resend (inline) ----------
import { Resend } from "resend";
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>";
const RESEND_TO = process.env.RESEND_TO || "";

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
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
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
  });
  console.log("[email:sent]", { to, id: (resp as any)?.id || null });
  return resp;
}
// -------------------------------------

// ---------- Product constants ----------
const PRODUCT_NAME =
  process.env.PRODUCT_NAME ||
  process.env.NEXT_PUBLIC_PRODUCT_NAME ||
  "Startup Planner (Pro)";
const PRODUCT_SKU = process.env.PRODUCT_SKU || "PLANNER-PRO";
// --------------------------------------

// ---------- Sheets helpers -------------
const SHEETS_MUSEMINT_URL = process.env.SHEETS_MUSEMINT_URL || "";
const SHEETS_RST_URL = process.env.SHEETS_RST_URL || "";

async function postJson(url: string, body: any) {
  if (!url) return { skipped: true };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Apps Script can be slow on cold start; allow some time
      next: { revalidate: 0 },
    });
    const text = await r.text();
    console.log("[sheets:post]", { url: url.slice(0, 60) + "...", status: r.status, body: text });
    return { ok: r.ok, status: r.status, body: text };
  } catch (e: any) {
    console.error("[sheets:error]", e?.message || e);
    return { ok: false, error: e?.message || String(e) };
  }
}

async function logToSheets(entry: any) {
  const payload = {
    source: "stripe",
    event: "checkout.session.completed",
    session_id: entry.session_id,
    email: entry.email,
    currency: entry.currency,
    amount: entry.amount,
    product: entry.product,
    sku: entry.sku,
    qty: entry.qty || 1,
    status: entry.status || "paid",
  };
  if (SHEETS_MUSEMINT_URL) await postJson(SHEETS_MUSEMINT_URL, payload);
  if (SHEETS_RST_URL) await postJson(SHEETS_RST_URL, payload);
}
// --------------------------------------

// ---------- Stripe setup ---------------
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
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
// --------------------------------------

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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Email
      const buyerEmail =
        session.customer_details?.email ||
        (typeof session.customer === "string"
          ? undefined
          : session.customer?.email) ||
        "";

      const amount = (session.amount_total || 0) / 100;
      const currency = (session.currency || "usd").toUpperCase();

      const subj = `Your ${PRODUCT_NAME} order — ${currency} ${amount.toFixed(2)}`;
      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
          <h2>Thanks for your purchase!</h2>
          <p>Your payment has been received for <b>${PRODUCT_NAME}</b>.</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Order:</strong> ${session.id}</p>
          <p>Status: ${session.payment_status || "paid"}</p>
          <p style="margin-top:16px">We’ll send product access or next steps shortly.</p>
        </div>
      `;

      if (buyerEmail) {
        await sendEmail({ to: buyerEmail, subject: subj, html });
      } else {
        console.log("[email:skip] no buyer email on session", { session: session.id });
      }

      if (RESEND_TO) {
        const adminHtml = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
            <h3>New ${PRODUCT_NAME} order</h3>
            <p><strong>Session:</strong> ${session.id}</p>
            <p><strong>Customer:</strong> ${buyerEmail || "(none on session)"}</p>
            <p><strong>Total:</strong> ${currency} ${amount.toFixed(2)}</p>
            <p><strong>SKU:</strong> ${PRODUCT_SKU}</p>
          </div>
        `;
        await sendEmail({
          to: RESEND_TO,
          subject: `New order — ${currency} ${amount.toFixed(2)}`,
          html: adminHtml,
        });
      }

      // Sheets logging with product + SKU
      await logToSheets({
        session_id: session.id,
        email: buyerEmail || "",
        currency,
        amount,
        product: PRODUCT_NAME,
        sku: PRODUCT_SKU,
        qty: 1,
        status: session.payment_status || "paid",
      });
    } else {
      console.log("[stripe] unhandled event", event.type);
    }
  } catch (err: any) {
    console.error("[webhook handler error]", err?.message || err);
    return NextResponse.json({ error: `Handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
                             }
