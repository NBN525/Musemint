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

// /app/api/voice/route.js
// IVR entrypoint. Offers "press 1 to leave a message" and routes to /api/voice/voicemail

import { NextResponse } from "next/server";

function twiml(xml) {
  return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}

export async function POST(req) {
  const form = await req.formData();
  const digits = (form.get("Digits") || "").toString();

  // If the caller already pressed a key, branch on it
  if (digits) {
    switch (digits) {
      case "1": {
        // Go record a voicemail, end with #, up to 2 minutes
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please leave your message after the tone. Press pound when you are finished.</Say>
  <Record action="/api/voice/voicemail"
          method="POST"
          maxLength="120"
          finishOnKey="#"
          playBeep="true"
          recordingStatusCallback="/api/voice/complete"
          recordingStatusCallbackMethod="POST"/>
  <Say voice="alice">We did not receive a recording. Goodbye.</Say>
  <Hangup/>
</Response>`;
        return twiml(xml);
      }

      // Add other options here (e.g., 2 for sales, 3 for support) if/when you want.

      default: {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, that wasn't a valid choice.</Say>
  <Redirect method="POST">/api/voice</Redirect>
</Response>`;
        return twiml(xml);
      }
    }
  }

  // No digits yet → present the main menu
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="dtmf" numDigits="1" timeout="5" method="POST">
    <Say voice="alice">
      Thanks for calling R S T Global. 
      Press 1 to leave a message and a specialist will get back to you.
    </Say>
  </Gather>
  <!-- If they didn't press anything, repeat once then end -->
  <Say voice="alice">We didn't receive any input.</Say>
  <Redirect method="POST">/api/voice</Redirect>
</Response>`;
  return twiml(xml);
}

// Optional GET for sanity-check in browser
export const GET = async () =>
  twiml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">IVR OK.</Say></Response>`);

// Optional: allow GET to hit the same logic (useful during testing)
export const GET = POST;
