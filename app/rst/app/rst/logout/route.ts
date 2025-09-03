// app/rst/logout/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  // expire cookie immediately
  const res = NextResponse.redirect(new URL("/rst/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  res.headers.append(
    "Set-Cookie",
    [
      "rst_admin=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ")
  );
  return res;
}
