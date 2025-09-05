// app/success/page.tsx
import "server-only";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import Stripe from "stripe";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // show fresh status after redirect
export const metadata: Metadata = {
  title: "Payment received • MuseMint",
  robots: { index: false, follow: false }
};

function getStripe() {
  const key =
    process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

function money(amount: number | null | undefined, currency?: string) {
  if (amount == null) return "—";
  const c = currency || "usd";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: c.toUpperCase()
  }).format(amount / 100);
}

export default async function SuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id || "";
  const stripe = getStripe();

  // Try to fetch the session safely
  let s:
    | Stripe.Response<Stripe.Checkout.Session>
    | null
    | undefined = null;

  if (sessionId) {
    try {
      s = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["customer", "payment_intent"]
      });
    } catch {
      s = null;
    }
  }

  const customerEmail =
    (s?.customer_details?.email as string | undefined) ??
    (typeof s?.customer === "object" ? s?.customer.email : undefined);

  const amount = s?.amount_total ?? null;
  const currency = s?.currency;

  const appHome = process.env.SITE_URL || "https://ai.rstglobal.ca";

  return (
    <main className="min-h-screen grid place-items-center bg-black text-white p-6">
      <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-zinc-900 p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Payment received 🎉</h1>
        <p className="text-zinc-300">
          Thanks for supporting <span className="font-medium">MuseMint</span>.
          We’ve emailed a receipt
          {customerEmail ? (
            <>
              {" "}
              to <span className="font-mono">{customerEmail}</span>
            </>
          ) : (
            ""
          )}
          . If you don’t see it, check spam or contact{" "}
          <a
            className="underline"
            href="mailto:hello@rstglobal.ca"
          >
            hello@rstglobal.ca
          </a>
          .
        </p>

        <div className="rounded-xl bg-zinc-800/60 p-4 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="font-medium">
              {s?.payment_status?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Amount</span>
            <span className="font-medium">
              {money(amount, currency)}
            </span>
          </div>
          {s?.id ? (
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Session</span>
              <span className="font-mono">{s.id}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Mode</span>
            <span className="font-medium">
              {(s?.livemode ? "LIVE" : "TEST") ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-medium"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/5"
          >
            Open Dashboard
          </Link>
          <a
            href="mailto:hello@rstglobal.ca"
            className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/5"
          >
            Contact
          </a>
        </div>

        {!sessionId && (
          <p className="text-sm text-red-300">
            Note: No <code>session_id</code> was provided. If you reached this
            page manually, try completing checkout again.
          </p>
        )}
      </div>
    </main>
  );
}
