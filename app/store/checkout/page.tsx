// app/store/checkout/page.tsx
"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create session");
      if (json?.url) window.location.href = json.url;
      else throw new Error("No checkout URL returned");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Buy Supporter Pass</h1>
        <p className="text-sm opacity-80">
          One-time purchase to support MuseMint and unlock future perks.
        </p>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full rounded-md bg-yellow-400 text-black font-semibold py-3 disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Proceed to Stripe Checkout"}
        </button>
        {err && <p className="text-red-400 text-sm">{err}</p>}
      </div>
    </main>
  );
}
