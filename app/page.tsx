// app/page.tsx
// Server component, static-safe & no fancy Intl formatting.
// If you use a Stripe Payment Link, set NEXT_PUBLIC_BUY_URL in Vercel.

import Link from "next/link";

export const dynamic = "force-static";

function readEnv() {
  const currency = (process.env.NEXT_PUBLIC_PRODUCT_CURRENCY || "USD").toUpperCase();
  const listPrice = Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE || "99");
  const launchPrice = Number(process.env.NEXT_PUBLIC_PRODUCT_LAUNCH_PRICE || "49");
  const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME || "Startup Business Planner (Pro)";
  const buyUrl = process.env.NEXT_PUBLIC_BUY_URL || ""; // optional Stripe Payment Link
  return { currency, listPrice, launchPrice, productName, buyUrl };
}

export default function Home() {
  const e = readEnv();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl text-center space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full grid place-items-center bg-[#0a0f12] border border-white/10">
            <span className="text-2xl">📈</span>
          </div>
          <h1 className="text-3xl font-semibold">MuseMint</h1>
          <p className="text-white/70">
            <b>{e.productName}</b> — premium startup planner suite with live dashboards,
            auto-logging, and launch-ready delivery.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
          <p className="text-white/80">
            <span className="mr-2 line-through opacity-60">
              {e.currency} {e.listPrice.toFixed(2)}
            </span>
            <span className="inline-flex items-center rounded-lg px-2 py-1 bg-yellow-400 text-black font-semibold">
              Launch {e.currency} {e.launchPrice.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {e.buyUrl ? (
            <a
              href={e.buyUrl}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
            >
              Buy Now
            </a>
          ) : (
            <Link
              href="/success"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
            >
              Preview Success Page
            </Link>
          )}

          <a
            href="/rst/login"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-white/15 hover:bg-white/5 transition"
          >
            Open Dashboard
          </a>
        </div>

        <p className="text-xs text-white/50">
          Tip: set <code className="px-1 rounded bg-white/10">NEXT_PUBLIC_BUY_URL</code> to your Stripe Payment Link to enable the Buy button.
        </p>
      </div>
    </main>
  );
}
