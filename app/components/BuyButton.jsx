"use client";
import { useState } from "react";

export default function BuyButton({ label = "Buy Now" }) {
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else {
        alert(data?.error || "Unable to start checkout");
        setLoading(false);
      }
    } catch (e) {
      alert("Network error starting checkout");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-brand-yellow/90 hover:bg-brand-yellow text-black font-medium transition disabled:opacity-60"
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}
