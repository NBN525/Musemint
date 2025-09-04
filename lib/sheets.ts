// lib/sheets.ts
export type Json = Record<string, unknown>;

/**
 * Post payload to one or more Google Apps Script webhooks.
 * - Silently skips if no URLs provided
 * - AllSettled so one failure doesn’t break others
 */
export async function postToSheets(
  urls: Array<string | undefined | null>,
  payload: Json
) {
  const targets = (urls || []).filter(Boolean) as string[];
  if (targets.length === 0) return;

  await Promise.allSettled(
    targets.map((u) =>
      fetch(u, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      })
    )
  );
}
