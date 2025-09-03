// app/rst/login/page.tsx
"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const next = new URLSearchParams(window.location.search).get("next") || "/rst/dashboard";
      const res = await fetch("/api/rst/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Login failed");
      }
      const j = await res.json();
      window.location.href = j.next || "/rst/dashboard";
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0f12] text-white">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-xl border border-white/10 bg-black/30">
        <h1 className="text-lg font-semibold">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          placeholder="Enter admin password"
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-yellow text-black font-medium py-2 disabled:opacity-60"
        >
          {loading ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
