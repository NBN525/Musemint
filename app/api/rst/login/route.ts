// /app/api/rst/login/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/rst/login
 * Body: { password: string }
 * If password matches process.env.RST_DASHBOARD_PASSWORD, sets cookie `rst_admin=1`
 */
export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({} as any));
    const expected = process.env.RST_DASHBOARD_PASSWORD?.trim();

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "Server not configured: RST_DASHBOARD_PASSWORD is missing." },
        { status: 500 }
      );
    }

    if (!password || password !== expected) {
      // short, generic error (don’t leak policy)
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    // Create secure admin cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: "rst_admin",
      value: "1",
      httpOnly: true,
      secure: true,           // always true on Vercel (HTTPS)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,    // 8 hours
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
