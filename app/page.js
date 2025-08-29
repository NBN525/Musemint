import Image from "next/image";
import BuyButton from "./components/BuyButton";
import LeadForm from "./components/LeadForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo only (no duplicate wordmark) */}
      <div className="mb-6">
        <Image
          src="/MuseMintLogo.png"
          alt="MuseMint"
          width={140}
          height={140}
          priority
        />
      </div>

      {/* Keep heading for SEO but hide visually (prevents ‘MuseMint’ twice) */}
      <h1 className="sr-only">MuseMint — smart tools & templates</h1>

      <p className="mb-8 text-center text-sm md:text-base text-white/85">
        Smart tools &amp; templates for digital planners and business growth —
        by <span className="text-brand-teal font-medium">RST Global</span>.
      </p>

      <div className="mb-10 flex gap-3 justify-center">
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition"
        >
          Open Dashboard
        </a>
        <BuyButton label="Buy Now" />
        <a
          href="mailto:hello@rstglobal.ca"
          className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition"
        >
          Contact
        </a>
      </div>

      <p className="mb-2 text-lg font-medium">Get early access &amp; updates:</p>
      <div className="w-full max-w-3xl">
        <LeadForm />
      </div>

      <p className="mt-8 text-xs text-white/50">
        We respect your inbox. Unsubscribe anytime.
      </p>
    </main>
  );
}
