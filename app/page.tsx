// app/page.tsx
"use client";

import { useState } from "react";
import { PRODUCT } from "./lib/config";

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
        // quantity stays 1; price is controlled by STRIPE_PRICE_ID in the API route
        body: JSON.stringify({ quantity: 1 }),
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
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full grid place-items-center bg-white/5 border border-white/10">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">MuseMint</h1>
          <p className="text-white/70">
            Smart tools & templates for digital planners and business growth — by{" "}
            <a href="https://rstglobal.ca" className="underline">RST Global</a>.
          </p>
        </div>

        {/* Product card */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">{PRODUCT.name}</h2>
              <p className="text-white/70 mt-1">{PRODUCT.short}</p>
              <p className="text-white/80 mt-3">{PRODUCT.desc}</p>
            </div>
            <div className="shrink-0">
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                {PRODUCT.badge}
              </span>
            </div>
          </div>

          <ul className="mt-5 grid gap-2 text-sm text-white/85">
            {PRODUCT.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={startCheckout}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Starting…" : "Buy Now"}
            </button>
            <a
              href="/success" // simple preview of success layout (won't show real order info without session_id)
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-white/15 hover:bg-white/5 transition"
            >
              See what you get
            </a>
          </div>

          <p className="text-xs text-white/60 mt-3">{PRODUCT.priceNote}</p>
        </section>

        {/* Notify form */}
        <section>
          <h3 className="text-lg font-medium text-center mb-3">Get early access & updates</h3>
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
          {msg && <p className="text-sm text-white/80 mt-2 text-center">{msg}</p>}
          <p className="text-xs text-white/50 text-center mt-2">
            We respect your inbox. Unsubscribe anytime.
          </p>
        </section>
      </div>
    </main>
  );
}
