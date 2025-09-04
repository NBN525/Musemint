// app/(store)/success/page.tsx
export default function SuccessPage() {
  return (
    <main className="min-h-screen grid place-items-center p-10">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold mb-3">Payment received 🎉</h1>
        <p className="text-white/80">
          Thanks for supporting MuseMint. A receipt has been emailed to you.
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
