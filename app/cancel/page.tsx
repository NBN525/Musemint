export default function Cancel() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-4xl">🛑</div>
      <h1 className="text-2xl font-semibold mb-2">Checkout cancelled</h1>
      <p className="text-white/80 max-w-xl">
        No charge was made. If you had trouble, try again or contact us:
        <a className="underline ml-1" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.
      </p>
      <a
        href="/"
        className="mt-6 px-4 py-2 rounded-xl border border-white/20 hover:border-white/40"
      >
        Back to home
      </a>
    </main>
  );
}
