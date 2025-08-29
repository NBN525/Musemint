import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER = process.env.ADMIN_USER || "";
const PASS = process.env.ADMIN_PASS || "";

/** Basic Auth for /dashboard (and /admin if you add it later) */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect these paths
  const protectedPaths = ["/dashboard", "/admin"];
  const needsAuth = protectedPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="RST Global"' },
    });
  }

  try {
    const [, b64] = auth.split(" ");
    const [user, pass] = atob(b64).split(":");
    if (user === USER && pass === PASS) return NextResponse.next();
  } catch {
    /* fallthrough to 401 below */
  }

  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="RST Global"' },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/admin/:path*", "/admin"],
};
