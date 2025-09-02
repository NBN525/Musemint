import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "";
const resendTo = process.env.ALERT_EMAIL_TO || ""; // optional
const resendFrom = process.env.ALERT_EMAIL_FROM || "alerts@rstglobal.ca"; // must be verified in Resend
const sheetUrl = process.env.SHEETS_WEBHOOK_URL || ""; // your Apps Script endpoint

const resend = resendKey ? new Resend(resendKey) : null;

type Level = "info" | "warn" | "error";

export async function logEvent(level: Level, message: string, data?: any) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    data,
    source: "musemint",
  };

  // Fire-and-forget: Google Sheet
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "event", ...payload }),
      });
    } catch {/* ignore */}
  }

  // Optional alert email for errors only
  if (level === "error" && resend && resendTo) {
    try {
      await resend.emails.send({
        from: resendFrom,
        to: resendTo,
        subject: "MuseMint Error",
        text: `${message}\n\n${JSON.stringify(data || {}, null, 2)}`,
      });
    } catch {/* ignore */}
  }
}
