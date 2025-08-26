// lib/sheets.ts
export async function appendToSheet(args: {
  table?: string;
  row: Record<string, any>;
}) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;

  const payload = {
    table: args.table || "Default",
    ...args.row,
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Don’t block the webhook on slow sheet calls
      // (Vercel Node runtime keeps it simple; we still await so we can catch errors)
    });
  } catch (e) {
    console.error("Sheet append failed:", e);
  }
}
