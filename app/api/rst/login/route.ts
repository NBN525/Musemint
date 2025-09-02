// app/api/rst/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pass = (form.get("password") || "") as string;
  const expected = process.env.RST_ADMIN_PASSWORD || "";

  if (!expected) {
    return NextResponse.json({ error: "Password not configured" }, { status: 500 });
  }

  if (pass !== expected) {
    // Back to /rst/login with error flag
    return NextResponse.redirect(new URL("/rst/login?error=1", req.url));
  }

  // Set an httpOnly auth cookie for 7 days
  const res = NextResponse.redirect(new URL("/rst/dashboard", req.url));
  res.cookies.set({
    name: "rst_auth",
    value: "ok",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
