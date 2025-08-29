// app/cancel/page.tsx
import Link from "next/link";

export default function Cancel() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center rounded-2xl border border-white/20 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold mb-2">Checkout canceled</h1>
        <p className="text-white/80">
          No charge was made. You can resume your purchase anytime.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="px-4 py-2 rounded-xl bg-brand-yellow text-black font-medium">
            Try again
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl border border-white/30">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
