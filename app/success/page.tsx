// app/success/page.tsx
import Stripe from "stripe";
import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const stripe = getStripe();
  const sid = searchParams?.session_id;

  let email: string | undefined;
  let amountLabel = "";

  if (sid) {
    const session = await stripe.checkout.sessions.retrieve(sid, {
      expand: ["customer_details", "line_items.data.price.product"],
    });
    email = session.customer_details?.email || undefined;

    const amount = (session.amount_total ?? 0) / 100;
    const currency = (session.currency || "cad").toUpperCase();
    amountLabel = `${currency} ${amount.toFixed(2)}`;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center">
        <h1 className="text-3xl font-bold">Payment received 🎉</h1>
        <p className="text-zinc-400">
          Thanks for supporting <span className="font-semibold">{PRODUCT_NAME}</span>.
        </p>
        {amountLabel && <p className="text-lg">Amount: {amountLabel}</p>}
        {email && <p className="text-sm text-zinc-400">Receipt sent to: {email}</p>}

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-yellow-400 text-black px-4 py-2 font-semibold hover:opacity-90"
          >
            Home
          </Link>
          <Link
            href="/rst/dashboard"
            className="rounded-lg border border-zinc-600 px-4 py-2 hover:bg-zinc-800"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
