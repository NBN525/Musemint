// lib/emailTemplates.ts

type SaleEmailArgs = {
  brand: string;           // e.g., "MuseMint"
  productSummary: string;  // "Planner 2025 × 1 • Stickers Pack × 1"
  amount: number;          // already in major units (e.g., 19.99)
  currency: string;        // e.g., "CAD"
  customerEmail: string;   // buyer’s email
  sessionId: string;       // Stripe checkout session id
  mode: "LIVE" | "TEST";
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency is odd
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function buildSaleEmail(args: SaleEmailArgs) {
  const total = formatMoney(args.amount, args.currency);
  const subject = `${args.brand} sale: ${total}`;

  const html = `
  <div style="font-family: Inter, Segoe UI, Arial, sans-serif; background:#0b0f12; color:#e8eaed; padding:24px">
    <div style="max-width:640px; margin:0 auto; background:#11161a; border:1px solid #1f2a33; border-radius:12px; overflow:hidden">
      <div style="padding:20px 24px; border-bottom:1px solid #1f2a33; display:flex; align-items:center; gap:10px">
        <div style="width:10px; height:10px; border-radius:50%; background:#22c55e;"></div>
        <div style="font-weight:600; letter-spacing:.2px">${args.brand} — New sale</div>
        <div style="margin-left:auto; font-size:12px; color:#9aa4af">${args.mode}</div>
      </div>

      <div style="padding:24px">
        <p style="margin:0 0 12px 0; color:#9aa4af; font-size:13px">New sale (Stripe Checkout)</p>

        <table style="width:100%; border-collapse:collapse; margin:12px 0 18px 0">
          <tr>
            <td style="padding:8px 0; color:#9aa4af; width:120px">Products</td>
            <td style="padding:8px 0; color:#e8eaed">${args.productSummary}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#9aa4af;">Amount</td>
            <td style="padding:8px 0; color:#e8eaed; font-weight:600">${total}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#9aa4af;">Customer</td>
            <td style="padding:8px 0;"><a href="mailto:${args.customerEmail}" style="color:#67e8f9; text-decoration:none">${args.customerEmail}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#9aa4af;">Session</td>
            <td style="padding:8px 0; color:#cbd5e1">${args.sessionId}</td>
          </tr>
        </table>

        <p style="margin-top:18px; font-size:12px; color:#9aa4af">Logged to Google Sheet. This is an automated email.</p>
      </div>
    </div>
  </div>
  `;

  return { subject, html };
}
