// Receives the POST after a successful <Record ... action="/api/voice/voicemail">
export async function POST(req) {
  const form = await req.formData();
  const from = (form.get("From") || "").toString();
  const callSid = (form.get("CallSid") || "").toString();
  const recordingUrl = (form.get("RecordingUrl") || "").toString();
  const duration = (form.get("RecordingDuration") || "").toString();

  // Fire-and-forget log to Google Sheet (if configured)
  try {
    const url = process.env.SHEET_WEBHOOK_URL;
    if (url) {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Twilio-Voicemail",
          from,
          callSid,
          recordingUrl,
          durationSec: duration,
          status: "new"
        })
      });
    }
  } catch (_) {}

  // (Optional) SMS alert to you
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const key = process.env.TWILIO_API_KEY_SID;
    const secret = process.env.TWILIO_API_KEY_SECRET;
    const fromNum = process.env.TWILIO_FROM_NUMBER;
    const toNum = process.env.ALERT_SMS_TO;

    if (sid && key && secret && fromNum && toNum) {
      const auth = Buffer.from(`${key}:${secret}`).toString("base64");
      const body = new URLSearchParams({
        From: fromNum,
        To: toNum,
        Body: `New voicemail from ${from} (${duration}s): ${recordingUrl}.mp3`
      });
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      });
    }
  } catch (_) {}

  // Respond 200 to Twilio (no additional TwiML needed here)
  return new Response("ok");
}

// Optional GET for quick health check
export async function GET() {
  return new Response("ok");
}
