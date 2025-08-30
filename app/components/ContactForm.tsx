"use client";
import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setOk(null); setErr("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      setOk(j.ok === true);
      if (!res.ok) setErr(j.error || "Failed to send");
      if (res.ok) (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      setErr(e?.message || "Network error");
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
      <div className="grid gap-1">
        <label className="text-sm text-white/70">Name</label>
        <input name="name" className="bg-white/5 rounded-md px-3 py-2 outline-none border border-white/10" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/70">Email *</label>
        <input required type="email" name="email" className="bg-white/5 rounded-md px-3 py-2 outline-none border border-white/10" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/70">Message *</label>
        <textarea required name="message" rows={5} className="bg-white/5 rounded-md px-3 py-2 outline-none border border-white/10" />
      </div>
      <button disabled={loading} className="mt-1 px-4 py-2 rounded-lg bg-brand-yellow/90 hover:bg-brand-yellow text-black font-medium disabled:opacity-60">
        {loading ? "Sending…" : "Send"}
      </button>
      {ok === true && <p className="text-emerald-400 text-sm">Message sent. We’ll get back to you shortly.</p>}
      {ok === false && <p className="text-rose-400 text-sm">Failed: {err}</p>}
    </form>
  );
}
