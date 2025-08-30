import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Ultimate 2026 Business & Life Planner — MuseMint",
  description: "Premium Notion/Sheets planner with KPI dashboards, budgets, goals, and review cadences. Instant download.",
};

export default function Planner() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <header className="mb-8 flex items-center gap-3">
        <Image src="/MuseMintLogo.png" alt="MuseMint" width={40} height={40} />
        <h1 className="text-2xl font-semibold">Ultimate 2026 Business & Life Planner</h1>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <Image
            src="/planner-hero.png"
            alt="Planner preview"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>

        <div className="space-y-5">
          <p className="text-white/85">
            A polished, premium planner system (Notion + Google Sheets) with KPI dashboards, cashflow, goal pyramids,
            Gantt timelines, and weekly reviews. Built for solopreneurs & small teams who want clarity and momentum.
          </p>

          <ul className="list-disc ml-5 text-white/80 space-y-1">
            <li>Annual/Quarterly/Monthly/Weekly planning</li>
            <li>Finance tracker with break-even & runway</li>
            <li>Sales & marketing KPI boards + lead log</li>
            <li>Templates for reviews, OKRs, and sprints</li>
            <li>One-click setup guide & video walkthrough</li>
          </ul>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
            Instant digital download. Lifetime updates included.
          </div>

          <div className="flex gap-3">
            <a
              href="/checkout"
              className="px-5 py-3 rounded-xl bg-brand-yellow/90 hover:bg-brand-yellow text-black font-semibold"
            >
              Buy Now — $9.00
            </a>
            <Link
              href="/refunds"
              className="px-5 py-3 rounded-xl border border-white/15 hover:border-white/35"
            >
              14-day Guarantee
            </Link>
          </div>

          <p className="text-xs text-white/50">
            By purchasing you agree to our <Link className="underline" href="/legal/terms">Terms</Link> and{" "}
            <Link className="underline" href="/legal/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <section className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          ["Polished UI", "Clean dark theme, mobile friendly"],
          ["Plug & Play", "Ready-to-use templates + guides"],
          ["Backed by RST", "Future updates + support"],
        ].map(([h, d]) => (
          <div key={h} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <h3 className="font-medium mb-1">{h}</h3>
            <p className="text-white/70 text-sm">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
