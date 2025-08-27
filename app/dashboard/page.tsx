"use client";
// @ts-nocheck
import { useEffect, useState } from "react";

type Summary = {
  revenue7d: number;
  orders7d: number;
  leads7d: number;
  burnMonthly: number;
  runwayDays: number;
  breakEvenETA: string;
  notes: string[];
};

const TABS = [
  { id: "finance", label: "Finance & Burn" },
  { id: "live", label: "Live Businesses" },
  { id: "vault", label: "Idea Vault" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "runbooks", label: "Runbooks" },
  { id: "settings", label: "Settings" },
] as const;

export default function DashboardPage() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("finance");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
        const json = await res.json();
        setSummary(json?.data || null);
      } catch (e) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-white">
      {/* Top bar */}
      <header className="w-full border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/MuseMintLogo.png"
              alt="RST Global"
              className="w-9 h-9 rounded"
            />
            <div className="leading-tight">
              <p className="font-semibold tracking-wide">RST Global — Master Dashboard</p>
              <p className="text-xs text-white/60">Portfolio, finance & runbooks</p>
            </div>
          </div>
          <a
            href="/"
            className="text-sm px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 transition"
          >
            Home
          </a>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-10 bg-[#0B0D10]/80 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-6xl px-2 sm:px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`whitespace-nowrap px-4 py-3 text-sm border-b-2 transition ${
                  active === t.id
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        {active === "finance" && <FinanceSection loading={loading} summary={summary} />}
        {active === "live" && <LiveBusinessesSection />}
        {active === "vault" && <IdeaVaultSection />}
        {active === "leaderboard" && <LeaderboardSection />}
        {active === "runbooks" && <RunbooksSection />}
        {active === "settings" && <SettingsSection />}
      </section>
    </main>
  );
}

/* ============ Sections ============ */

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function Card({ title, children, right }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-white/90">{title}</h3>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FinanceSection({ loading, summary }: { loading: boolean; summary: Summary | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Finance & Burn</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Revenue (7d)" value={loading ? "…" : `$${(summary?.revenue7d || 0).toFixed(2)}`} />
        <Stat label="Orders (7d)" value={loading ? "…" : String(summary?.orders7d || 0)} />
        <Stat label="Leads (7d)" value={loading ? "…" : String(summary?.leads7d || 0)} />
        <Stat label="Monthly Burn" value={loading ? "…" : `-$${(summary?.burnMonthly || 0).toFixed(2)}`} />
        <Stat label="Runway" value={loading ? "…" : `${summary?.runwayDays || 0} days`} />
        <Stat label="Break-even ETA" value={loading ? "…" : (summary?.breakEvenETA || "TBD")} />
      </div>

      <Card title="Cashflow Gantt (next 90 days)"
        right={<span className="text-xs text-white/50">placeholder</span>}
      >
        <div className="h-28 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-sm">
          Gantt timeline placeholder — we’ll render real milestones and inflow/outflow bars here.
        </div>
      </Card>

      <Card title="Notes">
        <ul className="list-disc list-inside space-y-1 text-sm text-white/75">
          {(summary?.notes?.length ? summary?.notes : ["No critical notes yet."]).map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function LiveBusinessesSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Live Businesses</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="MuseMint (Planners & Templates)">
          <ul className="text-sm text-white/80 space-y-1">
            <li>Revenue: $0 (pre-launch polish)</li>
            <li>Leads: logging live via dashboard</li>
            <li>Next: premium planner polish + listing</li>
          </ul>
        </Card>
        <Card title="AI Phone Agent (Twilio)">
          <ul className="text-sm text-white/80 space-y-1">
            <li>Voice: greeting + voicemail flow online</li>
            <li>Sheets logging: ✅</li>
            <li>Next: voicebot script & booking handoff</li>
          </ul>
        </Card>
        <Card title="AI Agency (RST Global)">
          <ul className="text-sm text-white/80 space-y-1">
            <li>Stripe live: ✅</li>
            <li>Webhook: ✅ test passed</li>
            <li>Next: pricing pages + checkout links</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function IdeaVaultSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Idea Vault</h2>
      <Card title="Filters">
        <div className="flex flex-wrap gap-2">
          {["All", "Fintech", "E-com", "Gov/Defense", "Green/Energy", "Creative/EdTech", "Frontier"].map((f) => (
            <span key={f} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">{f}</span>
          ))}
        </div>
      </Card>
      <Card title="Latest 10 (placeholder)">
        <ol className="text-sm space-y-2">
          <li>1) EDI→API Autobridge — AO 9.8 | EXP 9.1</li>
          <li>2) AI Spend Governance — AO 9.8 | EXP 9.1</li>
          <li>3) Rebates & Incentives Collector — AO 9.8 | EXP 9.1</li>
          <li>4) SKU Graph & Dup-Killer — AO 9.7 | EXP 9.0</li>
          <li>5) API Change Sentinel — AO 9.7 | EXP 9.0</li>
          <li>6) Checkout Price Optimizer — AO 9.9 | EXP 9.2</li>
          <li>7) Rate Shopper & Label Router — AO 9.7 | EXP 9.0</li>
          <li>8) Books Autoposter — AO 9.8 | EXP 9.0</li>
          <li>9) Shadow Catalog Retailer — AO 9.9 | EXP 9.4</li>
          <li>10) Patent & IP Mining Engine — AO 9.8 | EXP 9.4</li>
        </ol>
      </Card>
    </div>
  );
}

function LeaderboardSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Tiered Leaderboard</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="🚀 Tier 1 — Fast ROI">
          <ul className="text-sm space-y-1 text-white/80">
            <li>EDI→API Autobridge</li>
            <li>AI Spend Governance</li>
            <li>Checkout Optimizer</li>
            <li>Rebates Collector</li>
          </ul>
        </Card>
        <Card title="⚖️ Tier 2 — Medium Term">
          <ul className="text-sm space-y-1 text-white/80">
            <li>API Change Sentinel</li>
            <li>SKU Graph & Dup-Killer</li>
            <li>Vendor Onboarding Autopilot</li>
          </ul>
        </Card>
        <Card title="🌍 Tier 3 — Moonshots">
          <ul className="text-sm space-y-1 text-white/80">
            <li>Dynamic Insurance Engine</li>
            <li>Shadow Fleet Monitoring</li>
            <li>Autonomous Patent Mining</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function RunbooksSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Runbooks (Deployment Ready)</h2>
      <Card title="EDI→API Autobridge — V1 Stack">
        <ul className="text-sm text-white/80 space-y-1">
          <li>Ingest: SFTP/VAN/AS2 → parser</li>
          <li>Mapper: schema autodetect + rules</li>
          <li>Output: REST/Webhooks + retries/SLA</li>
          <li>Ops: alerts + partner self-onboarding</li>
        </ul>
      </Card>
      <Card title="AI Spend Governance — V1 Stack">
        <ul className="text-sm text-white/80 space-y-1">
          <li>Usage taps → router (cost/latency)</li>
          <li>Prompt shrinker + cache</li>
          <li>Budgets + anomaly alerts</li>
          <li>Dashboards & per-team controls</li>
        </ul>
      </Card>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>
      <Card title="Integrations (stubs)">
        <ul className="text-sm text-white/80 space-y-1">
          <li>Stripe: Connected ✅ (live)</li>
          <li>Resend: Connected ✅</li>
          <li>Twilio: Connected ✅</li>
          <li>Google Sheets: Connected (to be wired)</li>
          <li>Etsy/Payhip: In progress</li>
        </ul>
      </Card>
    </div>
  );
      }
