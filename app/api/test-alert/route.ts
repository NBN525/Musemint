// app/api/test-alert/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const SID = process.env.TWILIO_ACCOUNT_SID!;
    const KEY = process.env.TWILIO_API_KEY_SID!;
    const SECRET = process.env.TWILIO_API_KEY_SECRET!;
    const FROM = process.env.TWILIO_FROM_NUMBER!;
    const TO = process.env.ALERT_SMS_TO!;
    const SHEET = process.env.SHEET_WEBHOOK_URL!;

    // Send SMS via Twilio REST API
    const smsRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: FROM,
          To: TO,
          Body: "MuseMint test: webhook + SMS OK ✅",
        }),
      }
    );
    const sms = await smsRes.json();

    // Log to Google Sheet (Apps Script Web App)
    await fetch(SHEET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "vercel-test",
        type: "test",
        messageSid: sms?.sid ?? null,
        ts: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ ok: true, sid: sms?.sid ?? null });
  } catch (err: any) {
    return new NextResponse(err?.message || "Test failed", { status: 500 });
  }
}
