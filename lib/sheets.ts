// lib/sheets.ts

type SalesPayload = {
  event_type: string;
  email?: string;
  name?: string;
  amount_total?: number;
  currency?: string;
  payment_status?: string;
  mode?: string;
  session_id?: string;
  customer_id?: string;
  notes?: string;
  [key: string]: any;
};

async function postJson(url: string, payload: any) {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // We await so failures are visible in logs
    });
  } catch (e) {
    console.error("POST to sheet failed:", e);
  }
}

/** Generic append (old pipeline can keep using this if needed) */
export async function appendToSheet(args: { table?: string; row: Record<string, any> }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  await postJson(url || "", { table: args.table || "Default", ...args.row });
}

/** New: dedicated sales log */
export async function appendToSales(row: SalesPayload) {
  const url = process.env.SHEETS_WEBHOOK_URL_SALES || "";
  await postJson(url, row);
}
