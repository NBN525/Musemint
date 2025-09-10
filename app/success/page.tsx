"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PRODUCT_NAME =
  process.env.NEXT_PUBLIC_PRODUCT_NAME || "Startup Planner Pro";
const DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL || "";
const CURRENCY =
  process.env.NEXT_PUBLIC_PRODUCT_CURRENCY || "USD";

export default function SuccessPage() {
  const q = useSearchParams();

  // Optional details coming from Stripe's success_url (if you add them)
  const sessionId = q.get("session_id") || "";
  const email = q.get("email") || "";
  const amount = q.get("amount") || "";
  const status = q.get("status") || "paid";
  const currency = (q.get("currency") || CURRENCY).toUpperCase();

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-semibold tracking-tight">{PRODUCT_NAME}</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/15 hover:bg-white/5 transition"
          >
            Back to site
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Congrats / Download */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0f14] p-6">
            <div className="text-sm uppercase tracking-widest text-white/50">
              Order confirmed
            </div>
            <h1 className="mt-2 text-3xl font-semibold">
              Thanks for your purchase! 🎉
            </h1>
            <p className="mt-2 text-white/70">
              You now have access to <b>{PRODUCT_NAME}</b>. We’ve also emailed a
              copy of your receipt and setup instructions.
            </p>

            {DOWNLOAD_URL ? (
              <a
                href={DOWNLOAD_URL}
                className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
              >
                Download your product
              </a>
            ) : (
              <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-100 p-4">
                <div className="font-medium">Download link not set</div>
                <div className="text-sm text-yellow-200/80 mt-1">
                  Set <code className="px-1 bg-black/40 rounded">NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL</code>{" "}
                  in Vercel to show a download button here.
                </div>
              </div>
            )}

            <p className="mt-6 text-sm text-white/60">
              Need help? Reply to your receipt email or contact{" "}
              <a className="underline" href="mailto:support@rstglobal.ca">
                support@rstglobal.ca
              </a>
              .
            </p>
          </div>

          {/* Right: Receipt card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">
              Receipt
            </div>

            <div className="mt-4 space-y-3 text-white/85">
              <Row label="Product" value={PRODUCT_NAME} />
              <Row
                label="Amount"
                value={
                  amount
                    ? `${currency} ${Number(amount).toFixed(2)}`
                    : `${currency}`
                }
              />
              <Row label="Status" value={status} />
              <Row label="Customer" value={email || "—"} />
              <Row label="Order (session)" value={sessionId || "—"} />
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-white/15 hover:bg-white/5 transition"
              >
                Return to home
              </Link>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm uppercase tracking-widest text-white/60">
            Getting started
          </div>
          <ul className="mt-3 list-disc pl-5 text-white/80 space-y-2">
            <li>
              Open the included setup guide and complete the 5-minute steps.
            </li>
            <li>
              Optional: add your payment link & digest email to enable
              automations.
            </li>
            <li>
              Your dashboard tiles will update automatically after each sale.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
      <div className="text-white/60">{label}</div>
      <div className="font-medium text-right break-all">{value}</div>
    </div>
  );
              }
