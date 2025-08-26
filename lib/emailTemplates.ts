// lib/emailTemplates.ts

export function buildReceiptEmail(opts: {
  productSummary: string;
  amount: number;
  currency: string; // e.g., 'USD'
  supportEmail: string;
  brandUrl: string;
}) {
  const { productSummary, amount, currency, supportEmail, brandUrl } = opts;

  const subject = `Your MuseMint receipt — ${productSummary}`;
  const prettyAmount = `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

  const text = [
    `Thanks for your purchase from MuseMint!`,
    ``,
    `Items: ${productSummary}`,
    `Total: ${prettyAmount}`,
    ``,
    `You can reach us at ${supportEmail} if you need help.`,
    ``,
    `— MuseMint`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0f0e;color:#eae9e5;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f0e;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#121618;border:1px solid #1e2629;border-radius:16px;">
            <tr>
              <td style="padding:28px 28px 12px 28px;text-align:center;">
                <div style="font-size:18px;line-height:24px;color:#eae9e5;">
                  <span style="display:inline-block;padding:6px 10px;border:1px solid #2b3a3f;border-radius:999px;font-size:12px;letter-spacing:.08em;color:#9adbbf;">MuseMint</span>
                </div>
                <h1 style="margin:18px 0 8px 0;font-size:22px;line-height:30px;color:#eae9e5;">Thanks for your purchase!</h1>
                <p style="margin:0 0 8px 0;color:#aeb5b8;">Here’s a quick summary of your order.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 16px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1315;border:1px solid #1e2629;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="color:#eae9e5;font-weight:600;margin-bottom:6px;">${productSummary}</div>
                      <div style="color:#9fb2b8;font-size:14px;">Total paid</div>
                    </td>
                    <td align="right" style="padding:16px 18px;">
                      <div style="color:#ffd166;font-weight:700;">${prettyAmount}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px 28px;">
                <p style="color:#aeb5b8;margin:0 0 16px 0;font-size:14px;">
                  If you have any questions or need help, reply to this email or contact us at
                  <a href="mailto:${supportEmail}" style="color:#9adbbf;text-decoration:none;">${supportEmail}</a>.
                </p>
                <div style="text-align:center;margin-top:8px;">
                  <a href="${brandUrl}" style="display:inline-block;background:#ffd166;color:#0b0f0e;padding:10px 16px;border-radius:10px;font-weight:600;text-decoration:none;">Visit MuseMint</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px 28px;border-top:1px solid #1e2629;color:#6f7a80;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} MuseMint · An RST Global venture
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
