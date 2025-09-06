// app/(store)/checkout/page.tsx
"use client";

import { useState } from "react";
import { PRODUCT_NAME, PRODUCT_PRICE, PRODUCT_CURRENCY } from "@/lib/config";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const displayPrice = `${PRODUCT_CURRENCY} ${Number(PRODUCT_PRICE).toFixed(2)}`;

  const startCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      const json = await res.json();
      if (!res.ok || !json?.url) throw new Error(json?.error || "Failed to create session");
      window.location.href = json.url;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">{PRODUCT_NAME}</h1>
        <p className="text-zinc-400">One-time purchase</p>
        <div className="text-3xl font-bold">{displayPrice}</div>

        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full rounded-lg bg-yellow-400 text-black py-3 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Buy Now"}
        </button>

        <p className="text-xs text-zinc-500">
          Secure checkout via Stripe. You’ll receive an email receipt and instant confirmation page.
        </p>
      </div>
    </main>
  );
}
