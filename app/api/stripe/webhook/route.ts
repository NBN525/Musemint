// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- RESEND (inline) ----------
const RESEND_KEY  = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>";
const RESEND_TO   = process.env.RESEND_TO || "";

function getResend() {
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
async function sendEmail(opts: {to: string; subject: string; html: string}) {
  const resend = getResend();
  if (!resend || !RESEND_FROM || !opts.to) {
    console.log("[email:skip]", { hasKey: !!RESEND_KEY, from: !!RESEND_FROM, to: opts.to });
    return { skipped: true };
  }
  const text = stripHtml(opts.html);
  const r = await resend.emails.send({
    from: RESEND_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text,
    reply_to: "support@rstglobal.ca",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@rstglobal.ca>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  console.log("[email:sent]", { to: opts.to, id: (r as any)?.id || null });
  return r;
}
// ------------------------------------

// ---------- SHEETS POST HELPERS (inline, no imports) ----------
const SHEETS_MUSEMINT_URL = process.env.SHEETS_MUSEMINT_URL || "";
const SHEETS_RST_URL      = process.env.SHEETS_RST_URL || "";

async function postToScript(url: string, entry: any) {
  if (!url) return { ok: false, skipped: true, reason: "missing url" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text.slice(0, 500) };
  } catch (err: any) {
    console.error("[sheets:error]", url, err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}

async function logMuseMint(entry: any) {
  return postToScript(SHEETS_MUSEMINT_URL, entry);
}
async function logRST(entry: any) {
  return postToScript(SHEETS_RST_URL, entry);
}
// --------------------------------------------------------------

// ---------- STRIPE ----------
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
// --------------------------------------------------------------

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const secret    = getWebhookSecret();

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

      // Buyer email (if available)
      const buyerEmail =
        session.customer_details?.email ||
        (typeof session.customer === "string" ? undefined : session.customer?.email) ||
        "";

      const amount   = (session.amount_total || 0) / 100;
      const currency = (session.currency || "usd").toUpperCase();

      // ----- emails
      const subject = `Your MuseMint order is confirmed — ${currency} ${amount.toFixed(2)}`;
      const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
    <h2 style="color:#16a34a">🎉 Thanks for your purchase!</h2>
    <p>We’ve received your payment.</p>
    <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
    <p><strong>Order:</strong> ${session.id}</p>

    <p style="margin:20px 0">
      <a href="https://drive.google.com/YOUR_PRODUCT_LINK"
         style="display:inline-block;background:#facc15;color:#111;padding:12px 20px;
                border-radius:8px;text-decoration:none;font-weight:bold">
        ⬇️ Download Your Product
      </a>
    </p>

    <p>We’ll also keep you updated with improvements and new tools from MuseMint.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
    <p style="font-size:12px;color:#666">From: ${RESEND_FROM}</p>
  </div>
`;
      if (buyerEmail) await sendEmail({ to: buyerEmail, subject, html });
      if (RESEND_TO) {
        const adminHtml = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
            <h3>New MuseMint order</h3>
            <p><strong>Session:</strong> ${session.id}</p>
            <p><strong>Customer:</strong> ${buyerEmail || "(none)"}</p>
            <p><strong>Total:</strong> ${currency} ${amount.toFixed(2)}</p>
          </div>
        `;
        await sendEmail({ to: RESEND_TO, subject: `New order — ${currency} ${amount.toFixed(2)}`, html: adminHtml });
      }

      // ----- Sheets logging (MuseMint + RST). No Vault logging by request.
      const saleRow = {
        source: "stripe",
        event: event.type,
        session_id: session.id,
        email: buyerEmail || "",
        amount,
        currency,
        timestamp_app: new Date().toISOString(),
      };
      const [mm, rst] = await Promise.all([
        logMuseMint(saleRow).catch(e => ({ ok: false, error: e?.message || String(e) })),
        logRST(saleRow).catch(e => ({ ok: false, error: e?.message || String(e) })),
      ]);
      console.log("[sheets:mm]", mm);
      console.log("[sheets:rst]", rst);
    } else {
      console.log("[stripe] unhandled event", event.type);
    }
  } catch (err: any) {
    console.error("[webhook handler error]", err?.message || err);
    return NextResponse.json({ error: `Handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
