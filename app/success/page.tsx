// app/success/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SuccessPage() {
  useEffect(() => {
    // GA4 event if gtag present
    // value/currency are optional; include if you pass them via querystring
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "purchase", {
        value: typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("v") || 0) : 0,
        currency: "CAD"
      });
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Payment received 🎉</h1>
        <p className="text-sm text-white/80">
          Thanks for supporting MuseMint. Your receipt has been sent by email.
          If you don’t see it, check spam or <Link className="underline" href="/support">contact us</Link>.
        </p>

        <div className="mt-4 text-xs text-white/60">
          Refunds: If something went wrong, we’ll make it right—just open a ticket on the Support page.
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-brand-yellow/90 hover:bg-brand-yellow text-black font-medium">
            Go to Dashboard
          </Link>
          <Link href="/" className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40">Home</Link>
        </div>
      </div>
    </main>
  );
}
