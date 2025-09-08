// app/api/health/sheets/route.ts
import { NextResponse } from "next/server";
import { sheetsHealth } from "@/lib/sheets";

export const runtime = "edge";

export async function GET() {
  const h = await sheetsHealth();
  return NextResponse.json({ ok: true, ...h });
}
