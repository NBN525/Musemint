// lib/sheets.ts
export type Json = Record<string, unknown>;

/** Collect all possible sheet webhook env vars, de-duped */
export function getSheetWebhookTargets(): string[] {
  const candidates = [
    process.env.SHEET_WEBHOOK_URL_MUSEMINT,
    process.env.SHEET_WEBHOOK_URL_RST,
    process.env.SHEET_WEBHOOK_URL,    // legacy
    process.env.SHEETS_WEBHOOK_URL,   // common typo/alt
    process.env.SHEET_WEBHOOK,        // safety net
  ];
  const uniq = new Set<string>();
  for (const c of candidates) {
    if (c && typeof c === "string" && c.startsWith("http")) uniq.add(c.trim());
  }
  return Array.from(uniq);
}

/**
 * Post JSON payload to all targets (non-blocking between them).
 * Any failure is swallowed (Promise.allSettled), so Stripe isn’t affected.
 */
export async function postToSheets(targets: string[], payload: Json) {
  if (!targets || targets.length === 0) return;

  await Promise.allSettled(
    targets.map((u) =>
      fetch(u, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify(payload),
      })
    )
  );
}
