"use client";
import { useState } from "react";

export default function LeadPage() {
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      company: form.get("company"),
      notes: form.get("notes"),
      source: "Website",
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("ok");
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 p-6 rounded-2xl shadow bg-white">
        <h1 className="text-2xl font-semibold">Get a Demo</h1>
        <p className="text-sm text-gray-500">Tell us a bit about you and we’ll reach out.</p>

        <input name="name" placeholder="Full name" required className="w-full border rounded-lg px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full border rounded-lg px-3 py-2" />
        <input name="phone" placeholder="Phone (optional)" className="w-full border rounded-lg px-3 py-2" />
        <input name="company" placeholder="Company (optional)" className="w-full border rounded-lg px-3 py-2" />
        <textarea name="notes" placeholder="What do you need help with?" rows={3} className="w-full border rounded-lg px-3 py-2" />

        <button
          disabled={status==="sending"}
          className="w-full px-4 py-2 rounded-xl bg-yellow-400 font-semibold disabled:opacity-50"
        >
          {status==="sending" ? "Sending…" : "Request Demo"}
        </button>

        {status==="ok" && <p className="text-green-600 text-sm">Thanks! We’ll be in touch shortly.</p>}
        {status==="err" && <p className="text-red-600 text-sm">Something went wrong—please try again.</p>}
      </form>
    </main>
  );
}
