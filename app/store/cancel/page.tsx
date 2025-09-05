// app/store/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Checkout canceled</h1>
        <p className="opacity-80">
          No charge was made. You can try again anytime.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/store/checkout"
            className="rounded-md bg-yellow-400 text-black font-semibold px-4 py-2"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="rounded-md border border-white/20 px-4 py-2"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
