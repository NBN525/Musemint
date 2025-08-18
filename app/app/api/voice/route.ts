import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  const form = await req.formData();             // Twilio sends x-www-form-urlencoded
  const digits = (form.get("Digits") as string) || "";
  const vr = new VoiceResponse();

  if (!digits) {
    // Main menu
    const gather = vr.gather({
      numDigits: 1,
      action: "/api/voice",  // posts back to this same route with Digits
      method: "POST",
      timeout: 5
    });
    gather.say(
      { voice: "Polly.Matthew", language: "en-CA" },
      "Welcome to R S T Global. Press 1 for Sales. Press 2 for Support."
    );
    vr.say(
      { voice: "Polly.Matthew", language: "en-CA" },
      "I didn't receive any input."
    );
    vr.redirect("/api/voice");
    return new NextResponse(vr.toString(), { headers: { "Content-Type": "text/xml" } });
  }

  // For now, both 1 and 2 go to voicemail
  if (digits === "1" || digits === "2") {
    const dept = digits === "1" ? "Sales" : "Support";
    vr.say(
      { voice: "Polly.Matthew", language: "en-CA" },
      `You reached ${dept}. Please leave your name, number, and a brief message after the tone. Press the pound key when finished.`
    );
    vr.record({
      playBeep: true,
      finishOnKey: "#",
      transcribe: false,               // set true to enable Twilio transcription (extra cost)
      maxLength: 120,
      action: "/api/voice/voicemail",  // Twilio will POST recording info here
      method: "POST"
    });
    vr.say("We did not receive a recording. Goodbye.");
    vr.hangup();
    return new NextResponse(vr.toString(), { headers: { "Content-Type": "text/xml" } });
  }

  // Fallback for unexpected input
  vr.say("Sorry, that was not a valid choice.");
  vr.redirect("/api/voice");
  return new NextResponse(vr.toString(), { headers: { "Content-Type": "text/xml" } });
}
