"use client";
import Papa from "papaparse";
import { useState } from "react";

export default function Dashboard() {
  const [kpis, setKpis] = useState({ gross: 0, fees: 0, net: 0, units: 0 });

  function onFile(file) {
    Papa.parse(file, {
      header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: ({ data }) => {
        let gross=0, fees=0, net=0, units=0;
        data.forEach(r=>{
          const g = Number(r.gross_cad || r.unit_price_cad * r.quantity || 0) || 0;
          const pf = Number(r.etsy_processing_fee_cad||0) || 0;
          const tf = Number(r.etsy_transaction_fee_cad||0) || 0;
          const of = Number(r.other_fees_cad||0) || 0;
          const n = r.net_cad!==undefined && r.net_cad!=="" ? Number(r.net_cad) : (g-pf-tf-of);
          const q = Number(r.quantity||1) || 0;
          gross += g; fees += pf+tf+of; net += n; units += q;
        });
        setKpis({ gross, fees, net, units });
      }
    });
  }

  const fmt = (n)=> new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(n||0);

  return (
    <main className="min-h-screen px-6 py-12">
      <h1 className="text-3xl font-semibold mb-4">MuseMint Dashboard (CSV Mode)</h1>
      <p className="text-white/70 mb-6">Upload <code>etsy_orders_template.csv</code> to see KPIs. (We’ll switch to live Etsy API when approved.)</p>
      <input type="file" accept=".csv" onChange={(e)=> e.target.files[0] && onFile(e.target.files[0])}
             className="block mb-8 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"/>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Gross Revenue" value={fmt(kpis.gross)} />
        <Card title="Total Fees" value={fmt(kpis.fees)} />
        <Card title="Net Revenue" value={fmt(kpis.net)} />
        <Card title="Units Sold" value={kpis.units} />
      </div>
    </main>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
      <div className="text-sm text-white/60">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
    }
