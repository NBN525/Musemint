// lib/email.ts
import { Resend } from "resend";

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "MuseMint Receipts <hello@rstglobal.ca>";
const RESEND_TO = process.env.RESEND_TO || ""; // your internal inbox

function getResend(): Resend | null {
  return RESEND_KEY ? new Resend(RESEND_KEY) : null;
}

type KV = Record<string, unknown>;
const log = (s: string, d: KV) => {
  try { console.log(`[email:${s}]`, JSON.stringify(d)); }
  catch { console.log(`[email:${s}]`, d); }
};

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sendSaleEmailInternal(subject: string, html: string) {
  const resend = getResend();
  if (!resend || !RESEND_FROM || !RESEND_TO) {
    log("skip-internal", { hasKey: !!RESEND_KEY, from: !!RESEND_FROM, to: !!RESEND_TO });
    return { skipped: true };
  }
  const text = stripHtml(html);
  log("intent-internal", { to: RESEND_TO, from: RESEND_FROM, subject });
  const resp = await resend.emails.send({
    from: RESEND_FROM,
    to: RESEND_TO,
    subject,
    html,
    text,
    reply_to: "support@rstglobal.ca",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@rstglobal.ca>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  log("sent-internal", { id: (resp as any)?.id || null });
  return resp;
}

export async function sendSaleEmailCustomer(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend || !RESEND_FROM || !to) {
    log("skip-customer", { hasKey: !!RESEND_KEY, from: !!RESEND_FROM, to });
    return { skipped: true };
  }
  const text = stripHtml(html);
  log("intent-customer", { to, from: RESEND_FROM, subject });
  const resp = await resend.emails.send({
    from: RESEND_FROM,
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
  log("sent-customer", { id: (resp as any)?.id || null });
  return resp;
}
