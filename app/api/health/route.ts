// app/api/health/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const key = process.env.RESEND_API_KEY || "";
    const from = process.env.RESEND_FROM || "MuseMint Receipts <hello@rstglobal.ca>";
    const to = (new URL(req.url).searchParams.get("to") ||
      process.env.RESEND_TO ||
      "").trim();

    if (!key || !from || !to) {
      return NextResponse.json(
        { ok: false, missing: { hasKey: !!key, from: !!from, to: !!to } },
        { status: 400 }
      );
    }

    const resend = new Resend(key);
    const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
      <h3>Resend health check</h3>
      <p>If you see this in your inbox, mail delivery is working.</p>
    </div>`;

    const resp = await resend.emails.send({
      from,
      to,
      subject: "Resend health check",
      html,
      text: "Resend health check",
      reply_to: "support@rstglobal.ca",
    });

    return NextResponse.json({ ok: true, id: (resp as any)?.id || null }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "send failed" }, { status: 500 });
  }
}
