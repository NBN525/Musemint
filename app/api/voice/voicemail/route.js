// app/api/voice/voicemail/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensures Node runtime on Vercel

function responseWithTwiML(xml: string) {
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// Twilio will POST here for calls; we also handle GET just in case.
export async function POST(_req: NextRequest) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Please leave your message after the tone. 
    When you are finished, press the pound key.
  </Say>
  <Record
    maxLength="120"
    playBeep="true"
    finishOnKey="#"
    action="/api/handle-voicemail"
    method="POST"
    recordingStatusCallback="/api/voice/complete"
    recordingStatusCallbackMethod="POST"
  />
  <Say voice="alice">We did not receive a message. Goodbye.</Say>
  <Hangup/>
</Response>`;
  return responseWithTwiML(twiml);
}

export async function GET(req: NextRequest) {
  // Some tools hit GET during verification; serve the same TwiML.
  return POST(req);
}
