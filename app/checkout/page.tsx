"use client";
import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message || "Unexpected error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold mb-4">Purchase — Ultimate Weekly Planner</h1>
      <p className="text-white/80 mb-6">Secure checkout powered by Stripe.</p>

      <button
        onClick={startCheckout}
        disabled={loading}
        className="px-5 py-3 rounded-xl bg-brand-yellow text-black font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Buy Now"}
      </button>

      {err && <p className="text-red-400 mt-4">{err}</p>}
    </main>
  );
}
