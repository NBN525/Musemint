// app/api/debug/sheets/route.ts
import { NextResponse } from "next/server";
export const runtime = "edge";

async function post(url: string, payload: any) {
  if (!url) return { url, ok: false, skipped: true };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  return { url, status: res.status, body: body.slice(0, 300) };
}

export async function GET() {
  const now = new Date().toISOString();
  const mm = await post(process.env.SHEETS_MUSEMINT_URL || "", {
    source: "manual-debug", amount: 0, message: "Hello from /api/debug/sheets", timestamp_app: now,
  });
  const rst = await post(process.env.SHEETS_RST_URL || "", {
    source: "manual-debug", amount: 0, message: "Hello from /api/debug/sheets", timestamp_app: now,
  });
  return NextResponse.json({ ok: true, results: { musemint: mm, rst } }, { status: 200 });
}
