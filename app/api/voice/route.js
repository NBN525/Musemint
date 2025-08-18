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
