import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const TO = "hello@rstglobal.ca";             // primary
const CC = process.env.CONTACT_CC || "";      // optional (e.g., your Hotmail)

export async function POST(req: Request) {
  try {
    const { name = "", email = "", message = "" } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Missing email or message" }, { status: 400 });
    }

    const subject = `New contact — ${name || "No name"} (${email})`;
    const html = `
      <div style="font-family:Inter,system-ui,Arial,sans-serif;">
        <h2 style="margin:0 0 12px;">New Website Contact</h2>
        <p><b>Name:</b> ${name || "—"}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px">${message}</pre>
      </div>
    `;

    await resend.emails.send({
      from: "MuseMint <hello@rstglobal.ca>",
      to: [TO],
      cc: CC ? [CC] : undefined,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "send failed" }, { status: 500 });
  }
}
