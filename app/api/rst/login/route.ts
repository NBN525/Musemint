// app/api/rst/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password, next } = await req.json().catch(() => ({}));
  const ok = typeof password === "string" && password === process.env.RST_ADMIN_PASSWORD;

  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, next: next || "/rst/dashboard" });
  // Simple cookie to mark admin session; adjust attrs as you prefer
  res.cookies.set("rst_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
