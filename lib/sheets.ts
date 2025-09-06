// lib/sheets.ts
/**
 * Posts sale events to your Google Apps Script webhooks (MuseMint + RST Global).
 * Uses robust retry + clear payload for easy sheet appending.
 */

type SaleLog = {
  time: string;              // ISO timestamp
  source: string;            // "stripe"
  mode: "live" | "test";
  email: string;
  name?: string | null;
  product: string;
  amount?: number;           // cents
  currency?: string;
  sessionId?: string;
  receiptUrl?: string | null;
};

const MUSEMINT_URL = process.env.SHEETS_MUSEMINT_URL || process.env.SHEETS_WEBHOOK_URL; // keep backward compat
const RST_URL = process.env.SHEETS_RST_URL || process.env.SHEETS_WEBHOOK_URL_RST;

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Most Apps Script webapps accept JSON; if yours expects form-encoded, we can switch.
    body: JSON.stringify(body),
    // Avoid long hangs
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sheets POST ${url} failed: ${res.status} ${text}`);
  }
  return res;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 600) {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

/** Log to MuseMint Sales Log (if URL set) */
export async function logMuseMintSale(entry:
