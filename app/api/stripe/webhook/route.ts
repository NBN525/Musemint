/* app/api/stripe/webhook/route.ts */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE secret key");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

async function postJson(url: string | undefined, payload: any) {
  if (!url) return { ok: false, reason: "missing-url" };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // don’t throw on non-200; we want to log it
    });
    const ok = r.ok;
    const text = await r.text().catch(() => "");
    return { ok, status: r.status, body: text?.slice(0, 3000) };
  } catch (e: any) {
    return { ok: false, reason: e?.message || "fetch-error" };
  }
}

async function sendEmail(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "missing-resend-key" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // subject MUST be a plain string
    });
    const ok = r.ok;
    const text = await r.text().catch(() => "");
    return { ok, status: r.status, body: text?.slice(0, 3000) };
  } catch (e: any) {
    return { ok: false, reason: e?.message || "resend-error" };
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature") || "";
  const whSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;

  if (!whSecret) {
    console.error("WEBHOOK: missing signing secret");
    return NextResponse.json({ ok: false, reason: "missing-signing-secret" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err: any) {
    console.error("WEBHOOK: signature verify failed:", err?.message);
    // Return 400 so Stripe retries (don’t 200 on bad signature)
    return new NextResponse(`Webhook Error: ${err?.message || "bad-signature"}`, { status: 400 });
  }

  console.log("WEBHOOK: event.type =", event.type);

  // Only handle checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true, reason: "ignored-type", type: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const amount_total = (session.amount_total ?? 0) / 100;
  const currency = session.currency?.toUpperCase() || "USD";
  const email = (session.customer_details?.email || session.customer_email || "").toString();
  const name = session.customer_details?.name || "";
  const payment_status = session.payment_status || "";
  const mode = session.mode || "";
  const session_id = session.id;
  const customer_id = typeof session.customer === "string" ? session.customer : session.customer?.id || "";

  // Guard: only log/signal paid sessions
  if (payment_status !== "paid") {
    console.log("WEBHOOK: skipping, payment_status:", payment_status);
    return NextResponse.json({ ok: true, reason: "unpaid" });
  }

  // 1) Sheets (generic)
  const sheetsPayload = {
    source: "stripe",
    event_type: event.type,
    email,
    name,
    amount_total,
    currency,
    payment_status,
    mode,
    session_id,
    customer_id,
    ts: new Date().toISOString(),
  };
  const sheetsResult = await postJson(process.env.SHEETS_WEBHOOK_URL, sheetsPayload);
  console.log("WEBHOOK: sheets generic ->", sheetsResult);

  // 2) Sheets (sales log if provided)
  const salesResult = await postJson(process.env.SHEETS_WEBHOOK_URL_SALES, sheetsPayload);
  console.log("WEBHOOK: sheets sales ->", salesResult);

  // 3) Email (Resend) — send to your team inbox
  const from = process.env.MAIL_FROM || "MuseMint <hello@rstglobal.ca>";
  const to = process.env.MAIL_TO || "hello@rstglobal.ca";
  const subject = `MuseMint sale: ${amount_total.toFixed(2)} ${currency}`; // PLAIN STRING
  const emailResult = await sendEmail({
    from,
    to,
    subject,
    html: `
      <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">
        <h2>New sale (Stripe Checkout)</h2>
        <p><b>Amount:</b> ${amount_total.toFixed(2)} ${currency}<br/>
           <b>Customer:</b> ${email || "(unknown)"}<br/>
           <b>Mode:</b> ${mode} &nbsp; <b>Status:</b> ${payment_status}<br/>
           <b>Session:</b> ${session_id}
        </p>
        <p>Logged to Google Sheet.</p>
      </div>
    `,
  });
  console.log("WEBHOOK: resend ->", emailResult);

  // Final response with a compact summary (helps in Stripe logs)
  return NextResponse.json({
    ok: true,
    did: {
      sheet: sheetsResult.ok,
      sales: salesResult.ok,
      email: emailResult.ok,
    },
  });
}
