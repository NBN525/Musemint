// app/api/debug/sheets/route.ts
import { NextRequest, NextResponse } from "next/server";

type PingResult = {
  url?: string;
  status?: number;
  body?: string;
  error?: string;
};

async function ping(url: string | undefined, payload: any): Promise<PingResult> {
  if (!url) return { error: "missing URL" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Apps Script wants the raw JSON body
      body: JSON.stringify(payload),
    });
    const text = await res.text(); // capture raw body (may not always be JSON)
    return { url, status: res.status, body: text };
  } catch (e: any) {
    return { url, error: e?.message || "fetch failed" };
  }
}

export async function GET() {
  const payload = {
    source: "manual-debug",
    amount: 0,
    message: "Hello from /api/debug/sheets",
    timestamp_app: new Date().toISOString(),
  };

  const musemint = await ping(process.env.SHEETS_MUSEMINT_URL, payload);
  const rst      = await ping(process.env.SHEETS_RST_URL, payload);
  const vault    = await ping(process.env.SHEETS_VAULT_URL, {
    type: "idea-debug",
    title: "Debug ping",
    score_ao: 10,
    score_exp: 10,
    timestamp_app: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    env_present: {
      musemint: !!process.env.SHEETS_MUSEMINT_URL,
      rst: !!process.env.SHEETS_RST_URL,
      vault: !!process.env.SHEETS_VAULT_URL,
    },
    results: { musemint, rst, vault },
  });
}

// Optional: allow POST with custom payload
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const musemint = await ping(process.env.SHEETS_MUSEMINT_URL, body);
  const rst      = await ping(process.env.SHEETS_RST_URL, body);
  const vault    = await ping(process.env.SHEETS_VAULT_URL, body);
  return NextResponse.json({ ok: true, sent: body, results: { musemint, rst, vault } });
}
