// app/api/lead/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "MuseMint <hello@rstglobal.ca>";
const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL || "";
const OWNER_NOTIFY_EMAIL = process.env.OWNER_NOTIFY_EMAIL || ""; // optional

type LeadBody = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
  source?: string;      // e.g. "hero_form", "checkout", etc.
  hp_field?: string;    // honeypot (must be empty)
};

async function postToSheet(payload: Record<string, unknown>) {
  if (!SHEET_WEBHOOK_URL) return;
  try {
    await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // swallow; we still want to return 200 to the client
    console.error("Sheet webhook error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadBody;

    // Basic validation + spam guard
    if (body.hp_field) {
      return NextResponse.json({ success: true }); // silent drop
    }
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required." },
        { status: 400 }
      );
    }

    // 1) Log to Google Sheet
    await postToSheet({
      ts: new Date().toISOString(),
      name,
      email,
      company: body.company || "",
      phone: body.phone || "",
      message: body.message || "",
      source: body.source || "unknown",
      ua: req.headers.get("user-agent") || "",
      ip: req.headers.get("x-forwarded-for") || req.ip || "",
    });

    // 2) Send confirmation to the lead
    const { error: sendErr } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're in — MuseMint AI Planner",
      text:
        `Hi${name ? " " + name : ""},\n\n` +
        `Thanks for your interest in MuseMint. We’ve logged your request and will follow up shortly.\n\n` +
        `— MuseMint Team`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
          <p>Hi${name ? " " + name : ""},</p>
          <p>Thanks for your interest in <b>MuseMint</b>. We’ve received your request and will follow up shortly.</p>
          <p style="margin-top:16px">— The MuseMint Team</p>
        </div>
      `,
    });

    // 3) Optional: notify you
    if (OWNER_NOTIFY_EMAIL) {
      await resend.emails.send({
        from: FROM,
        to: OWNER_NOTIFY_EMAIL,
        subject: "New Lead — MuseMint",
        text:
          `Name: ${name}\nEmail: ${email}\nCompany: ${body.company || ""}\n` +
          `Phone: ${body.phone || ""}\nSource: ${body.source || "unknown"}\n\n` +
          `Message:\n${body.message || "-"}`,
      });
    }

    if (sendErr) {
      // Email failed but we still logged the lead
      return NextResponse.json(
        { success: true, warning: "lead logged but email failed", detail: sendErr },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/lead" });
}
