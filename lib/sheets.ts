// lib/sheets.ts
type SalesPayload = {
  event_type: string;
  email?: string;
  name?: string;
  amount_total?: number;
  currency?: string;
  payment_status?: string;
  session_id?: string;
  customer_id?: string;
  mode?: string;
  notes?: string;
  [k: string]: any;
};

async function postJson(url: string, payload: any) {
  if (!url) {
    console.warn("RST sheet not ok:", { ok: false, reason: "missing-url" });
    return;
  }
  // tiny retry: 250ms, 750ms
  const delays = [0, 250, 750];
  let lastErr: unknown = null;

  for (const d of delays) {
    if (d) await new Promise(r => setTimeout(r, d));
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return;
    } catch (e) {
      lastErr = e;
      console.error("POST to sheet failed (try)", e);
    }
  }
  console.error("POST to sheet failed (final):", lastErr);
}

/** Old pipeline (generic append) */
export async function appendToSheet(args: { table?: string; row: Record<string, any> }) {
  const url = process.env.SHEETS_WEBHOOK_URL || "";
  await postJson(url || "", { table: args.table || "Default", ...args.row });
}

/** Dedicated sales log */
export async function appendToSales(row: SalesPayload) {
  const url = process.env.SHEETS_WEBHOOK_URL_SALES || "";
  await postJson(url || "", row);
}
