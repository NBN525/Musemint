// app/api/health/backup/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const ok = !!process.env.BLOB_READ_WRITE_TOKEN && !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
  return NextResponse.json({ ok, blob: !!process.env.BLOB_READ_WRITE_TOKEN, resend: !!process.env.RESEND_API_KEY });
}
