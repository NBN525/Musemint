// lib/sheets.ts
type SalesPayload = {
  event_type: string;
  email?: string;
  name?: string;
  amount_total: number;
  currency: string;
  payment_status?: string;
  session_id?: string;
  customer_id?: string;
  mode?: string;
  notes?: string;
  [key: string]: any;
};

async function postJson(url: string | undefined, payload: any, label: string) {
  if (!url) {
    console.warn(`Sheets POST skipped: ${label} URL not set`);
    return { ok: false as const, reason: "missing-url" as const };
  }
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // await so failures are visible in Vercel logs
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      console.error(`Sheets POST failed (${label}):`, r.status, t);
      return { ok: false as const, reason: "http-failed" as const };
    }
    return { ok: true as const };
  } catch (e) {
    console.error(`Sheets POST error (${label}):`, e);
    return { ok: false as const, reason: "fetch-error" as const };
  }
}

/** Legacy/RST log */
export async function appendToSheet(args: { table?: string; row: Record<string, any> }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  const payload = { table: args.table || "Default", ...args.row };
  return postJson(url, payload, "RST");
}

/** MuseMint Sales Log (richer schema) */
export async function appendToSales(row: SalesPayload) {
  const url = process.env.SHEETS_WEBHOOK_URL_SALES;
  return postJson(url, row, "Sales");
}
