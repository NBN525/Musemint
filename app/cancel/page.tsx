import Link from "next/link";

export const metadata = {
  title: "Checkout canceled — MuseMint",
};

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          Checkout canceled
        </h1>
        <p className="text-white/85 mb-6">
          No worries—your card was not charged. If you had trouble with the payment
          method, you can try again or contact us and we’ll help.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-brand-yellow text-black font-semibold hover:opacity-90"
          >
            Return to site
          </Link>
          <a
            href="mailto:hello@rstglobal.ca?subject=Payment%20help"
            className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40"
          >
            Get help
          </a>
        </div>
      </div>
    </main>
  );
}
