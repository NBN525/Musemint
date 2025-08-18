// app/api/voice/handle/route.ts
import { NextRequest, NextResponse } from "next/server";

const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL || "";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID || "";
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "";
const ALERT_SMS_TO = process.env.ALERT_SMS_TO || "";

function twiml(xml: string) {
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  // Twilio posts application/x-www-form-urlencoded
  const body = await req.text();
  const params = new URLSearchParams(body);

  const callSid = params.get("CallSid") || "";
  const from = params.get("From") || "";
  const to = params.get("To") || "";
  const recordingUrlBase = params.get("RecordingUrl") || ""; // Twilio gives base URL (no extension)
  const recordingDuration = params.get("RecordingDuration") || "0";
  const recordingUrl = recordingUrlBase ? `${recordingUrlBase}.mp3` : "";

  // 1) Log to Google Sheet
  try {
    if (SHEET_WEBHOOK_URL) {
      await fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Twilio-Voicemail",
          callSid,
          from,
          to,
          recordingUrl,
          recordingDuration,
          status: "voicemail",
        }),
      });
    }
  } catch (_) {}

  // 2) SMS alert with the recording link
  try {
    if (
      TWILIO_ACCOUNT_SID &&
      TWILIO_API_KEY_SID &&
      TWILIO_API_KEY_SECRET &&
      TWILIO_FROM_NUMBER &&
      ALERT_SMS_TO
    ) {
      const auth = Buffer.from(`${TWILIO_API_KEY_SID}:${TWILIO_API_KEY_SECRET}`).toString("base64");
      const smsBody =
        `New voicemail from ${from || "Unknown"} (${recordingDuration}s)\n` +
        `${recordingUrl}`;

      const form = new URLSearchParams({
        From: TWILIO_FROM_NUMBER,
        To: ALERT_SMS_TO,
        Body: smsBody,
      });

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      });
    }
  } catch (_) {}

  // 3) Tell caller we got it
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thanks. Your message was received. We will follow up shortly.</Say>
  <Say voice="alice"></Say>
  <Hangup/>
</Response>`;
  return twiml(xml);
}

export const GET = () =>
  twiml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Handle endpoint OK</Say></Response>`);
