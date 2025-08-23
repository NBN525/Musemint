export default function CancelPage() {
  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold">Payment canceled</h1>
      <p className="text-slate-500 mt-2">
        No charge was made. If you had issues checking out, try again or contact support.
      </p>
      <a href="/" className="inline-flex mt-6 rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50">
        Back to home
      </a>
    </main>
  );
}
