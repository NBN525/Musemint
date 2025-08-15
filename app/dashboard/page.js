"use client";

import { useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState({});
  const [error, setError] = useState("");

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.trim().split("\n").map(r => r.split(","));
        setData(rows);

        // Simple KPI example: count orders and revenue
        const headers = rows[0];
        const orderIndex = headers.findIndex(h => h.toLowerCase().includes("order"));
        const revenueIndex = headers.findIndex(h => h.toLowerCase().includes("revenue"));

        const totalOrders = rows.length - 1;
        const totalRevenue = rows.slice(1).reduce((sum, r) => {
          const val = parseFloat(r[revenueIndex]) || 0;
          return sum + val;
        }, 0);

        setKpis({ totalOrders, totalRevenue });
        setError("");
      } catch (err) {
        setError("Error parsing CSV. Please check the file format.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MuseMint Dashboard</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {Object.keys(kpis).length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h2>KPIs</h2>
          <p>Total Orders: {kpis.totalOrders}</p>
          <p>Total Revenue: ${kpis.totalRevenue.toFixed(2)}</p>
        </div>
      )}

      {data.length > 0 && (
        <table border="1" cellPadding="6" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              {data[0].map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
