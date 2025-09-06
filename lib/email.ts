// lib/email.ts
/**
 * Minimal Resend wrappers that match legacy export names used elsewhere.
 * Keep signatures simple: (subject, html, to?) and pull defaults from env.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendEmailCore(subject: string, html: string, toOverride?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email send");
    return;
  }
  const from = process.env.MAIL_FROM || "MuseMint <hello@rstglobal.ca>";
  const to = toOverride || process.env.MAIL_TO;
  if (!to) {
    console.warn("MAIL_TO not set; skipping email send");
    return;
  }

  const body = {
    from,
    to,
    subject,
    html,
  };

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("Resend failed:", res.status, t);
  }
}

export async function sendSaleEmail(subject: string, html: string, to?: string) {
  await sendEmailCore(subject, html, to);
}

export async function sendSupportEmail(subject: string, html: string, to?: string) {
  await sendEmailCore(subject, html, to);
}
