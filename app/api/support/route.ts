// app/api/support/route.ts
import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/sheets";
import { sendSupportEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, topic, message, _hp } = body || {};

    // Honeypot (basic bot filter)
    if (_hp) return NextResponse.json({ ok: true });

    if (!email || !message) {
      return NextResponse.json({ error: "Missing email or message" }, { status: 400 });
    }

    await sendSupportEmail({ name, email, topic, message });
    await appendToSheet({
      table: "SupportLog",
      row: {
        source: "support",
        ts: new Date().toISOString(),
        name: name || "",
        email,
        topic: topic || "",
        message,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Support API error:", e);
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
