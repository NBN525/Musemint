// app/dashboard/page.tsx
import Link from "next/link";

const sections = [
  {
    title: "Today",
    kpis: [
      { label: "Revenue", value: "$0.00", sub: "Stripe (live)" },
      { label: "Orders", value: "0", sub: "Completed checkouts" },
      { label: "Leads", value: "0", sub: "MuseMint waitlist" },
    ],
  },
  {
    title: "7-Day",
    kpis: [
      { label: "Revenue", value: "$0.00", sub: "All sources" },
      { label: "Orders", value: "0", sub: "Completed checkouts" },
      { label: "Email CTR", value: "—", sub: "Resend campaigns" },
    ],
  },
];

const ideas = [
  { tag: "E-com", name: "Checkout Optimizer", status: "Queued" },
  { tag: "Ops", name: "API Sentinel & Autopatcher", status: "Drafting runbook" },
  { tag: "FinOps", name: "AI Spend Governance", status: "Queued" },
  { tag: "Data", name: "SKU Graph / Dup-Killer", status: "Research" },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen px-5 sm:px-8 pt-8 pb-16 max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">RST Global — Command</h1>
          <p className="text-sm text-white/60">Unified view of MuseMint + Agency + Experiments</p>
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
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">{s.title}</h2>
              <span className="text-xs text-white/50">placeholder</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {s.kpis.map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl bg-black/30 border border-white/10 p-4 flex flex-col gap-1"
                >
                  <span className="text-xs uppercase tracking-wide text-white/60">{k.label}</span>
                  <span className="text-lg font-semibold">{k.value}</span>
                  <span className="text-[11px] text-white/50">{k.sub}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Pipelines */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h3 className="font-medium mb-3">Sales Pipeline</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>Stripe (Live)</span>
              <span className="text-white/60">Connected</span>
            </li>
            <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>Google Sheets: MuseMint Sales Log</span>
              <span className="text-white/60">OK</span>
            </li>
            <li className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>RST Global SMS Log</span>
              <span className="text-amber-300/80">Monitoring</span>
            </li>
          </ul>
          <div className="mt-4 text-xs text-white/50">
            Live data wiring comes next (safe keys, cached fetchers).
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h3 className="font-medium mb-3">Launch Checklist</h3>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Set <code>STRIPE_PRICE_ID</code> live price</li>
            <li>DMARC: keep single record → verify</li>
            <li>Success/Cancel pages + CTA flow</li>
            <li>Email template polish + BCC to archive</li>
          </ol>
          <div className="mt-4">
            <Link
              href="/success"
              className="text-brand-yellow hover:underline text-sm"
            >
              Preview success page →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h3 className="font-medium mb-3">Idea Vault (Top)</h3>
          <ul className="divide-y divide-white/10">
            {ideas.map((i) => (
              <li key={i.name} className="py-2 flex items-center justify-between text-sm">
                <span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs mr-2">{i.tag}</span>
                  {i.name}
                </span>
                <span className="text-white/60">{i.status}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-white/50">
            We’ll swap this list to the scored vault view.
          </div>
        </div>
      </section>
    </main>
  );
}
