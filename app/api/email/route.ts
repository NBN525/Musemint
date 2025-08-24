import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, html, meta } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: "MuseMint <noreply@rstglobal.ca>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    // (Optional) also log to your Sheet webhook if present
    const sheetUrl = process.env.SHEET_WEBHOOK_URL || "";
    if (sheetUrl) {
      fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ts: new Date().toISOString(),
          kind: "email",
          to,
          subject,
          ...meta,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Email error" },
      { status: 500 }
    );
  }
}
