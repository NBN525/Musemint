// /app/api/voice/route.js
import { NextResponse } from "next/server";

const twiml = (xml) =>
  new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });

export async function POST(req) {
  // Twilio sends form-encoded data
  const form = await req.formData();
  const digits = form.get("Digits");

  // If the caller already pressed a key, branch now
  if (digits) {
    const dept =
      digits === "1" ? "Sales" : digits === "2" ? "Support" : null;

    if (!dept) {
      return twiml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Invalid selection.</Say>
  <Redirect method="POST">/api/voice</Redirect>
</Response>`);
    }

    // Important: nothing after <Record/> so control goes to action URL
    return twiml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    You reached ${dept}. Please leave your name, number, and a brief message after the tone.
    Press pound when finished.
  </Say>
  <Record playBeep="true" maxLength="120" finishOnKey="#"
          method="POST" action="/api/voice/voicemail" />
</Response>`);
  }

  // First hit: play the menu and gather a single digit
  return twiml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/voice" method="POST" timeout="5">
    <Say voice="alice">Welcome to R S T Global. For sales, press 1. For support, press 2.</Say>
  </Gather>
  <Say voice="alice">We didn't receive any input.</Say>
  <Redirect method="POST">/api/voice</Redirect>
</Response>`);
}

// Optional: allow GET to hit the same logic (useful during testing)
export const GET = POST;
