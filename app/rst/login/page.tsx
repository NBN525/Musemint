export const dynamic = "force-dynamic";
export default function Portal() {
  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b0f14] p-6">
        <h1 className="text-2xl font-semibold">Customer Portal</h1>
        <p className="mt-2 text-white/70">
          Manage your purchases and billing. Coming soon — we’ll connect this to
          Stripe Customer Portal.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 border border-white/15 hover:bg-white/5 transition"
        >
          Back to site
        </a>
      </div>
    </main>
  );
}
