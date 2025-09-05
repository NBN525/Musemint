// app/api/notify/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * ENV required:
 *  - RESEND_API_KEY
 *  - RESEND_FROM     (e.g., "MuseMint <hello@rstglobal.ca>")
 * Optional:
 *  - SHEETS_WEBHOOK_URL_LEADS (Apps Script endpoint to log leads)
 *  - NOTIFY_FORWARD_TO         (comma-separated list to forward the signup)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // 1) Fire-and-forget: log lead to Google Sheet (if configured)
    const leadUrl = process.env.SHEETS_WEBHOOK_URL_LEADS;
    if (leadUrl) {
      // do not await; we don't want Sheets failures to block UX
      fetch(leadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "Leads",
          source: "musemint-site",
          email,
          name: name || "",
          ts: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    // 2) Send a quick “you’re on the list” + internal forward via Resend (if configured)
    const apiKey = process.env.RESEND_API_KEY || "";
    const from = process.env.RESEND_FROM || "";
    if (apiKey && from) {
      const toSelf =
        (process.env.NOTIFY_FORWARD_TO || "hello@rstglobal.ca")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const payload = {
        from,
        to: [email], // confirmation to subscriber
        subject: "You’re on the MuseMint list ✅",
        html: `
          <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif; line-height:1.6">
            <h2>Thanks for your interest${name ? `, ${escapeHtml(name)}` : ""}!</h2>
            <p>We’ll let you know when new tools drop.</p>
            <p style="color:#666">— RST Global / MuseMint</p>
          </div>
        `,
      };

      const selfPayload = {
        from,
        to: toSelf, // internal copy
        subject: "New MuseMint notify signup",
        html: `
          <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif; line-height:1.6">
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Name:</strong> ${escapeHtml(name || "")}</p>
            <p><strong>Source:</strong> musemint-site</p>
          </div>
        `,
      };

      // minimal Resend call without SDK to avoid bundling issues
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // send internal forward (ignore errors)
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selfPayload),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("notify error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to add to list" },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
