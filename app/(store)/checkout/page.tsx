'use client';

import { useState, useCallback } from 'react';

export default function CheckoutPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    try {
      setBusy(true);
      setErr(null);

      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Failed to create session: ${t || res.status}`);
      }

      const { url } = await res.json();
      if (!url) throw new Error('Missing session URL');

      window.location.href = url; // ← simple redirect, no stripe-js needed
    } catch (e: any) {
      setBusy(false);
      setErr(e?.message ?? 'Checkout failed');
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-semibold">Support MuseMint</h1>
        <p className="opacity-80">Run the $1 live test to verify webhooks & emails.</p>

        <button
          onClick={handleCheckout}
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Redirecting…' : 'Buy now ($1)'}
        </button>

        {err && <p className="text-red-500 text-sm">{err}</p>}
      </div>
    </main>
  );
}
