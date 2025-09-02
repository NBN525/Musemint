import Stripe from "stripe";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams?.session_id;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  let amount_total: number | null = null;
  let currency: string | null = null;
  let customer_email: string | null = null;
  let product: string | null = process.env.NEXT_PUBLIC_PRODUCT_NAME || "Your purchase";

  if (sessionId && stripeKey) {
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    try {
      const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items.data.price.product"] });
      amount_total = s.amount_total;
      currency = s.currency?.toUpperCase() || null;
      customer_email = (s.customer_details?.email || null);
      const li = s.line_items?.data?.[0];
      const prodObj = (li?.price?.product as any);
      if (prodObj?.name) product = prodObj.name;
    } catch {
      // keep defaults
    }
  }

  const pretty = (amount_total && currency)
    ? `${(amount_total / 100).toFixed(2)} ${currency}`
    : null;

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment received ✅</h1>
      <p className="opacity-80 mb-6">
        {product}{pretty ? ` • ${pretty}` : ""}{customer_email ? ` • ${customer_email}` : ""}
      </p>

      <div className="flex gap-3">
        <Link href="/" className="rounded-md px-4 py-2 bg-yellow-400 text-black font-medium">
          Back to site
        </Link>
        <Link href="/rst/dashboard" className="rounded-md px-4 py-2 border border-white/20">
          RST Admin (protected)
        </Link>
      </div>
    </main>
  );
}
