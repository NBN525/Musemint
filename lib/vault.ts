// lib/vault.ts
export type VaultInput = {
  title: string;
  one_liner?: string;
  wedge?: string;
  v1?: string;
  pricing?: string;
  kpis?: string[] | string;
  risks?: string;
  ao_score?: number;
  exp_score?: number;
  category?: string;
  region?: string;
  status?: "New" | "Watching" | "Prototype" | "Live" | "Paused" | string;
  source?: string;
  tags?: string[] | string;
  notes?: string;
  reassess_reason?: string;
  added_by?: string;
  idea_id?: string;
};

export async function addToVault(payload: VaultInput) {
  const res = await fetch("/api/vault/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Vault add failed");
  return data;
    }
