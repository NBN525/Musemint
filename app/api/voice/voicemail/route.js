// /app/api/voice/voicemail/route.js
// Receives Twilio's POST after a recording completes (action attribute from <Record>)

import { NextResponse } from "next/server";

const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL || "";
const ALERT_SMS_TO = process.env.ALERT_SMS_TO || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "";

function xml(res) {
  return new NextResponse(res, { headers: { "Content-Type": "text/xml" } });
}

export async function POST(req) {
  let form;
  try {
    form = await req.formData();
  } catch (_) {
    // If Twilio retries as urlencoded, handle gracefully
    const text = await req.text();
    const params = new URLSearchParams(text);
    form = {
      get: (k) => params.get(k),
    };
  }

  const from = String(form.get("From") || "");
  const callSid = String(form.get("CallSid") || "");
  const recordingUrlRaw = String(form.get("RecordingUrl") || ""); // Twilio gives without .mp3
  const duration = String(form.get("RecordingDuration") || "");
  const recordingUrl = recordingUrlRaw ? `${recordingUrlRaw}.mp3` : "";

  // Fire-and-forget log to Google Sheets
  try {
    if (SHEET_WEBHOOK_URL) {
      await fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Twilio-Voicemail",
          from,
          callSid,
          recordingUrl,
          durationSec: duration,
          status: "new",
        }),
      });
    }
  } catch (_) {
    // swallow — don't block caller UX
  }

  // (Optional) SMS alert via Twilio’s Notify-like pattern (simple webhook response can’t send SMS)
  // The actual SMS is better triggered by your Google Apps Script or another serverless function.

  const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thanks. We received your message. Goodbye.</Say>
  <Hangup/>
</Response>`;
  return xml(response);
}
