// lib/sheets.ts
/**
 * Google Sheets (Apps Script) webhook helpers.
 * No service accounts, no JSON keys. We only POST to your
 * deployed Apps Script Web App URLs:
 *   - SHEETS_MUSEMINT_URL
 *   - SHEETS_RST_URL
 *   - SHEETS_VAULT_URL (optional)
 */

type SaleEntry = {
  source: "musemint" | "rst" | string;
  session_id?: string;
  mode?: "LIVE" | "TEST";
  amount?: number;
  currency?: string;
  customer_email?: string | null;
  customer_name?: string | null;
  product?: string | null;
  price_id?: string | null;
  meta?: Record<string, any>;
  when_iso?: string; // ISO timestamp
};

type VaultRow = {
  idea_id?: string;
  title: string;
  category?: string;
  region?: string;
  notes?: string;
  score_roi?: number;
  score_scale?: number;
  score_reg?: number;
  status?: string; // backlog | planned | building | live
  tags?: string[];
  added_by?: string;
  when_iso?: string;
};

const MUS_URL = process.env.SHEETS_MUSEMINT_URL;
const RST_URL = process.env.SHEETS_RST_URL;
const VAULT_URL = process.env.SHEETS_VAULT_URL;

/** generic poster with small retry */
async function postJSON(url: string, payload: unknown) {
  const body = JSON.stringify(payload);
  let lastErr: any;
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        // Apps Script prefers no-cache here
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`POST ${url} -> ${res.status} ${txt}`);
      }
      return await res.json().catch(() => ({}));
    } catch (err) {
      lastErr = err;
      // brief backoff
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw lastErr;
}

/** Compose a clean sale entry with defaults */
function normalizeSale(input: Partial<SaleEntry>): SaleEntry {
  return {
    source: input.source || "musemint",
    session_id: input.session_id,
    mode: input.mode || "LIVE",
    amount: typeof input.amount === "number" ? input.amount : 0,
    currency: input.currency || "CAD",
    customer_email: input.customer_email ?? null,
    customer_name: input.customer_name ?? null,
    product: input.product ?? null,
    price_id: input.price_id ?? null,
    meta: input.meta || {},
    when_iso: input.when_iso || new Date().toISOString(),
  };
}

/** Public: log a MuseMint sale (safe if URL missing) */
export async function logMuseMintSale(entry: Partial<SaleEntry>) {
  if (!MUS_URL) return; // quietly skip if not configured
  const payload = { kind: "sale", sheet: "musemint", entry: normalizeSale(entry) };
  await postJSON(MUS_URL, payload);
}

/** Public: log an RST Global sale (safe if URL missing) */
export async function logRstSale(entry: Partial<SaleEntry>) {
  if (!RST_URL) return;
  const payload = { kind: "sale", sheet: "rst", entry: normalizeSale(entry) };
  await postJSON(RST_URL, payload);
}

/** Back-compat aliases (if other files import these names) */
export async function appendToSheet(entry: Partial<SaleEntry>) {
  // default to MuseMint if only one logger is set
  if (MUS_URL) return logMuseMintSale(entry);
  if (RST_URL) return logRstSale(entry);
}
export async function appendToSheets(entry: Partial<SaleEntry>) {
  // log to both if both URLs exist
  await Promise.all([
    MUS_URL ? logMuseMintSale(entry) : Promise.resolve(),
    RST_URL ? logRstSale(entry) : Promise.resolve(),
  ]);
}

/** Vault upsert (optional) */
export async function upsertVaultRow(row: VaultRow) {
  if (!VAULT_URL) return;
  const payload = {
    kind: "vault_upsert",
    entry: {
      ...row,
      when_iso: row.when_iso || new Date().toISOString(),
      tags: row.tags || [],
    },
  };
  await postJSON(VAULT_URL, payload);
}

/** Health helper for /api/health/sheets */
export async function sheetsHealth() {
  return {
    musemint_url_present: Boolean(MUS_URL),
    rst_url_present: Boolean(RST_URL),
    vault_url_present: Boolean(VAULT_URL),
  };
}
