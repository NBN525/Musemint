// app/api/health/sheets/route.ts
import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET() {
  const env_present = {
    musemint: !!process.env.SHEETS_MUSEMINT_URL,
    rst: !!process.env.SHEETS_RST_URL,
  };
  return NextResponse.json({ ok: true, env_present }, { status: 200 });
}
