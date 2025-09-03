// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Basic shape the webhook will pass in
export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  bcc?: string[];
};

// One canonical function the webhook expects
export async function sendSaleEmail({ to, subject, html, bcc }: SendArgs) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing");
    return;
  }

  // Normalize address list
  const toList = Array.isArray(to) ? to : [to];

  // Optional safety BCC while Gmail finishes MX/DKIM/DMARC, etc.
  const bccList = bcc ?? (process.env.SALES_EMAIL_FALLBACK_BCC
    ? [process.env.SALES_EMAIL_FALLBACK_BCC]
    : []);

  try {
    const result = await resend.emails.send({
      from: 'MuseMint <hello@rstglobal.ca>',
      to: toList,
      ...(bccList.length ? { bcc: bccList } : {}),
      subject,
      html,
    });
    console.log("Resend ok:", result?.id ?? result);
    return result;
  } catch (err) {
    console.error("Resend send error:", err);
    throw err;
  }
}

// Back-compatible alias so other code can call sendEmail(...)
export const sendEmail = sendSaleEmail;
