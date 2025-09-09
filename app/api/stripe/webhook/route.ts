// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// We need Node runtime for raw body + Stripe sig verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ----------------- Resend (inline helper) ----------------- */
import { Resend } from "resend";

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM =
  process.env.RESEND_FROM || "MuseMint Receipts <hello@rstglobal.ca>";
const RESEND_TO = process.env.RESEND_TO || ""; // optional internal notification inbox

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
    console.log("[email:skip]", {
      hasKey: !!RESEND_KEY,
      from: !!RESEND_FROM,
      to,
    });
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

/* ----------------- Stripe config ----------------- */
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "live" | "test"
  const live =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST;
  return mode === "test" ? (test as string) : (live as string);
}

const STRIPE_KEY =
  (process.env.STRIPE_SECRET_KEY_LIVE ||
    process.env.STRIPE_SECRET_KEY ||
    "") as string;

const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2024-06-20" });

/* ----------------- GET (avoid 405 in browser) ----------------- */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

/* ----------------- POST (Stripe webhook) ----------------- */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();

  if (!secret) {
    console.error("[stripe] missing webhook secret");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.error("[stripe] invalid signature", err?.message);
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;

      const email =
        s.customer_details?.email ||
        (typeof s.customer === "string"
          ? undefined
          : s.customer?.email) ||
        "";

      const amount = (s.amount_total || 0) / 100;
      const currency = (s.currency || "usd").toUpperCase();

      // -------- Emails --------
      const customerSubject = `Your MuseMint order is confirmed — ${currency} ${amount.toFixed(
        2
      )}`;
      const customerHtml = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
          <h2>Thanks for your purchase!</h2>
          <p>We’ve received your payment.</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Order:</strong> ${s.id}</p>
          <p>We’ll send product access or next steps shortly.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
          <p style="font-size:12px;color:#666">From: ${RESEND_FROM}</p>
        </div>
      `;

      if (email) {
        await sendEmail({ to: email, subject: customerSubject, html: customerHtml });
      } else {
        console.log("[email:skip] no buyer email on session", { session: s.id });
      }

      if (RESEND_TO) {
        const adminHtml = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
            <h3>New MuseMint order</h3>
            <p><strong>Session:</strong> ${s.id}</p>
            <p><strong>Customer:</strong> ${email || "(none on session)"}</p>
            <p><strong>Total:</strong> ${currency} ${amount.toFixed(2)}</p>
            <pre style="font-size:12px;background:#f7f7f7;padding:8px;border-radius:6px;white-space:pre-wrap">${JSON.stringify(
              s,
              null,
              2
            )}</pre>
          </div>
        `;
        await sendEmail({
          to: RESEND_TO,
          subject: `New order — ${currency} ${amount.toFixed(2)}`,
          html: adminHtml,
        });
      }

      // -------- Sheets logging (MuseMint + RST only) --------
      const payload = {
        source: "stripe-webhook",
        event: event.type,
        session_id: s.id,
        email,
        currency,
        amount,
        product: (s.metadata?.product || "") as string,
        sku: (s.metadata?.sku || "") as string,
        qty: Number(s.metadata?.qty || 1),
      };

      async function postTo(url?: string | null) {
        if (!url) return;
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const body = await r.text();
          console.log("[sheets:ok]", {
            url,
            status: r.status,
            body: body.slice(0, 200),
          });
        } catch (e: any) {
          console.error("[sheets:error]", { url, msg: e?.message || e });
        }
      }

      await Promise.all([
        postTo(process.env.SHEETS_MUSEMINT_URL),
        postTo(process.env.SHEETS_RST_URL),
        // 🚫 No Vault posting here
      ]);
    } else {
      console.log("[stripe] unhandled event", event.type);
    }
  } catch (err: any) {
    console.error("[webhook handler error]", err?.message || err);
    return NextResponse.json(
      { error: `Handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
