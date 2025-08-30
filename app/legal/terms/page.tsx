export const metadata = { title: "Terms — RST Global / MuseMint" };

export default function Terms() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Terms of Service</h1>
      <p className="text-white/80 mb-4">
        Welcome to MuseMint, an operating brand of RST Global. By accessing our site
        and purchasing digital products, you agree to these Terms.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Products</h2>
      <p className="text-white/70">Digital templates, dashboards, and tools delivered electronically.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. License</h2>
      <p className="text-white/70">
        Single-buyer license. No resale, redistribution, or public sharing without written permission.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Payments</h2>
      <p className="text-white/70">Handled securely by Stripe. Prices may change.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Refunds</h2>
      <p className="text-white/70">
        See our <a className="underline" href="/refunds">Refund Policy</a> for details.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Support</h2>
      <p className="text-white/70">Email <a className="underline" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes</h2>
      <p className="text-white/70">We may update these Terms; continued use means acceptance.</p>
    </main>
  );
}
