// /lib/sheets.ts

export async function appendToSheet(opts: {
  url?: string;
  table: string;
  row: Record<string, any>;
}) {
  if (!opts.url) return; // skip if not configured
  try {
    await fetch(opts.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: opts.table,
        row: opts.row,
      }),
    });
  } catch (err) {
    console.error("Sheets logging failed:", err);
  }
}
