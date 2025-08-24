export default function Success() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-4xl">✅</div>
      <h1 className="text-2xl font-semibold mb-2">Payment complete</h1>
      <p className="text-white/80 max-w-xl">
        Thanks for your purchase! A receipt is on the way. You’ll also receive
        a welcome email with next steps.
      </p>
      <a
        href="/dashboard"
        className="mt-6 px-4 py-2 rounded-xl bg-brand-yellow/90 hover:bg-brand-yellow text-black font-medium"
      >
        Go to Dashboard
      </a>
    </main>
  );
}
