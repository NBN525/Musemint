// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /rst/dashboard
  if (pathname.startsWith("/rst/dashboard")) {
    const isAdmin = req.cookies.get("rst_admin")?.value === "1";
    if (!isAdmin) {
      const loginUrl = new URL("/rst/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rst/:path*"], // Apply middleware to /rst routes
};
