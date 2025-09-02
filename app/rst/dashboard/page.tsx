"use client";

import { useEffect, useState } from "react";

function Mask({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function submit(pw: string) {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) setOk(true);
    else setError("Incorrect password.");
  }

  useEffect(() => {
    // Soft check; if already authed cookie present, backend returns 204
    fetch("/api/admin/login", { method: "GET" }).then(r => {
      if (r.status === 204) setOk(true);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p className="text-sm opacity-70">Checking access…</p>
      </main>
    );
  }

  if (ok) return <>{children}</>;

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-white/10 p-5">
        <h1 className="text-lg font-semibold mb-3">Admin Access</h1>
        <p className="text-sm opacity-70 mb-4">
          Enter password to view the RST Global admin.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget as HTMLFormElement);
            submit(String(data.get("password") || ""));
          }}
          className="space-y-3"
        >
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-md bg-black/30 border border-white/20 px-3 py-2 outline-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            className="w-full rounded-md bg-yellow-400 text-black font-medium py-2"
            type="submit"
          >
            Unlock
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Mask>
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold mb-2">RST Global — Admin</h1>
        <p className="opacity-70 mb-6">
          Ops shortcuts + telemetry for MuseMint / Phone Agent.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
             href="/api/health" target="_blank" rel="noreferrer">
            <h2 className="font-medium">Health Check</h2>
            <p className="text-sm opacity-70">Env & service readiness</p>
          </a>

          <a className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
             href="/api/config" target="_blank" rel="noreferrer">
            <h2 className="font-medium">Config Snapshot</h2>
            <p className="text-sm opacity-70">Masked env presence</p>
          </a>

          <a className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
             href="https://dashboard.stripe.com" target="_blank" rel="noreferrer">
            <h2 className="font-medium">Stripe</h2>
            <p className="text-sm opacity-70">Payments, webhooks, logs</p>
          </a>

          <a className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
             href="https://resend.com/dashboard/emails" target="_blank" rel="noreferrer">
            <h2 className="font-medium">Resend</h2>
            <p className="text-sm opacity-70">Email activity</p>
          </a>

          <a className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
             href="https://console.twilio.com" target="_blank" rel="noreferrer">
            <h2 className="font-medium">Twilio</h2>
            <p className="text-sm opacity-70">Phone numbers, logs</p>
          </a>

          <a className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
             href="https://docs.google.com" target="_blank" rel="noreferrer">
            <h2 className="font-medium">Sheets Logs</h2>
            <p className="text-sm opacity-70">MuseMint Sales / RST SMS</p>
          </a>
        </div>
      </main>
    </Mask>
  );
}
