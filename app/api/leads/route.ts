import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sheetUrl = process.env.SHEET_WEBHOOK_URL!;
    // Build the payload for the Apps Script router (goes to "Leads" tab)
    const payload = {
      tab: "Leads",
      timestamp: new Date().toISOString(),
      source: "LeadForm",
      type: "lead.created",
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      company: body.company || "",
      notes: body.notes || "",
    };

    await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // no-cors not needed on server
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("leads POST error", e?.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
