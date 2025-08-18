import { NextRequest, NextResponse } from "next/server";

// Helper: build a TwiML response
function twiml(xml: string) {
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

// POST from Twilio after caller presses # (finishOnKey)
export async function POST(req: NextRequest) {
  // Twilio sends application/x-www-form-urlencoded
  const body = await req.text();
  const params = new URLSearchParams(body);

  const callSid = params.get("CallSid") || "";
  const from = params.get("From") || "";
  const recordingUrl = params.get("RecordingUrl") || ""; // ends with .wav when fetched
  const recordingDuration = params.get("RecordingDuration") || "0";

  // (Optional) Log to your Google Sheet
  try {
    const url = process.env.SHEET_WEBHOOK_URL;
    if (url) {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Twilio-Voicemail",
          callSid,
          from,
          recordingUrl,
          recordingDuration,
          status: "voicemail",
        }),
      });
    }
  } catch (e) {
    // swallow errors so we still reply TwiML
    console.error("Sheet log failed:", e);
  }

  // Use a more natural Polly voice if available; else fall back to Alice
  const voice = "Polly.Joanna-Neural"; // try Joanna first
  const fallbackVoice = "alice";

  const responseXml = `
    <Response>
      <Say voice="${voice}">Thanks. Your message was received. We will follow up shortly.</Say>
      <Say voice="${fallbackVoice}"></Say>
      <Hangup/>
    </Response>
  `.trim();

  return twiml(responseXml);
}

// Twilio may preflight with GET in some cases — be friendly.
export const GET = () =>
  twiml(`<Response><Say>Endpoint ready.</Say></Response>`);
