import Link from "next/link";

export const metadata = {
  title: "Payment received — MuseMint",
};

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          ✅ Payment received — thank you!
        </h1>
        <p className="text-white/85 mb-6">
          You’ll receive a receipt via email shortly. If you don’t see it,
          check spam and mark <span className="font-mono">hello@rstglobal.ca</span> as safe.
          We’ve also logged your purchase for support and future updates.
        </p>

        <div className="rounded-xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="font-medium mb-2">What happens next?</h2>
          <ul className="list-disc ml-5 space-y-1 text-white/85 text-sm">
            <li>We’ll send your **download / access instructions** by email.</li>
            <li>You’ll get **free updates** for the MuseMint v1 branch.</li>
            <li>Need help? Reply to the receipt or email <span className="font-mono">hello@rstglobal.ca</span>.</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-brand-yellow text-black font-semibold hover:opacity-90"
          >
            Back to site
          </Link>
          <a
            href="mailto:hello@rstglobal.ca?subject=MuseMint%20Purchase%20Support"
            className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40"
          >
            Contact support
          </a>
        </div>
      </div>
    </main>
  );
}
