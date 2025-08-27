export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold mb-3">Order cancelled</h1>
      <p className="text-white/80">No charge was made. You can try again anytime.</p>
      <a href="/checkout" className="mt-6 underline">Return to checkout</a>
    </main>
  );
}
