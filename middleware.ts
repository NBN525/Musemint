// app/rst/login/page.tsx
"use client";
import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/rst/login", {     // 👈 changed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const next = new URLSearchParams(location.search).get("next") || "/rst/dashboard";
      location.href = next;
    } else {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error || "Login failed");
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
          placeholder="Enter admin password"
          className="w-full rounded-md bg-black/40 border border-white/15 px-3 py-2 outline-none"
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full rounded-md bg-white text-black font-medium py-2 hover:bg-white/90">
          Sign in
        </button>
      </form>
    </main>
  );
}
