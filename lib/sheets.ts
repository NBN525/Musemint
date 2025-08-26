// lib/sheets.ts
// Sends a lightweight sale/log payload to your Google Apps Script (or any webhook).
// Requires env var: SHEETS_WEBHOOK_URL

type LogPayload = {
  event: string;
  mode: "test" | "live";
  sessionId?: string | null;
  customerEmail?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  product?: string | null;
  purchasedAt?: string;
};

export async function logSaleToSheets(payload: LogPayload) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return; // no-op if you haven’t configured the webhook yet

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Don’t let logging failures crash your webhook
    console.error("Sheets log failed:", (err as Error)?.message || err);
  }
}
