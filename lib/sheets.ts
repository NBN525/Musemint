// lib/sheets.ts
export type Json = Record<string, unknown>;

export async function logSaleToSheets({
  sheetUrl,
  payload,
}: {
  sheetUrl: string;
  payload: Json;
}) {
  if (!sheetUrl) return; // silently skip if not configured
  await fetch(sheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}
