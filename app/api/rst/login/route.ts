// app/api/rst/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({ password: "" }));
    const adminPass = process.env.RST_ADMIN_PASSWORD?.trim() || "";

    if (!adminPass) {
      return NextResponse.json(
        { error: "Server misconfigured: RST_ADMIN_PASSWORD is not set." },
        { status: 500 }
      );
    }

    const ok = typeof password === "string" && password === adminPass;
    if (!ok) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set a simple session cookie (1 day). You can harden later with JWT if you like.
    cookies().set({
      name: "rst_admin",
      value: "ok",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RST login error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
