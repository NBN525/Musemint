// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";

// --- Helpers ---------------------------------------------------------------

function getStripe(): Stripe {
  const key =
    process.env.STRIPE_SECRET_KEY_LIVE ||
    process.env.STRIPE_SECRET_KEY ||
    "";
  if (!key) throw new Error("Missing STRIPE secret key");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

async function postJson(url: string | undefined, payload: any) {
  if (!url) return { ok: false, reason: "missing-url" as const };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    console.error("POST -> sheet failed:", e);
    return { ok: false, reason: "fetch-error" as const };
  }
}

function centsToMoney(amount: number | null | undefined) {
  if (typeof amount !== "number") return "0.00";
  return (amount / 100).toFixed(2);
}

function upper(s?: string | null) {
  return (s || "").toUpperCase();
}

// --- Email ----------------------------------------------------------------

async function sendSaleEmails(args: {
  amount_total?: number | null;
  currency?: string | null;
  email?: string | null;
  name?: string | null;
  session_id?: string;
  mode?: string | null;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("Resend skipped: missing RESEND_API_KEY");
    return { ok: false, reason: "no-resend-key" as const };
  }

  const resend = new Resend(resendKey);

  // FROM: branded business address (archive lives here too)
  const fromEmail =
    process.env.SALE_FROM ||
    process.env.EMAIL_FROM ||
    "hello@rstglobal.ca";

  // TO: your personal alert + the archive (same as from)
  const personalTo =
    process.env.SALE_ALERT_TO ||
    process.env.ALERT_TO ||
    process.env.PERSONAL_EMAIL ||
    ""; // e.g., rtremblay@hotmail.com

  // Build a clean subject as a STRING (fixes 422)
  const humanAmount = centsToMoney(args.amount_total);
  const subject = `MuseMint sale: ${humanAmount} ${upper(args.currency)}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.6">
      <h2 style="margin:0 0 12px">New sale (Stripe Checkout)</h2>
      <p style="margin:0">Mode: <b>${args.mode || "LIVE"}</b></p>
      <p style="margin:0">Amount: <b>${humanAmount} ${upper(args.currency)}</b></p>
      <p style="margin:0">Customer: ${args.email || "—"} ${args.name ? `(${args.name})` : ""}</p>
      <p style="margin:0">Session: <code>${args.session_id || "—"}</code></p>
    </div>
  `;

  const toList = [fromEmail]; // archive copy
  if (personalTo && personalTo !== fromEmail) toList.push(personalTo);

  try {
    const r = await resend.emails.send({
      from: `MuseMint <${fromEmail}>`,
      to: toList,
      subject,               // <-- plain string
      html,
    });
    console.info("Resend result:", r?.id || r);
    return { ok: true };
  } catch (e) {
    console.error("Resend send error:", e);
    return { ok: false, reason: "send-error" as const };
  }
}

// --- Webhook --------------------------------------------------------------

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature") || "";
  const secret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "";

  if (!secret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    // Return 200 so Stripe doesn’t retry forever while you fix config
    return NextResponse.json({ ok: false, error: "bad-signature" }, { status: 200 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ---- 1) Email both personal + archive via Resend
    await sendSaleEmails({
      amount_total: session.amount_total,
      currency: session.currency,
      email: session.customer_details?.email || session.customer_email,
      name: session.customer_details?.name || undefined,
      session_id: session.id,
      mode: session.mode,
    });

    // ---- 2) Log to BOTH sheets (if configured)
    const baseRow = {
      event_type: event.type,
      email: session.customer_details?.email || session.customer_email || "",
      name: session.customer_details?.name || "",
      amount_total: (session.amount_total || 0) / 100,
      currency: session.currency || "",
      payment_status: session.payment_status || "",
      mode: session.mode || "",
      session_id: session.id || "",
      customer_id: typeof session.customer === "string" ? session.customer : "",
      created_at: new Date().toISOString(),
      source: "stripe",
    };

    const rstUrl = process.env.SHEETS_WEBHOOK_URL;        // RST log
    const salesUrl = process.env.SHEETS_WEBHOOK_URL_SALES; // MuseMint sales log

    const [rstRes, salesRes] = await Promise.all([
      postJson(rstUrl, baseRow),
      postJson(salesUrl, baseRow),
    ]);

    console.info("RST sheet:", rstRes);
    console.info("Sales sheet:", salesRes);
  } else {
    // For other events, just log and acknowledge
    console.log("Unhandled Stripe event:", event.type);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
