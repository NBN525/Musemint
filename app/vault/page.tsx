// app/vault/page.tsx
"use client";
import { useState } from "react";

export default function VaultPage() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setMsg(null);
    if (!title.trim()) { setMsg("Title is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/vault/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          source: "vault-ui"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed");
      setMsg("Saved to Vault ✅");
      setTitle(""); setNotes(""); setTags("");
    } catch (e: any) {
      setMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Vault — Add Idea</h1>
        <input
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
          placeholder="Idea title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 h-32 outline-none focus:border-white/25"
          placeholder="Notes / details"
          value={notes}
          onChange={e=>setNotes(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
          placeholder="tags, comma,separated"
          value={tags}
          onChange={e=>setTags(e.target.value)}
        />
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save to Vault"}
        </button>
        {msg && <p className="text-sm text-white/80">{msg}</p>}
      </div>
    </main>
  );
}
