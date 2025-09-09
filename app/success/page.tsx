// app/success/page.tsx
import { env } from "@/lib/config";

export const dynamic = "force-dynamic";

async function getSession(session_id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/stripe/session?session_id=${session_id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function SuccessPage({ searchParams }: { searchParams: { [k: string]: string } }) {
  const e = env();
  const sessionId = searchParams?.session_id;
  const session = sessionId ? await getSession(sessionId) : null;

  const amount = session?.amount ? (session.amount / 100).toFixed(2) : e.launchPrice.toFixed(2);
  const currency = (session?.currency || e.currency).toUpperCase();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-semibold text-green-400">🎉 Thanks for your purchase!</h1>
        <p className="text-white/80">
          You’ve unlocked <b>{e.productName}</b>{session?.email ? <> for <span className="text-white">{session.email}</span></> : null}.
        </p>

        <div className="grid gap-2 place-items-center">
          <a
            href={e.downloadUrl}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
          >
            ⬇️ Download Your Planner
          </a>
          <p className="text-xs text-white/60">If the button doesn’t work, copy this link: {e.downloadUrl}</p>
        </div>

        <div className="text-white/70">
          <div><b>Amount:</b> {currency} {amount}</div>
          <div><b>Order:</b> {sessionId || "—"}</div>
        </div>

        <p className="text-sm text-white/60">
          Launch buyers get <b>{currency} {e.launchPrice.toFixed(2)}</b>. Standard price is {currency} {e.listPrice.toFixed(2)}.
        </p>
      </div>
    </main>
  );
      }
