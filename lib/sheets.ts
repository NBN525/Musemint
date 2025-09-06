// lib/sheets.ts
/**
 * Thin wrappers for posting JSON rows into your Google Apps Script webhooks.
 * These exports match legacy names used elsewhere in the repo.
 */

export type SalesPayload = {
  event_type: string;
  email?: string;
  name?: string;
  amount_total?: number;
  currency?: string;
  payment_status?: string;
  session_id?: string;
  customer_id?: string;
  notes?: string;
  [key: string]: any;
};

async function postJson(url: string | undefined, payload: any) {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("POST to sheet failed:", e);
  }
}

/**
 * Legacy generic appender. Many old callers expect:
 *   appendToSheet({ table: "Some Tab", row: { ... } })
 */
export async function appendToSheet(args: { table?: string; row: Record<string, any> }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  await postJson(url, { table: args.table || "Default", ...args.row });
}

/**
 * Legacy “sales” convenience. Old code calls appendToSales(row)
 * and expects it to hit the same webhook.
 */
export async function appendToSales(row: SalesPayload) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  await postJson(url, row);
}
