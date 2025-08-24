// app/api/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "edge";        // fast + cheap
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

// ❗ If you ever want to override this, set RESEND_FROM in Vercel env vars.
const DEFAULT_FROM = process.env.RESEND_FROM || 'MuseMint <hello@rstglobal.ca>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const to = body.to as string | string[] | undefined;
    const subject = (body.subject as string) || "MuseMint";
    const html = (body.html as string) || "<p>Hello from MuseMint!</p>";
    const text =
      (body.text as string) ||
      html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]*>/g, "")
        .trim();

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Missing 'to' (string or string[])." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text,         // ← include plain text for deliverability
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check so you can hit the route in a browser
  return NextResponse.json({ ok: true, route: "/api/email" });
}
