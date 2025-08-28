// lib/email.ts
type SaleEmailArgs = {
  to: string;         // comma-separated list or single email
  from?: string;      // optional; falls back to env
  amount: number;     // dollars
  currency: string;   // e.g., "CAD"
  email?: string;     // buyer email (if present)
  sessionId: string;
  mode: "LIVE" | "TEST";
};

export async function sendSaleEmail(args: SaleEmailArgs) {
  const key = process.env.RESEND_API_KEY;
  const from = args.from || process.env.SALES_NOTIFY_FROM || "hello@rstglobal.ca";
  const to = args.to || process.env.SALES_NOTIFY_TO || "";

  if (!key || !to) {
    console.warn("Email disabled: missing RESEND_API_KEY or SALES_NOTIFY_TO");
    return { ok: false, reason: "missing-config" as const };
  }

  const subject = `MuseMint sale: ${args.amount.toFixed(2)} ${args.currency}`;
  const html = `
    <div style="font-family:Inter,system-ui,Arial,sans-serif;max-width:640px">
      <h2 style="margin:0 0 8px">New sale (Stripe Checkout)</h2>
      <p style="margin:4px 0"><b>Mode:</b> ${args.mode}</p>
      <p style="margin:4px 0"><b>Amount:</b> ${args.amount.toFixed(2)} ${args.currency}</p>
      <p style="margin:4px 0"><b>Customer:</b> ${args.email || "n/a"}</p>
      <p style="margin:4px 0"><b>Session:</b> ${args.sessionId}</p>
      <p style="margin-top:16px;color:#555">Logged to Google Sheet (if configured).</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: to.split(",").map(s => s.trim()).filter(Boolean),
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Resend email failed:", res.status, text);
    return { ok: false as const, reason: "resend-failed" as const };
  }
  return { ok: true as const };
}
