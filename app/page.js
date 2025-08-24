import Image from "next/image";
import LeadForm from "./components/LeadForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/MuseMintLogo.png"
          alt="MuseMint"
          width={120}
          height={120}
          priority
          className="rounded-full"
        />
      </div>

      {/* Headline */}
      <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
        MuseMint
      </h1>
      <p className="mb-8 text-center text-sm md:text-base opacity-90">
        Smart tools &amp; templates for digital planners and business growth —
        by <span className="text-brand-teal font-medium">RST Global</span>.
      </p>

      {/* Actions */}
      <div className="mb-10 flex gap-3 justify-center">
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-brand-yellow/90 hover:bg-brand-yellow text-black font-medium transition"
        >
          Open Dashboard
        </a>
        <a
          href="mailto:hello@rstglobal.ca"
          className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition"
        >
          Contact
        </a>
      </div>

      {/* Lead form */}
      <p className="mb-2 text-lg font-medium">Get early access &amp; updates:</p>
      <div className="w-full max-w-3xl">
        <LeadForm />
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-white/50">
        We respect your inbox. Unsubscribe anytime.
      </p>
    </main>
  );
}
