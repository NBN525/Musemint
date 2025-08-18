import { NextRequest, NextResponse } from "next/server";

const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL!;
const ALERT_SMS_TO = process.env.ALERT_SMS_TO!;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER!;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID!;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET!;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const from = (form.get("From") as string) || "";
  const callSid = (form.get("CallSid") as string) || "";
  const recUrl = (form.get("RecordingUrl") as string) || "";
  const recSid = (form.get("RecordingSid") as string) || "";
  const duration = (form.get("RecordingDuration") as string) || "0";

  // 1) Log to Google Sheet
  try {
    await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source: "Twilio-Voicemail",
        from,
        callSid,
        recordingUrl: recUrl,
        recordingSid: recSid,
        durationSec: duration,
        status: "New voicemail"
      })
    });
  } catch (e) {
    // swallow & proceed with SMS to ensure we don't block the call flow
  }

  // 2) SMS notify you with the link
  try {
    const basic = Buffer.from(`${TWILIO_API_KEY_SID}:${TWILIO_API_KEY_SECRET}`).toString("base64");
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const body = new URLSearchParams({
      From: TWILIO_FROM_NUMBER,
      To: ALERT_SMS_TO,
      Body: `New voicemail from ${from} (${duration}s): ${recUrl}.mp3`
    });

    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });
  } catch (e) {}

  // TwiML response to caller: confirmation + hangup
  const xml = `
    <Response>
      <Say>Thank you. Your message has been recorded. Goodbye.</Say>
      <Hangup/>
    </Response>
  `;
  return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
