// lib/email.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
if (!resendApiKey) {
  console.warn("RESEND_API_KEY is missing. Customer emails will be skipped.");
}

export const resend = new Resend(resendApiKey);

// Envelope + brand defaults
export const FROM_EMAIL =
  process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>";

// Simple, clean HTML template
export function renderThankYouEmail(opts: {
  customerName?: string | null;
  productName: string;
  amount?: number; // cents
  currency?: string; // e.g. "usd"
  receiptUrl?: string | null;
}) {
  const { customerName, productName, amount, currency, receiptUrl } = opts;
  const niceAmount =
    typeof amount === "number" && currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.toUpperCase(),
        }).format(amount / 100)
      : undefined;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f12;padding:24px;color:#e6f1ee;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#11161a;border:1px solid #1d2a30;border-radius:14px;overflow:hidden">
          <tr>
            <td style="padding:28px 32px;text-align:center">
              <div style="font-size:28px;line-height:1.2;font-weight:700;letter-spacing:.3px;margin-bottom:6px">Thank you for your purchase!</div>
              <div style="font-size:14px;color:#9fb2ad"> ${customerName ? `Hi ${customerName},` : "Hi there,"} your order is confirmed.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1317;border:1px solid #1a262c;border-radius:12px">
                <tr>
                  <td style="padding:16px 18px">
                    <div style="font-size:14px;color:#b9c9c4">Product</div>
                    <div style="font-size:16px;font-weight:600;margin-top:4px;color:#e6f1ee">${productName}</div>
                    ${
                      niceAmount
                        ? `<div style="font-size:14px;color:#9fb2ad;margin-top:8px">Amount: <strong style="color:#e6f1ee">${niceAmount}</strong></div>`
                        : ""
                    }
                    ${
                      receiptUrl
                        ? `<div style="margin-top:14px">
                            <a href="${receiptUrl}" style="display:inline-block;background:#e7ff60;color:#000;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600">View receipt</a>
                          </div>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px">
              <div style="font-size:14px;color:#9fb2ad">
                You’ll also receive a separate email if your order includes any downloads or account access details.
                If you have questions, reply to this email or contact <a style="color:#e7ff60;text-decoration:none" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0b0f12;padding:18px 32px;text-align:center;color:#80928e;font-size:12px">
              © ${new Date().getFullYear()} MuseMint / RST Global
            </td>
          </tr>
        </table>
      </td>
    </tr>
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

  const { to, subject, customerName, productName, amount, currency, receiptUrl } =
    params;

  const html = renderThankYouEmail({
    customerName,
    productName,
    amount,
    currency,
    receiptUrl,
  });

  return await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: subject || "Thanks — your MuseMint purchase is confirmed",
    html,
  });
}
