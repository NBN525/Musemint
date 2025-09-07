// app/api/vault/add/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VaultPayload = {
  title: string;
  one_liner?: string;
  wedge?: string;
  v1?: string;
  pricing?: string;
  kpis?: string[] | string;
  risks?: string;
  ao_score?: number;
  exp_score?: number;
  category?: string;
  region?: string;
  status?: "New" | "Watching" | "Prototype" | "Live" | "Paused" | string;
  source?: string;        // chat/import/manual/agent etc.
  tags?: string[] | string;
  notes?: string;
  reassess_reason?: string;
  added_by?: string;
  idea_id?: string;       // optional; server will generate if absent
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const VAULT_URL = process.env.SHEETS_VAULT_URL;
    if (!VAULT_URL) {
      return NextResponse.json(
        { ok: false, error: "Missing SHEETS_VAULT_URL env var" },
        { status: 500, headers: corsHeaders() }
      );
    }

    let body: VaultPayload;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Minimal validation
    if (!body?.title || String(body.title).trim() === "") {
      return NextResponse.json(
        { ok: false, error: "Field 'title' is required" },
        { status: 422, headers: corsHeaders() }
      );
    }

    // Normalize arrays → strings for Apps Script convenience
    const normalized: Record<string, any> = {
      ...body,
      kpis: Array.isArray(body.kpis) ? body.kpis : body.kpis ?? "",
      tags: Array.isArray(body.tags) ? body.tags : body.tags ?? "",
      status: body.status ?? "New",
      source: body.source ?? "api",
      added_by: body.added_by ?? "rst-app",
    };

    // Forward to the Apps Script Web App (Vault)
    const upstream = await fetch(VAULT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
      // Apps Script likes a simple POST; keep it straightforward
    });

    // Try to pass-through JSON result for transparency
    const text = await upstream.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { ok: upstream.ok, status: upstream.status, raw: text };
    }

    // Bubble up status code if possible
    return NextResponse.json(json, {
      status: upstream.status,
      headers: corsHeaders(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
  }
