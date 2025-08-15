"use client";

import Papa from "papaparse";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  function onFile(f) {
    if (!f) return;
    Papa.parse(f, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors?.length) {
          setErr("Parse error. Check CSV format.");
        } else {
          setErr("");
          setRows(data);
        }
      }
    });
  }

  const kpis = useMemo(() => computeKpis(rows), [rows]);

  return (
    <main className="min-h-screen px-6 py-10 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">MuseMint Dashboard</h1>
          <p className="text-white/60">Upload your Etsy Orders CSV (or our sample template) to see KPIs.</p>
        </header>

        <div className="mb-6">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
          />
          {err && <p className="text-rose-400 mt-2">{err}</p>}
        </div>

        {/* KPI cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Kpi title="Gross Revenue" value={fmt(kpis.gross)} />
          <Kpi title="Total Fees" value={fmt(kpis.fees)} />
          <Kpi title="Net Revenue" value={fmt(kpis.net)} />
          <Kpi title="Units Sold" value={kpis.units.toLocaleString()} />
        </section>

        {/* Charts */}
        <section className="grid lg:grid-cols-2 gap-6">
          <Card title="Daily Net Revenue">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis.daily} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis dataKey="date" stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <YAxis stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
                  <Line type="monotone" dataKey="net" stroke="#E7B10A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Top SKUs by Net">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.topSku} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis dataKey="sku" stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <YAxis stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
                  <Bar dataKey="net" fill="#16B3AC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Raw table (optional quick view) */}
        {rows.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-2">Raw Rows ({rows.length.toLocaleString()})</h2>
            <div className="overflow-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    {Object.keys(rows[0]).map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-white/80">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 150).map((r, i) => (
                    <tr key={i} className="odd:bg-white/[.02]">
                      {Object.keys(rows[0]).map((h) => (
                        <td key={h} className="px-3 py-2 text-white/80">{String(r[h] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-white/50 mt-2">Showing first 150 rows for speed.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
      <div className="text-sm text-white/60">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
      <div className="text-sm text-white/60 mb-2">{title}</div>
      {children}
    </div>
  );
}

function fmt(n) {
  try { return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(n || 0)); }
  catch { return `$${Number(n || 0).toFixed(2)}`; }
}

/** Compute KPIs from flexible headers */
function computeKpis(rows) {
  if (!rows?.length) return { gross: 0, fees: 0, net: 0, units: 0, daily: [], topSku: [] };

  // Map likely header names → canonical keys
  const mapKey = (k = "") => k.toLowerCase().trim();
  const first = rows[0];

  // Try to auto-detect fields
  const keys = Object.keys(first).reduce((acc, k) => {
    const m = mapKey(k);
    if (m.includes("gross")) acc.gross = k;
    if (m.includes("net")) acc.net = k;
    if (m.includes("process") || m.includes("payment")) acc.proc = k;
    if (m.includes("transact") || m === "fee" || m.includes("fee")) acc.fees2 = k;
    if (m.includes("other") && m.includes("fee")) acc.other = k;
    if (m === "quantity" || m.includes("qty")) acc.qty = k;
    if (m.includes("date")) acc.date = k;
    if (m.includes("sku") || m.includes("listing")) acc.sku = k;
    if (m.includes("title")) acc.title = k;
    return acc;
  }, {});

  let gross = 0, fees = 0, net = 0, units = 0;
  const byDay = new Map();
  const bySku = new Map();

  rows.forEach((r) => {
    const g = num(r[keys.gross]) || num(r.unit_price_cad) * num(r.quantity) || 0;
    const pf = num(r[keys.proc]);
    const tf = num(r[keys.fees2]);
    const of = num(r[keys.other]);
    const n = r[keys.net] !== undefined && r[keys.net] !== "" ? num(r[keys.net]) : (g - pf - tf - of);
    const q = num(r[keys.qty]) || 1;

    gross += g; fees += (pf + tf + of); net += n; units += q;

    const d = String(r[keys.date] || "").slice(0, 10);
    if (d) {
      if (!byDay.has(d)) byDay.set(d, { date: d, net: 0, gross: 0 });
      byDay.get(d).net += n; byDay.get(d).gross += g;
    }

    const sku = String(r[keys.sku] ?? "(no SKU)");
    if (!bySku.has(sku)) bySku.set(sku, { sku, net: 0, gross: 0, units: 0, title: r[keys.title] || sku });
    const s = bySku.get(sku);
    s.net += n; s.gross += g; s.units += q;
  });

  const daily = Array.from(byDay.values()).sort((a,b) => a.date.localeCompare(b.date));
  const topSku = Array.from(bySku.values()).sort((a,b) => b.net - a.net).slice(0, 6);

  return { gross, fees, net, units, daily, topSku };
}

function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

