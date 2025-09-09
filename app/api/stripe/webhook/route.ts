// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { env } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Stripe bootstrap ---
const stripe = new Stripe(
  (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || "") as string,
  { apiVersion: "2024-06-20" }
);
function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase();
  const live = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST;
  return mode === "test" ? (test as string) : (live as string);
}

// --- Resend helpers ---
const RESEND_KEY = process.env.RESEND_API_KEY || "";
function getResend(): Resend | null { return RESEND_KEY ? new Resend(RESEND_KEY) : null; }
function stripHtml(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, " ")
             .replace(/<script[\s\S]*?<\/script>/gi, " ")
             .replace(/<[^>]+>/g, " ")
             .replace(/\s+/g, " ").trim();
}
async function sendEmail(to: string, subject: string, html: string) {
  const r = getResend(); const e = env();
  if (!r || !e.resendFrom || !to) return { skipped: true };
  const text = stripHtml(html);
  return r.emails.send({
    from: e.resendFrom,
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
}

// --- Sheets logging (Apps Script exec urls) ---
async function postToSheets(url: string, payload: any) {
  if (!url) return { skipped: true };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // Apps Script exec endpoints require no auth when set to "anyone with link"
  }).catch((e) => ({ ok: false, statusText: String(e) } as any));
  if ((res as any)?.ok === false) return { ok: false };
  try { return await (res as Response).json(); } catch { return { ok: true }; }
}

// Optional GET so you don’t see 405 in browser
export async function GET() { return NextResponse.json({ ok: true }, { status: 200 }); }

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const secret = getWebhookSecret();
  if (!secret) return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 });
  }

  const e = env();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const buyerEmail =
          session.customer_details?.email ||
          (typeof session.customer === "string" ? undefined : session.customer?.email) || "";

        const amount = (session.amount_total || 0) / 100;
        const currency = (session.currency || e.currency).toUpperCase();

        // ---------- Customer success email ----------
        if (buyerEmail) {
          const html = `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#111;line-height:1.55">
              <h2 style="margin:0 0 10px">🎉 Thanks for your purchase!</h2>
              <p style="margin:0 0 10px">
                You secured <b>${e.productName}</b> at the
                <b style="color:#16a34a">${e.launchPrice ? `${currency} ${e.launchPrice.toFixed(2)}` : "launch price"}</b>.
              </p>
              <p style="margin:0 0 12px"><b>Order:</b> ${session.id}<br/><b>Amount:</b> ${currency} ${amount.toFixed(2)}</p>

              <p style="margin:16px 0 8px">Your download:</p>
              <a href="${e.downloadUrl}" 
                 style="display:inline-block;background:#facc15;color:#111;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">
                 ⬇️ Download Your Planner
              </a>
              <p style="font-size:12px;color:#666;margin-top:8px">If the button doesn’t work, open: <br/>${e.downloadUrl}</p>

              <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
              <p style="font-size:12px;color:#666;margin:0">From: ${e.resendFrom}</p>
            </div>
          `;
          await sendEmail(buyerEmail, `Your ${e.productName} is ready — ${currency} ${amount.toFixed(2)}`, html);
        }

        // ---------- Internal email ----------
        if (e.resendTo) {
          const adminHtml = `
            <div style="font-family:system-ui,Roboto,Arial;color:#111">
              <h3 style="margin:0 0 8px">New order</h3>
              <p><b>Product:</b> ${e.productName}<br/>
                 <b>Session:</b> ${session.id}<br/>
                 <b>Customer:</b> ${buyerEmail || "(none)"}<br/>
                 <b>Total:</b> ${currency} ${amount.toFixed(2)}</p>
              <pre style="font-size:12px;background:#f7f7f7;padding:8px;border-radius:6px;white-space:pre-wrap">${JSON.stringify(session, null, 2)}</pre>
            </div>
          `;
          await sendEmail(e.resendTo, `New order — ${currency} ${amount.toFixed(2)}`, adminHtml);
        }

        // ---------- Sheets logging (MuseMint + RST) ----------
        const payload = {
          source: "stripe",
          event: "checkout.session.completed",
          session_id: session.id,
          email: buyerEmail,
          currency,
          amount,
          product: e.productName,
          sku: "PLANNER-PRO",
          qty: 1,
        };
        await Promise.all([
          postToSheets(e.sheetsMuseMintUrl, payload),
          postToSheets(e.sheetsRstUrl, payload),
        ]);

        break;
      }

      default:
        // noop
        break;
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Handler error: ${err?.message || "unknown"}` }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
    }
