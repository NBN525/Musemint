import { NextRequest, NextResponse } from "next/server";

const COOKIE = "rst_admin";
const maxAge = 60 * 60 * 8; // 8h

export async function GET() {
  // If cookie present, allow immediately
  return new NextResponse(null, {
    status: 204,
    headers: { "Set-Cookie": "" },
  });
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const required = process.env.ADMIN_PASSWORD || "";

  if (!required) {
    // No password configured → allow by default
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  if (password !== required) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(COOKIE, "1", { httpOnly: true, maxAge, sameSite: "lax", path: "/" });
  return res;
}
