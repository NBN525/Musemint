// lib/emailTemplates.ts

type MinimalCheckoutSession = {
  customer_details?: { name?: string | null };
  amount_total?: number | null;
  currency?: string | null;
};

function formatCurrency(amount?: number | null, currency?: string | null) {
  if (!amount || !currency) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${amount / 100} ${currency?.toUpperCase() ?? ""}`;
  }
}

export function welcomeEmailHTML(session: MinimalCheckoutSession) {
  const name = session.customer_details?.name?.split(" ")[0] || "there";
  const total = formatCurrency(session.amount_total, session.currency);

  return `<!doctype html>
<html>
  <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#0b0e10; color:#eaeef2; padding:32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto; background:#12161a; border-radius:12px; overflow:hidden;">
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 8px 0; font-size:24px;">Welcome to <span style="color:#ffd166;">MuseMint</span> ✨</h1>
        <p style="margin:0 0 16px 0; opacity:.9;">Hi ${name}, thanks for your purchase${
          total ? ` of <strong>${total}</strong>` : ""
        }! Your workspace is being set up.</p>

        <div style="margin:24px 0;">
          <a href="https://ai.rstglobal.ca/dashboard" style="display:inline-block; background:#ffd166; color:#0b0e10; text-decoration:none; padding:12px 16px; border-radius:8px; font-weight:600;">
            Open Dashboard
          </a>
        </div>

        <p style="margin:16px 0 0 0; font-size:13px; opacity:.7;">
          Questions? Just reply to this email or write us at hello@rstglobal.ca.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function welcomeEmailText(session: MinimalCheckoutSession) {
  const name = session.customer_details?.name?.split(" ")[0] || "there";
  const total = formatCurrency(session.amount_total, session.currency);
  return [
    `Welcome to MuseMint!`,
    ``,
    `Hi ${name}, thanks for your purchase${total ? ` of ${total}` : ""}.`,
    `Your workspace is being set up.`,
    ``,
    `Open your dashboard: https://ai.rstglobal.ca/dashboard`,
    ``,
    `Need help? Reply here or email hello@rstglobal.ca`,
  ].join("\n");
}
