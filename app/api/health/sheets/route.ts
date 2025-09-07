// app/api/health/sheets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

function getJwt() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Support either GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_PRIVATE_KEY
  const rawKey =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !rawKey) {
    throw new Error("Missing Google service account env vars");
  }
  // Vercel envs often store \n as literals — fix them:
  const privateKey = rawKey.replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * Write a test row to any sheet by URL + tab.
 * Example:
 *  /api/health/sheets?url=<encodedSheetURL>&tab=Sales
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const tab = searchParams.get("tab") || "Sheet1";

    if (!url) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing ?url=. Paste your Google Sheet URL (the one you shared to the service account). Optional: &tab=Sales",
        },
        { status: 400 }
      );
    }

    // Extract spreadsheetId from URL
    const m = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!m) {
      return NextResponse.json(
        { ok: false, error: "Could not parse spreadsheetId from URL" },
        { status: 400 }
      );
    }
    const spreadsheetId = m[1];

    const auth = getJwt();
    const sheets = google.sheets({ version: "v4", auth });

    const now = new Date();
    const row = [
      now.toISOString(),
      "HEALTH-CHECK",
      "api/health/sheets",
      "OK",
      req.headers.get("x-vercel-ip-country") || "",
      req.headers.get("x-forwarded-for") || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return NextResponse.json({
      ok: true,
      spreadsheetId,
      tab,
      wrote: row,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
