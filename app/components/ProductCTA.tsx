"use client";

import { useState } from "react";

export default function ProductCTA() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleBuy() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // quantity is optional; defaults to 1 in your API
        body: JSON.stringify({ quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Checkout failed (${res.status})`);
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-semibold mb-2">
          MuseMint Premium Planner — <span className="text-brand-yellow">v1</span>
        </h3>
        <p className="text-sm md:text-base text-white/80 mb-4">
          A polished, battle-tested business planner suite that gives you{" "}
          <span className="font-medium">weekly execution discipline</span>,
          live revenue logging (Stripe), lead capture, and a clean dashboard.
          Lightweight, fast, and mobile-friendly.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/85 mb-6">
          <li className="rounded-xl bg-white/5 border border-white/10 p-3">
            ✅ Weekly/Monthly goals, KPI blocks, break-even tracker
          </li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-3">
            ✅ Stripe checkout + success/cancel flows wired
          </li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-3">
            ✅ Sales events → Google Sheets logs (auditable)
          </li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-3">
            ✅ Lead form → email via Resend (DKIM/SPF ready)
          </li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-3">
            ✅ Mobile-first UI; dark theme; blazing fast
          </li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-3">
            ✅ Lifetime updates for v1 branch
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-brand-yellow text-black font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Buy Now"}
          </button>
          <div className="text-xs text-white/70">
            Secure checkout via Stripe. Taxes may apply. Instant email receipt.
          </div>
        </div>

        {err && (
          <p className="mt-3 text-sm text-red-300">
            {err}
          </p>
        )}
      </div>

      <div className="text-xs text-white/50 mt-3">
        Need help? Email{" "}
        <a className="underline" href="mailto:hello@rstglobal.ca">
          hello@rstglobal.ca
        </a>.
      </div>
    </div>
  );
}
