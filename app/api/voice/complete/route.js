// /app/api/voice/complete/route.js
// Twilio Recording Status Callback (fires after media is available)

import { NextResponse } from "next/server";

const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL || "";

export async function POST(req) {
  // Twilio posts application/x-www-form-urlencoded
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);

  const callSid = params.get("CallSid") || "";
  const recordingSid = params.get("RecordingSid") || "";
  const status = params.get("RecordingStatus") || "";
  const recordingUrlBase = params.get("RecordingUrl") || "";
  const recordingUrl = recordingUrlBase ? `${recordingUrlBase}.mp3` : "";

  try {
    if (SHEET_WEBHOOK_URL) {
      await fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Twilio-RecordingCallback",
          callSid,
          recordingSid,
          recordingUrl,
          status,
        }),
      });
    }
  } catch (_) {
    // ignore
  }

  // Respond with empty TwiML (ack)
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
    headers: { "Content-Type": "text/xml" },
  });
}
