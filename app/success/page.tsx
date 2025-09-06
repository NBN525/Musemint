// app/success/page.tsx
import Stripe from "stripe";
import Link from "next/link";
import { PRODUCT } from "../lib/config";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id;
  let customerEmail: string | undefined;
  let paymentIntent: string | undefined;

  if (sessionId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // Protect against undefined
    customerEmail = (session.customer_details && session.customer_details.email) || undefined;
    paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full grid place-items-center bg-emerald-500/15 border border-emerald-400/30">
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-3xl font-semibold">Payment received</h1>
        <p className="text-white/80">
          Thanks for your purchase of <span className="font-medium">{PRODUCT.name}</span>.
          {customerEmail ? (
            <> A receipt and access email was sent to <span className="font-mono">{customerEmail}</span>.</>
          ) : (
            <> A receipt was emailed to the address you used at checkout.</>
          )}
        </p>
        {paymentIntent && (
          <p className="text-xs text-white/50">
            Ref: <span className="font-mono">{paymentIntent}</span>
          </p>
        )}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
          <h2 className="text-lg font-medium mb-2">What you get</h2>
          <ul className="grid gap-2 text-sm text-white/85">
            {PRODUCT.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/60 mt-3">{PRODUCT.priceNote}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-white/15 hover:bg-white/5 transition"
          >
            Back to site
          </Link>
          <a
            href="mailto:hello@rstglobal.ca?subject=MuseMint%20order%20question"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
          >
            Need help?
          </a>
        </div>
      </div>
    </main>
  );
}
