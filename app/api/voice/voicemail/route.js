// /app/api/voice/voicemail/route.js
// Handles Twilio <Record action="/api/voice/voicemail"> callback,
// logs to Google Sheets, optionally sends an SMS alert, then
// returns TwiML to gracefully end the call.

import { NextResponse } from "next/server";

// Helper to always answer Twilio with XML
function twiml(xml) {
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req) {
  // Twilio posts application/x-www-form-urlencoded
  const form = await req.formData();

  // Common fields Twilio sends on recording callbacks
  const from = form.get("From") || "";
  const to = form.get("To") || "";
  const callSid = form.get("CallSid") || "";
  const recordingUrl = form.get("RecordingUrl") || ""; // .mp3 available by appending ".mp3"
  const recordingSid = form.get("RecordingSid") || "";
  const recordingDuration = form.get("RecordingDuration") || "";
  const transcriptionText = form.get("TranscriptionText") || ""; // only if transcription enabled

  // ---- 1) Log to Google Sheets (optional but recommended) ----
  try {
    const sheetWebhook = process.env.SHEET_WEBHOOK_URL;
    if (sheetWebhook) {
      await fetch(sheetWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Twilio-Voicemail",
          from,
          to,
          callSid,
          recordingUrl,
          recordingSid,
          durationSec: recordingDuration,
          transcript: transcriptionText,
          status: "new",
        }),
      });
    }
  } catch (err) {
    // Don’t throw; still return TwiML so Twilio isn’t left hanging
    console.error("Sheet log error:", err);
  }

  // ---- 2) SMS alert to you (optional) ----
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
    const alertTo = process.env.ALERT_SMS_TO;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (accountSid && apiKeySid && apiKeySecret && alertTo && fromNumber) {
      const auth = Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString("base64");

      const bodyText =
        `New voicemail from ${from || "unknown"} (${recordingDuration}s).\n` +
        `Listen: ${recordingUrl}.mp3\nCall SID: ${callSid}`;

      const params = new URLSearchParams({
        To: alertTo,
        From: fromNumber,
        Body: bodyText,
      });

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
    }
  } catch (err) {
    console.error("Alert SMS error:", err);
  }

  // ---- 3) Tell Twilio we’re done (play confirmation, hang up) ----
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thanks. We got your message. Goodbye.</Say>
  <Hangup/>
</Response>`;

  return twiml(xml);
}

// Optional: respond to accidental GETs while testing
export const GET = async () =>
  twiml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Voicemail endpoint OK.</Say></Response>`);
