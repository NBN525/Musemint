// app/cancel/page.tsx
export const dynamic = "force-static";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10">
      <h1 className="text-2xl font-semibold mb-2">Checkout cancelled</h1>
      <p className="text-white/80 text-center max-w-prose">
        No worries—your card wasn’t charged. You can try again any time.
      </p>
      <a href="/" className="mt-6 underline">Back to home</a>
    </main>
  );
}
