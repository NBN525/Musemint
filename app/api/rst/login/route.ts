// app/api/rst/login/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const supplied =
    (body?.password ?? "") ||
    new URL(req.url).searchParams.get("password") ||
    req.headers.get("x-rst-password") ||
    "";

  const ok =
    !!process.env.RST_ADMIN_PASSWORD &&
    supplied === process.env.RST_ADMIN_PASSWORD;

  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("rst_admin", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
