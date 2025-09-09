// app/api/vault/add/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VaultRow = {
  idea_id: string;
  title: string;
  notes?: string;
  tags?: string[];
  source?: string;
  timestamp_iso: string;
};

/** POST JSON to a Google Apps Script Web App URL */
async function postToSheet(url: string, payload: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, body: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, body: text };
  }
}

export async function POST(req: NextRequest) {
  try {
    const SHEETS_VAULT_URL = process.env.SHEETS_VAULT_URL || "";
    if (!SHEETS_VAULT_URL) {
      return NextResponse.json(
        { ok: false, error: "Missing SHEETS_VAULT_URL env" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const title = (body.title || "").toString().trim();
    const notes = (body.notes || "").toString();
    const tags: string[] = Array.isArray(body.tags) ? body.tags : [];
    const source = (body.source || "web").toString();

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "title is required" },
        { status: 400 }
      );
    }

    const row: VaultRow = {
      idea_id:
        "VAULT-" +
        new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14) +
        "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase(),
      title,
      notes,
      tags,
      source,
      timestamp_iso: new Date().toISOString(),
    };

    const resp = await postToSheet(SHEETS_VAULT_URL, { ...row, _kind: "vault" });
    return NextResponse.json(
      { ok: resp.ok, status: resp.status, result: resp.body },
      { status: resp.ok ? 200 : 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "vault error" },
      { status: 500 }
    );
  }
}
