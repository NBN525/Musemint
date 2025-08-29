// app/success/page.tsx
import Link from "next/link";

export default function Success() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center rounded-2xl border border-green-400/30 bg-green-400/10 p-8">
        <h1 className="text-2xl font-semibold mb-2">Payment received 🎉</h1>
        <p className="text-white/80">
          Thanks for supporting MuseMint. Your receipt has been sent by email. If you don’t
          see it, check spam or contact{" "}
          <a className="underline" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-white text-black font-medium">
            Go to Dashboard
          </Link>
          <Link href="/" className="px-4 py-2 rounded-xl border border-white/30">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
