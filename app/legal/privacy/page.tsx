export const metadata = { title: "Privacy — RST Global / MuseMint" };

export default function Privacy() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>
      <p className="text-white/80 mb-4">
        We respect your privacy. This page explains what we collect and how we use it.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data We Collect</h2>
      <ul className="list-disc ml-5 text-white/70">
        <li>Contact details from forms or purchases</li>
        <li>Payment metadata via Stripe (we don’t store card numbers)</li>
        <li>Basic usage analytics (aggregate only)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Data</h2>
      <ul className="list-disc ml-5 text-white/70">
        <li>Deliver purchases and product updates</li>
        <li>Support and transactional communications</li>
        <li>Improve products and site performance</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data Sharing</h2>
      <p className="text-white/70">Only with trusted processors (e.g., Stripe, Resend) to fulfill services.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <p className="text-white/70">Email us to access, correct, or delete your data.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-white/70"><a className="underline" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a></p>
    </main>
  );
}
