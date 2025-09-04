// app/(store)/cancel/page.tsx
export default function CancelPage() {
  return (
    <main className="min-h-screen grid place-items-center p-10">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold mb-3">Checkout canceled</h1>
        <p className="text-white/80">
          No charge was made. You can try again any time.
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-4 py-2 rounded-xl border border-white/25 hover:border-white/50"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
