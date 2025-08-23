import Stripe from "stripe";

// Decide which key to use based on the session_id prefix
function getStripeForSession(sessionId?: string) {
  const isTest = (sessionId || "").startsWith("cs_test_");
  const key = isTest
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY_LIVE;
  if (!key) throw new Error("Missing Stripe secret key for selected mode");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sessionId = (searchParams.session_id as string) || "";
  if (!sessionId) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-semibold">Missing session</h1>
        <p className="text-slate-500 mt-2">
          We couldn’t find your checkout session. If you already paid, please
          contact support.
        </p>
      </main>
    );
  }

  // Fetch session + line items from Stripe (server-side)
  const stripe = getStripeForSession(sessionId);

  let session: Stripe.Checkout.Session | null = null;
  let items: Stripe.ApiList<Stripe.LineItem> | null = null;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "payment_intent"],
    });
    items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 20 });
  } catch (e) {
    console.error("Stripe fetch error:", e);
    return (
      <main className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-semibold">We’re checking your payment…</h1>
        <p className="text-slate-500 mt-2">
          Something went wrong retrieving your receipt. We’ve been notified.
        </p>
      </main>
    );
  }

  const email = session?.customer_details?.email || "—";
  const currency = (session?.currency || "usd").toUpperCase();
  const amount = typeof session?.amount_total === "number"
    ? (session!.amount_total / 100).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

  const mode = session?.id.startsWith("cs_test_") ? "Test" : "Live";

  const downloadUrl =
    process.env.PLANNER_DOWNLOAD_URL ||
    "https://example.com/your-download.zip"; // TODO: replace with your real file/link

  return (
    <main className="min-h-[60vh] max-w-2xl mx-auto p-8">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Payment successful ✅</h1>
          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
            {mode}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-xs uppercase text-slate-500">Buyer</div>
            <div className="mt-1 font-medium">{email}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-xs uppercase text-slate-500">Amount</div>
            <div className="mt-1 font-medium">
              {currency} {amount}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm uppercase text-slate-500 mb-2">Items</div>
          <ul className="space-y-2">
            {(items?.data || []).map((li) => (
              <li
                key={li.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div className="font-medium">{li.description || "Item"}</div>
                <div className="text-sm text-slate-600">
                  x{li.quantity ?? 1} ·{" "}
                  {(li.amount_total / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: currency,
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={downloadUrl}
            target="_blank"
            className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white hover:opacity-90"
          >
            Download your planner
          </a>
          <a
            href="/"
            className="inline-flex items-center rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Back to home
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Need help? Email{" "}
          <a className="underline" href="mailto:support@rstglobal.ca">
            support@rstglobal.ca
          </a>
          .
        </p>
      </div>
    </main>
  );
}
