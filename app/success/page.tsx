export const dynamic = "force-static";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Payment received 🎉</h1>
        <p className="text-white/80">
          Thanks for supporting MuseMint. Your receipt has been sent by email. If you
          don’t see it, check spam or contact{" "}
          <a className="underline" href="mailto:hello@rstglobal.ca">
            hello@rstglobal.ca
          </a>.
        </p>

        {/* If you add a download/fulfillment link later, drop it here */}

        <div className="mt-6 flex gap-3">
          <a
            href="/"
            className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition"
          >
            Home
          </a>
        </div>
      </div>
    </main>
  );
}
