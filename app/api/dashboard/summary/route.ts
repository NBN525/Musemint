import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Placeholder data so the UI renders immediately.
  const data = {
    revenue7d: 0,
    orders7d: 0,
    leads7d: 0,
    burnMonthly: 80, // e.g., domain, GPT+, Twilio preload, etc.
    runwayDays: 120,
    breakEvenETA: "TBD (awaiting first product launch)",
    notes: [
      "Stripe live & webhook tested.",
      "Twilio voice flow online; voicemail improved.",
      "Planner polishing → premium assets in progress.",
    ],
  };
  return NextResponse.json({ ok: true, data }, { status: 200 });
}
