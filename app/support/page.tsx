// app/support/page.tsx
"use client";

import { useState } from "react";

export default function SupportPage() {
  const [state, setState] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name")?.toString(),
      email: form.get("email")?.toString() || "",
      topic: form.get("topic")?.toString(),
      message: form.get("message")?.toString() || "",
      _hp: form.get("_hp")?.toString() // honeypot
    };
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Send failed");
      setState("ok");
      setMsg("Thanks! We’ll get back to you shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (e:any) {
      setState("err");
      setMsg(e?.message || "Send failed");
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-2">Support</h1>
      <p className="text-sm text-white/70 mb-6">
        Questions or refund requests? Drop a note—copies are also logged for tracking.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <input name="_hp" className="hidden" aria-hidden defaultValue="" />
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" className="w-full rounded-md px-3 py-2 bg-black/20 border border-white/15" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email*</label>
          <input required type="email" name="email" className="w-full rounded-md px-3 py-2 bg-black/20 border border-white/15" />
        </div>
        <div>
          <label className="block text-sm mb-1">Topic</label>
          <input name="topic" placeholder="Billing, Access, Refund…" className="w-full rounded-md px-3 py-2 bg-black/20 border border-white/15" />
        </div>
        <div>
          <label className="block text-sm mb-1">Message*</label>
          <textarea required name="message" rows={6} className="w-full rounded-md px-3 py-2 bg-black/20 border border-white/15" />
        </div>
        <button
          disabled={state === "sending"}
          className="px-4 py-2 rounded-xl bg-brand-yellow/90 hover:bg-brand-yellow text-black font-medium"
        >
          {state === "sending" ? "Sending…" : "Send"}
        </button>
      </form>

      {state !== "idle" && (
        <p className={`mt-4 text-sm ${state === "ok" ? "text-emerald-400" : state==="err" ? "text-red-400" : "text-white/70"}`}>
          {msg}
        </p>
      )}
    </main>
  );
}
