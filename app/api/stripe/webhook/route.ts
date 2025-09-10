// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ========= ENV ========= */
const STRIPE_SECRET =
  process.env.STRIPE_SECRET_KEY_LIVE ||
  process.env.STRIPE_SECRET_KEY ||
  "";

const WEBHOOK_MODE = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "live" | "test"
const WEBHOOK_SECRET =
  WEBHOOK_MODE === "test"
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM =
  process.env.RESEND_FROM || 'MuseMint Receipts <hello@rstglobal.ca>';
const RESEND_TO = process.env.RESEND_TO || ""; // optional internal inbox

// Public product link shown to customers after payment
const PRODUCT_LINK =
  process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL ||
  process.env.PRODUCT_LINK ||
  "";

// Optional Sheets (Apps Script web app) endpoints
const SHEETS_MUSEMINT_URL = process.env.SHEETS_MUSEMINT_URL || "";
const SHEETS_RST_URL = process.env.SHEETS_RST_URL || "";

/* ========= CLIENTS ========= */
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

/* ========= HELPERS ========= */
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
  if (!resend || !RESEND_FROM || !to) {
    console.log("[email:skip]", { hasKey: !!resend, from: !!RESEND_FROM, to });
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

async function postToSheets(payload: any) {
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };

  const tasks: Promise<any>[] = [];
  if (SHEETS_MUSEMINT_URL) {
    tasks.push(
      fetch(SHEETS_MUSEMINT_URL, { method: "POST", headers, body }).catch((e) =>
        console.error("[sheets:musemint] post error", e)
      )
    );
  }
  if (SHEETS_RST_URL) {
    tasks.push(
      fetch(SHEETS_RST_URL, { method: "POST", headers, body }).catch((e) =>
        console.error("[sheets:rst] post error", e)
      )
    );
  }
  if (tasks.length) await Promise.all(tasks);
}

/* ========= ROUTES ========= */
export async function GET() {
  return NextResponse.json({ ok: true, mode: WEBHOOK_MODE }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      console.error("[stripe] missing webhook secret");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("[stripe] invalid signature", err?.message);
      return NextResponse.json(
        { error: `Invalid signature: ${err?.message || "unknown"}` },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Buyer details
      const buyerEmail =
        session.customer_details?.email ||
        (typeof session.customer === "string"
          ? undefined
          : (session.customer as any)?.email) ||
        "";

      const amount = (session.amount_total || 0) / 100;
      const currency = (session.currency || "usd").toUpperCase();

      // 🎁 Customer email (with product link CTA)
      const subject = amount
        ? `Your MuseMint order — ${currency} ${amount.toFixed(2)}`
        : `Your MuseMint order — confirmed`;

      const button = PRODUCT_LINK
        ? `<a href="${PRODUCT_LINK}" style="display:inline-block;padding:12px 16px;background:#111;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Access your download</a>`
        : `<span style="display:inline-block;padding:10px 12px;border:1px solid #ddd;border-radius:10px;color:#111">We’ll email your access shortly.</span>`;

      const customerHtml = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0b1220;line-height:1.6">
          <h2 style="margin:0 0 8px">Thanks for your purchase!</h2>
          <p style="margin:0 0 16px">Your payment has been received${
            amount ? ` for <b>${currency} ${amount.toFixed(2)}</b>` : ""
          }.</p>

          <div style="margin:16px 0">${button}</div>

          <div style="margin-top:18px;padding:12px;border:1px solid #eee;border-radius:12px;background:#fafafa">
            <p style="margin:0 0 4px"><b>Order:</b> ${session.id}</p>
            <p style="margin:0 0 4px"><b>Email:</b> ${buyerEmail || "—"}</p>
            <p style="margin:0 0 4px"><b>Status:</b> ${session.payment_status}</p>
          </div>

          <p style="margin-top:18px;font-size:12px;color:#6b7280">
            From: ${RESEND_FROM}<br/>
            Questions? Reply to this email or write support@rstglobal.ca
          </p>
        </div>
      `;

      if (buyerEmail) {
        await sendEmail({ to: buyerEmail, subject, html: customerHtml });
      } else {
        console.log("[email:skip] no buyer email on session", { session: session.id });
      }

      // 📨 Internal notification
      if (RESEND_TO) {
        const adminHtml = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0b1220;line-height:1.6">
            <h3 style="margin:0 0 8px">New MuseMint order</h3>
            <p style="margin:0 0 4px"><b>Session:</b> ${session.id}</p>
            <p style="margin:0 0 4px"><b>Customer:</b> ${buyerEmail || "—"}</p>
            <p style="margin:0 0 4px"><b>Total:</b> ${
              amount ? `${currency} ${amount.toFixed(2)}` : "—"
            }</p>
            <pre style="font-size:12px;background:#f7f7f7;padding:8px;border-radius:8px;white-space:pre-wrap">${
              JSON.stringify(session, null, 2)
            }</pre>
          </div>
        `;
        await sendEmail({
          to: RESEND_TO,
          subject: `New order — ${amount ? `${currency} ${amount.toFixed(2)}` : session.id}`,
          html: adminHtml,
        });
      }

      // 📊 Sheets logging (Webhook + normalized Transaction)
      // Keep it simple: 1 call; your Apps Script doPost already handles both
      const payload = {
        source: "stripe",
        event: "checkout.session.completed",
        session_id: session.id,
        email: buyerEmail || "",
        currency: session.currency || "usd",
        amount: amount || 0,
        product:
          (session.metadata && (session.metadata.product as string)) ||
          (session.invoice && "Invoice") ||
          "MuseMint Purchase",
        sku:
          (session.metadata && (session.metadata.sku as string)) ||
          "PLANNER-CORE",
        qty: 1,
      };
      await postToSheets(payload);
    } else {
      console.log("[stripe] unhandled event", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[webhook error]", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
              }
