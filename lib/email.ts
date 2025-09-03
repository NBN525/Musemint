// lib/email.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const fromEmail = process.env.FROM_EMAIL || "hello@rstglobal.ca";
const notifyEmail = process.env.SALES_NOTIFY_EMAIL || "hello@rstglobal.ca";

const resend = new Resend(resendApiKey);

export async function sendSaleEmail(subject: string, html: string) {
  if (!resendApiKey) {
    console.warn("Resend not configured; skipping sale email");
    return;
  }
  await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject,
    html,
  });
}

export async function sendSupportEmail(payload: {
  name?: string;
  email: string;
  topic?: string;
  message: string;
}) {
  if (!resendApiKey) {
    console.warn("Resend not configured; skipping support email");
    return;
  }
  const { name, email, topic, message } = payload;
  const subj = `MuseMint support: ${topic || "General"}`;
  const html = `
    <h2>New Support Request</h2>
    <p><b>Name:</b> ${name || "N/A"}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Topic:</b> ${topic || "General"}</p>
    <pre style="white-space:pre-wrap">${message}</pre>
  `;
  await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject: subj,
    html,
  });
}
