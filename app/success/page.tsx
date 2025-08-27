export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold mb-3">🎉 Thank you!</h1>
      <p className="text-white/80">
        Your purchase is complete. A receipt has been sent to your email.
      </p>
      <a href="/" className="mt-6 underline">Back to home</a>
    </main>
  );
}
