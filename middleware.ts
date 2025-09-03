// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gate everything under /rst except the login page itself
  if (pathname.startsWith("/rst") && pathname !== "/rst/login") {
    const cookie = req.cookies.get("rst_admin")?.value;
    if (cookie !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/rst/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Only run on /rst/*
export const config = { matcher: ["/rst/:path*"] };
