import { NextResponse, NextRequest } from "next/server";

export const config = {
  matcher: ["/rst/:path*"], // protect everything under /rst/*
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow the login route itself
  if (pathname.startsWith("/rst/login")) return NextResponse.next();

  const cookie = req.cookies.get("rst_auth")?.value;
  if (cookie === "ok") return NextResponse.next();

  // no cookie → bounce to login with returnTo
  const url = req.nextUrl.clone();
  url.pathname = "/rst/login";
  url.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(url);
}
