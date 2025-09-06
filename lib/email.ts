// lib/email.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
export const resend = new Resend(resendApiKey);

export const FROM_EMAIL =
  process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>";

const INTERNAL_TO = (process.env.INTERNAL_SALE_ALERT_TO || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function money(amount?: number, currency?: string) {
  if (typeof amount !== "number" || !currency) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency?.toUpperCase() || ""}`.trim();
  }
}

/* ---------------- Customer THANK-YOU ---------------- */

export function renderThankYouEmail(opts: {
  customerName?: string | null;
  productName: string;
  amount?: number;
  currency?: string;
  receiptUrl?: string | null;
}) {
  const { customerName, productName, amount, currency, receiptUrl } = opts;
  const price = money(amount, currency);

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f12;padding:24px;color:#e6f1ee;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#11161a;border:1px solid #1d2a30;border-radius:14px;overflow:hidden">
        <tr><td style="padding:28px 32px;text-align:center">
          <div style="font-size:28px;font-weight:700;letter-spacing:.3px;margin-bottom:6px">Thank you for your purchase!</div>
          <div style="font-size:14px;color:#9fb2ad">${customerName ? `Hi ${customerName},` : "Hi there,"} your order is confirmed.</div>
        </td></tr>
        <tr><td style="padding:0 32px 20px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1317;border:1px solid #1a262c;border-radius:12px">
            <tr><td style="padding:16px 18px">
              <div style="font-size:14px;color:#b9c9c4">Product</div>
              <div style="font-size:16px;font-weight:600;margin-top:4px;color:#e6f1ee">${productName}</div>
              ${price ? `<div style="font-size:14px;color:#9fb2ad;margin-top:8px">Amount: <strong style="color:#e6f1ee">${price}</strong></div>` : ""}
              ${
                receiptUrl
                  ? `<div style="margin-top:14px"><a href="${receiptUrl}" style="display:inline-block;background:#e7ff60;color:#000;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600">View receipt</a></div>`
                  : ""
              }
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 28px">
          <div style="font-size:14px;color:#9fb2ad">
            You’ll also receive a separate email if your order includes any downloads or account access details.
            Questions? Just reply or email <a style="color:#e7ff60;text-decoration:none" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.
          </div>
        </td></tr>
        <tr><td style="background:#0b0f12;padding:18px 32px;text-align:center;color:#80928e;font-size:12px">
          © ${new Date().getFullYear()} MuseMint / RST Global
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

export async function sendThankYouEmail(params: {
  to: string;
  subject?: string;
  customerName?: string | null;
  productName: string;
  amount?: number;
  currency?: string;
  receiptUrl?: string | null;
}) {
  if (!resendApiKey) return { id: null };
  const html = renderThankYouEmail(params);
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject || "Thanks — your MuseMint purchase is confirmed",
    html,
  });
}

/* ---------------- Internal SALE ALERT ---------------- */

function renderInternalSaleEmail(opts: {
  email?: string;
  name?: string | null;
  productName: string;
  amount?: number;
  currency?: string;
  mode: "live" | "test";
  sessionId?: string;
  receiptUrl?: string | null;
}) {
  const price = money(opts.amount, opts.currency);
  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#0b0f12">
    <h2 style="margin:0 0 8px">🟢 New ${opts.mode.toUpperCase()} sale</h2>
    <ul style="margin:0;padding-left:18px">
      <li><strong>Buyer:</strong> ${opts.name ? `${opts.name} — ` : ""}${opts.email || "(unknown)"}</li>
      <li><strong>Product:</strong> ${opts.productName}</li>
      ${price ? `<li><strong>Amount:</strong> ${price}</li>` : ""}
      ${opts.receiptUrl ? `<li><strong>Receipt:</strong> <a href="${opts.receiptUrl}">${opts.receiptUrl}</a></li>` : ""}
      ${opts.sessionId ? `<li><strong>Session:</strong> ${opts.sessionId}</li>` : ""}
    </ul>
  </div>`;
}

export async function sendInternalSaleAlert(opts: {
  email?: string;
  name?: string | null;
  productName: string;
  amount?: number;
  currency?: string;
  mode: "live" | "test";
  sessionId?: string;
  receiptUrl?: string | null;
}) {
  if (!resendApiKey || INTERNAL_TO.length === 0) return { id: null };
  const html = renderInternalSaleEmail(opts);
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: INTERNAL_TO,
    subject: `New ${opts.mode.toUpperCase()} sale — ${opts.productName}`,
    html,
  });
        }
