import LeadForm from "./components/LeadForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="mb-8 flex justify-center">
        <div className="h-24 w-24 rounded-full ring-8 ring-amber-400/80 flex items-center justify-center">
          <span className="text-4xl">✨</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4">MuseMint</h1>
      <p className="mb-6 text-center">
        Smart tools & templates for digital planners and business growth — by RST Global.
      </p>

      <div className="mb-10 flex gap-4 justify-center">
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-amber-400/90 text-black font-medium"
        >
          Open Dashboard
        </a>
        <a
          href="mailto:hello@rstglobal.ca"
          className="px-4 py-2 rounded-xl border border-white/20"
        >
          Contact
        </a>
      </div>

      <p className="mb-4 text-lg font-medium">Get early access & updates:</p>
      <LeadForm />
    </main>
  );
}
