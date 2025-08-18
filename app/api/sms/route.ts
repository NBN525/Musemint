// app/api/sms/route.ts
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Twilio posts x-www-form-urlencoded
    const form = await req.formData();
    const from = String(form.get("From") ?? "");
    const body = String(form.get("Body") ?? "");
    const to   = String(form.get("To") ?? "");
    const sid  = String(form.get("MessageSid") ?? "");
    const ts   = new Date().toISOString();

    // Push a row to your Google Apps Script webhook (Sheet)
    const res = await fetch(process.env.SHEET_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "sms_inbound",
        timestamp: ts,
        from,
        to,
        messageSid: sid,
        body
      }),
      // If your Apps Script is sometimes slow, give it more time
      // @ts-ignore
      duplex: "half" 
    });

    // Build a TwiML auto-reply (keep it short to avoid MMS)
    const reply =
      `<?xml version="1.0" encoding="UTF-8"?>
       <Response>
         <Message>Thanks! We received: "${escapeXml(body).slice(0,140)}". A specialist will follow up soon.</Message>
       </Response>`;

    // If Sheets call failed, still reply to Twilio so the SMS succeeds
    return new Response(reply, { status: 200, headers: { "Content-Type": "text/xml" } });
  } catch (err) {
    const reply =
      `<?xml version="1.0" encoding="UTF-8"?>
       <Response>
         <Message>Thanks! Message received.</Message>
       </Response>`;
    return new Response(reply, { status: 200, headers: { "Content-Type": "text/xml" } });
  }
}

// Simple XML escaper for TwiML
function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
