// app/dashboard/page.tsx
import Stripe from "stripe";
import Link from "next/link";

export const runtime = "nodejs";

type Kpis = {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
};

async function getStripeKpis(): Promise<Kpis> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20",
  });

  // Define time windows
  const now = Math.floor(Date.now() / 1000);
  const startOfDay = Math.floor(new Date(new Date().toDateString()).getTime() / 1000);
  const weekAgo = now - 7 * 24 * 60 * 60;

  // We’ll use Checkout Sessions (completed) as the canonical “order”
  const listCompleted = async (startTs: number) => {
    let revenue = 0;
    let count = 0;

    const iter = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: startTs, lte: now },
      status: "complete",
      expand: ["data.total_details.breakdown"],
    });

    for (const s of iter.data) {
      // amount_total is in the smallest currency unit
      if (typeof s.amount_total === "number") {
        revenue += s.amount_total;
      }
      count += 1;
    }

    return { revenue, count };
  };

  const today = await listCompleted(startOfDay);
  const week = await listCompleted(weekAgo);

  return {
    todayRevenue: today.revenue / 100,
    todayOrders: today.count,
    weekRevenue: week.revenue / 100,
    weekOrders: week.count,
  };
}

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
}

export default async function Dashboard() {
  let kpis: Kpis = { todayRevenue: 0, todayOrders: 0, weekRevenue: 0, weekOrders: 0 };
  try {
    kpis = await getStripeKpis();
  } catch {
    // Render zeros if Stripe is not configured; avoids hard failure
  }

  return (
    <main className="min-h-screen px-5 sm:px-8 pt-8 pb-16 max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">RST Global — Command</h1>
          <p className="text-sm text-white/60">
            Live KPIs from Stripe (MuseMint). Sheets/Email wiring stays as-is.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:border-white/40 transition"
        >
          Home
        </Link>
      </header>

      {/* KPI Grid */}
      <section className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Today</h2>
            <span className="text-xs text-white/50">Stripe live</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Revenue</div>
              <div className="text-lg font-semibold">{money(kpis.todayRevenue)}</div>
              <div className="text-[11px] text-white/50">Completed checkouts</div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Orders</div>
              <div className="text-lg font-semibold">{kpis.todayOrders}</div>
              <div className="text-[11px] text-white/50">Count</div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Email</div>
              <div className="text-lg font-semibold">—</div>
              <div className="text-[11px] text-white/50">Resend (next)</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Last 7 Days</h2>
            <span className="text-xs text-white/50">Stripe live</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Revenue</div>
              <div className="text-lg font-semibold">{money(kpis.weekRevenue)}</div>
              <div className="text-[11px] text-white/50">All sources (Stripe)</div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Orders</div>
              <div className="text-lg font-semibold">{kpis.weekOrders}</div>
              <div className="text-[11px] text-white/50">Count</div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Leads</div>
              <div className="text-lg font-semibold">—</div>
              <div className="text-[11px] text-white/50">LeadForm (later)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipelines */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h3 className="font-medium mb-3">Sales Pipeline</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>Stripe (Live)</span>
              <span className="text-green-300/80">Connected</span>
            </li>
            <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>MuseMint Sales Log (Sheet)</span>
              <span className="text-white/60">OK</span>
            </li>
            <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>RST Global SMS Log (Sheet)</span>
              <span className="text-amber-300/80">Monitoring</span>
            </li>
          </ul>
          <div className="mt-4 text-xs text-white/50">
            Next: add a lightweight reader for Google Sheets via Apps Script relay.
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h3 className="font-medium mb-3">Launch Checklist</h3>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Confirm <code>STRIPE_PRICE_ID</code> is live</li>
            <li>Resolve DMARC (single record, 24–48h)</li>
            <li>Polish email template in Resend</li>
            <li>Hook Sheets reader for KPI cards</li>
          </ol>
          <div className="mt-4">
            <Link href="/success" className="text-brand-yellow hover:underline text-sm">
              Preview success page →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h3 className="font-medium mb-3">Idea Vault (Top)</h3>
          <ul className="divide-y divide-white/10">
            <li className="py-2 flex items-center justify-between text-sm">
              <span><span className="rounded-md bg-white/10 px-2 py-0.5 text-xs mr-2">E-com</span>Checkout Optimizer</span>
              <span className="text-white/60">Queued</span>
            </li>
            <li className="py-2 flex items-center justify-between text-sm">
              <span><span className="rounded-md bg-white/10 px-2 py-0.5 text-xs mr-2">Ops</span>API Sentinel & Autopatcher</span>
              <span className="text-white/60">Drafting runbook</span>
            </li>
            <li className="py-2 flex items-center justify-between text-sm">
              <span><span className="rounded-md bg-white/10 px-2 py-0.5 text-xs mr-2">FinOps</span>AI Spend Governance</span>
              <span className="text-white/60">Queued</span>
            </li>
          </ul>
          <div className="mt-4 text-xs text-white/50">This will become the scored Vault view.</div>
        </div>
      </section>
    </main>
  );
}
