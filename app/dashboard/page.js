"use client";

import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";

// ---- Brand colors
const COLORS = {
  bg: "#0F172A",
  panel: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  subtext: "#AAB0C0",
  gold: "#E7B10A",
  teal: "#16B3AC",
};

// ---- Small UI primitives
function Card({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 border ${className}`}
      style={{ background: COLORS.panel, borderColor: COLORS.border }}
    >
      {title ? (
        <div className="text-sm" style={{ color: COLORS.subtext }}>
          {title}
        </div>
      ) : null}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Metric({ label, value, help }) {
  return (
    <Card>
      <div className="text-sm" style={{ color: COLORS.subtext }}>
        {label}
      </div>
      <div className="text-2xl font-semibold text-white mt-1">{value}</div>
      {help ? (
        <div className="text-xs mt-1" style={{ color: COLORS.subtext }}>
          {help}
        </div>
      ) : null}
    </Card>
  );
}

function Progress({ value }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className="w-full h-2 rounded-full overflow-hidden border"
      style={{ borderColor: COLORS.border }}
    >
      <div className="h-full" style={{ width: `${width}%`, background: COLORS.teal }} />
    </div>
  );
}

// ---- Helpers
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function computeFromRows(rows) {
  if (!rows || rows.length === 0) {
    return { gross: 0, fees: 0, net: 0, units: 0, daily: [], topSku: [] };
  }

  const first = rows[0];
  const mapKey = (k) => String(k || "").toLowerCase();

  const keys = Object.keys(first).reduce((acc, k) => {
    const m = mapKey(k);
    if (m.includes("gross")) acc.gross = k;
    if (m.includes("net")) acc.net = k;
    if (m.includes("process") || m.includes("payment")) acc.proc = k;
    if (m.includes("transact") || m === "fee" || m.includes("fee")) acc.fee = k;
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
    const g = num(r[keys.gross]) || (num(r.unit_price_cad) * num(r.quantity)) || 0;
    const pf = num(r[keys.proc]);
    const tf = num(r[keys.fee]);
    const of = num(r[keys.other]);
    const n = r[keys.net] !== undefined && r[keys.net] !== "" ? num(r[keys.net]) : (g - pf - tf - of);
    const q = num(r[keys.qty]) || 1;

    gross += g;
    fees += (pf + tf + of);
    net += n;
    units += q;

    const d = String(r[keys.date] || "").slice(0, 10);
    if (d) {
      if (!byDay.has(d)) byDay.set(d, { date: d, net: 0, gross: 0 });
      const dref = byDay.get(d);
      dref.net += n;
      dref.gross += g;
    }

    const sku = String(r[keys.sku] ?? "(no SKU)");
    if (!bySku.has(sku)) bySku.set(sku, { sku, title: r[keys.title] || sku, net: 0, units: 0 });
    const s = bySku.get(sku);
    s.net += n;
    s.units += q;
  });

  return {
    gross,
    fees,
    net,
    units,
    daily: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)),
    topSku: Array.from(bySku.values()).sort((a, b) => b.net - a.net).slice(0, 6),
  };
}

const DEFAULT_BUDGET = {
  startupOneTime: 46,       // CAD
  monthlyRecurring: 40.67,  // CAD
  cap: 200,                 // CAD budget cap
};

function useBudget(kpis) {
  const burnPerDay = DEFAULT_BUDGET.monthlyRecurring / 30;
  const runwayDays = (DEFAULT_BUDGET.cap - DEFAULT_BUDGET.startupOneTime) > 0
    ? Math.floor((DEFAULT_BUDGET.cap - DEFAULT_BUDGET.startupOneTime) / burnPerDay)
    : 0;
  const monthBreakEven = DEFAULT_BUDGET.startupOneTime + DEFAULT_BUDGET.monthlyRecurring;
  const progress = monthBreakEven > 0 ? (kpis.net / monthBreakEven) * 100 : 0;
  return {
    burnPerDay,
    runwayDays,
    monthBreakEven,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const kpis = useMemo(() => computeFromRows(rows), [rows]);
  const budget = useBudget(kpis);

  function onFile(file) {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors && errors.length > 0) {
          alert("CSV parse error. Please check headers and commas.");
          return;
        }
        setRows(data || []);
      },
    });
  }

  function fmt(n) {
    try {
      return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(n || 0));
    } catch {
      return `$${Number(n || 0).toFixed(2)}`;
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg, color: COLORS.text }}>
      {/* Topbar */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ borderColor: COLORS.border, background: "rgba(15,23,42,0.9)", backdropFilter: "saturate(120%) blur(6px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full ring-2 ring-amber-400/70 flex items-center justify-center">🌿</div>
            <div className="font-semibold">MuseMint • Professional Dashboard</div>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: COLORS.subtext }}>
            <span>Burn:</span><span className="text-white">{fmt(budget.burnPerDay)}/day</span>
            <span className="ml-4">Runway:</span><span className="text-white">{budget.runwayDays} days</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <label className="text-sm" style={{ color: COLORS.subtext }}>Upload Orders CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => onFile(e.target.files && e.target.files[0])}
            className="file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
          />
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Metric label="Gross Revenue" value={fmt(kpis.gross)} />
          <Metric label="Total Fees" value={fmt(kpis.fees)} />
          <Metric label="Net Revenue" value={fmt(kpis.net)} />
          <Metric label="Units Sold" value={kpis.units.toLocaleString()} />
        </div>

        {/* Break-even + Charts */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <Card title="Break-Even (Month 1)">
            <div className="flex items-center justify-between">
              <div className="text-white text-xl font-semibold">{fmt(budget.monthBreakEven)}</div>
              <div className="text-sm" style={{ color: COLORS.subtext }}>Target</div>
            </div>
            <div className="mt-3"><Progress value={budget.progress} /></div>
            <div className="text-xs mt-2" style={{ color: COLORS.subtext }}>
              {Math.round(budget.progress)}% to break-even
            </div>
          </Card>

          <Card title="Daily Net Revenue">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis.daily} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis dataKey="date" stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <YAxis stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
                  <Line type="monotone" dataKey="net" stroke={COLORS.gold} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Top SKUs by Net">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.topSku} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis dataKey="sku" stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <YAxis stroke="#bbb" tick={{ fill: "#bbb" }} />
                  <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
                  <Bar dataKey="net" fill={COLORS.teal} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Raw table */}
        {rows.length > 0 && (
          <Card title={`Raw Rows (${rows.length.toLocaleString()})`}>
            <div className="overflow-auto rounded-xl border" style={{ borderColor: COLORS.border }}>
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    {Object.keys(rows[0]).map((h) => (
                      <th key={h} className="px-3 py-2 text-left" style={{ color: COLORS.subtext }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 150).map((r, i) => (
                    <tr key={i} className="odd:bg-white/[.02]">
                      {Object.keys(rows[0]).map((h) => (
                        <td key={h} className="px-3 py-2 text-white/80">
                          {String(r[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs mt-2" style={{ color: COLORS.subtext }}>
              Showing first 150 rows for speed.
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-xs" style={{ color: COLORS.subtext }}>
          © {new Date().getFullYear()} RST Global — MuseMint Dashboard
        </div>
      </div>
    </div>
  );
        }
