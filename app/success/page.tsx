// app/success/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic'; // prevent prerendering

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const downloadUrl = process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL || '';

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full grid place-items-center bg-green-600">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-3xl font-semibold">Payment Successful</h1>
          {sessionId ? (
            <p className="text-xs text-white/60">
              Order ID: <code>{sessionId}</code>
            </p>
          ) : null}
        </div>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
          >
            Download Your Product
          </a>
        ) : (
          <div className="rounded-xl px-6 py-3 bg-white/5 border border-white/10 text-white/70">
            Your product link will be emailed to you shortly. 🚀
          </div>
        )}

        <p className="text-xs text-white/50">
          A receipt and confirmation were sent to your email.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        Loading…
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
