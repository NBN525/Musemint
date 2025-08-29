export default function Privacy() {
  return (
    <main className="prose prose-invert max-w-3xl mx-auto px-6 py-10">
      <h1>Privacy Policy</h1>
      <p>We collect only what’s needed to process orders (name, email) via Stripe & Resend.
      We don’t sell data. Requests: <a href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.</p>
      <h2>Processors</h2>
      <ul>
        <li>Stripe (payments)</li>
        <li>Resend (transactional email)</li>
        <li>Vercel (hosting)</li>
        <li>Google (sheets logging)</li>
      </ul>
      <p>Last updated: {new Date().toISOString().slice(0,10)}</p>
    </main>
  );
}
