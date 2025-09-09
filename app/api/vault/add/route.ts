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

async function postToSheet(url: string, payload: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // Don’t cache; we want fresh writes
    cache: "no-store",
  });
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { /* keep text */ }
  return { ok: res.ok, status: res.status, body: json || text };
}

export async function POST(req: NextRequest) {
  try {
    const SHEETS_VA
