// app/robots.txt/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const body = [
    "User-agent: *",
    "Disallow: /rst/",
    "Disallow: /api/rst/",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
