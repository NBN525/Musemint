"use client";
import { useState } from "react";

export default function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true); setOk(null);

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "You're on the MuseMint early list 🎉",
          html:
            `<p>Thanks${name ? `, ${name}` : ""} — you’re on the list! We’ll send launch news and a VIP code.</p>` +
            `<p style="margin-top:12px;color:#9CA3AF">If this wasn’t you, ignore this.</p>`,
          meta: { source: "lead-form", name, email },
        }),
      });
      setOk(res.ok);
    } catch {
      setOk(false);
    } finally {
      setBusy(false);
      setName(""); setEmail("");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full gap-2 items-stretch bg-white/5 border border-white/10 rounded-xl p-2"
    >
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 bg-transparent px-3 py-2 text-white placeholder-white/50 outline-none"
      />
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-[1.5] bg-transparent px-3 py-2 text-white placeholder-white/50 outline-none"
      />
      <button
        type="submit"
        disabled={busy}
        className="px-4 py-2 rounded-lg bg-brand-yellow text-black font-medium hover:brightness-105 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Notify me"}
      </button>
      {ok !== null && (
        <span className={`ml-2 self-center text-sm ${ok ? "text-emerald-400" : "text-red-400"}`}>
          {ok ? "Added!" : "Oops, try again"}
        </span>
      )}
    </form>
  );
}
