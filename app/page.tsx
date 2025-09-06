"use client";
import { useState } from "react";
import { PRODUCT } from "../lib/config";  // ← up one level to /lib

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function startCheckout() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: "supporter", quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (e: any) {
      setMsg(e?.message || "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  async function submitNotify(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email) {
      setMsg("Please enter an email.");
      return;
    }
    try {
      setNotifyLoading(true);
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to subscribe");
      setMsg("Thanks! You’re on the list.");
      setEmail("");
      setName("");
    } catch (e: any) {
      setMsg(e?.message || "Subscription failed");
    } finally {
      setNotifyLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full grid place-items-center bg-[#0a0f12] border border-white/10">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-semibold">MuseMint</h1>
          <p className="text-white/70">
            Smart tools & templates for digital planners and business growth — by{" "}
            <a href="https://rstglobal.ca" className="underline">RST Global</a>.
          </p>
        </div>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/rst/login"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
          >
            Open Dashboard
          </a>

          <button
            onClick={startCheckout}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-white/15 hover:bg-white/5 transition disabled:opacity-50"
          >
            {loading ? "Starting…" : PRODUCT.short ? `Buy ${PRODUCT.short}` : "Buy"}
          </button>
        </div>

        {/* Notify form */}
        <form
          onSubmit={submitNotify}
          className="mx-auto grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2 max-w-2xl"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            type="email"
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
            required
          />
          <button
            type="submit"
            disabled={notifyLoading}
            className="rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition disabled:opacity-50"
          >
            {notifyLoading ? "Adding…" : "Notify me"}
          </button>
        </form>

        {msg && <p className="text-sm text-white/80">{msg}</p>}

        {/* Product highlights pulled from envs */}
        {!!PRODUCT.bullets.length && (
          <ul className="text-sm text-white/70 space-y-1">
            {PRODUCT.bullets.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        )}

        {PRODUCT.priceNote && (
          <p className="text-xs text-white/50">{PRODUCT.priceNote}</p>
        )}
      </div>
    </main>
  );
}
