// app/(store)/checkout/page.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/session", { method: "POST" });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
        return;
      }
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");
      await stripe.redirectToCheckout({ sessionId: data.id as string });
    } catch (e) {
      alert("Unable to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">MuseMint Supporter Pass</h1>
        <p className="text-white/75 mb-6">$1 one-time contribution</p>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-emerald-400 text-black font-medium hover:bg-emerald-300 disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Buy Now"}
        </button>
      </div>
    </main>
  );
}
