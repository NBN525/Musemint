// Minimal Twilio voice webhook that always returns valid TwiML
export async function POST() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thanks for calling R S T Global. This line is online.</Say>
  <Pause length="1"/>
  <Say voice="alice">You can leave a short message after the tone. Goodbye.</Say>
  <Hangup/>
</Response>`;
  return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
}

// Allow GET so you can test in a browser too
export async function GET() {
  return POST();
}
