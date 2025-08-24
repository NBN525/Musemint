"use client";

import { useState } from "react";

type UTM = { source?: string | null; medium?: string | null; campaign?: string | null };

export default function LeadForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const utm: UTM = {
      source: params?.get("utm_source"),
      medium: params?.get("utm_medium"),
      campaign: params?.get("utm_campaign"),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, utm }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");

      setStatus("ok");
      setEmail("");
      setName("");
    } catch (err) {
      console.error(err);
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-3">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
      />
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg bg-amber-400/90 px-4 py-2 text-black font-medium disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>

      {status === "ok" && (
        <p className="text-sm text-emerald-400">✅ You’re in! Check your inbox for a welcome email.</p>
      )}
      {status === "err" && (
        <p className="text-sm text-rose-400">Something went wrong. Please try again in a moment.</p>
      )}
    </form>
  );
}
