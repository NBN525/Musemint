// app/checkout/page.tsx
"use client";
import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else alert("Could not start checkout.");
    } catch (e: any) {
      alert(e?.message ?? "Error starting checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Buy the MuseMint Planner</h1>
        <p className="opacity-70">One-time purchase. Instant access.</p>
        <button
          onClick={go}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Checkout"}
        </button>
      </div>
    </main>
  );
}
