import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = (form.get("password") || "").toString();
  const returnTo = (form.get("returnTo") || "/rst/dashboard").toString();

  const expected = process.env.DASHBOARD_PASSWORD || "";
  if (!expected) {
    return new NextResponse("Server misconfigured: DASHBOARD_PASSWORD missing", { status: 500 });
  }
  if (password !== expected) {
    return new NextResponse("Invalid password", { status: 401 });
  }

  const res = NextResponse.redirect(new URL(returnTo, req.url));
  res.cookies.set("rst_auth", "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/rst",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
