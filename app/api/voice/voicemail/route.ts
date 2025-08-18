import { NextResponse } from "next/server";

const twiml = (xml: string) =>
  new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });

export const GET = () => POST(); // allow GET for quick checks

export function POST() {
  const voice = "Polly.Joanna-Neural"; // more natural
  const fallbackVoice = "alice";

  const xml = `
    <Response>
      <Say voice="${voice}">
        Please leave your message after the tone. When you are finished, press the pound key.
      </Say>
      <Say voice="${fallbackVoice}"></Say>
      <Record
        maxLength="120"
        playBeep="true"
        finishOnKey="#"
        action="/api/voice/handle"
        method="POST"
        trim="trim-silence" />
      <Say voice="${voice}">We did not receive a message. Goodbye.</Say>
      <Hangup/>
    </Response>
  `.trim();

  return twiml(xml);
}
