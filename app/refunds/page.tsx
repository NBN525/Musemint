export const metadata = { title: "Refund Policy — RST Global / MuseMint" };

export default function Refunds() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Refund Policy</h1>
      <p className="text-white/80 mb-4">
        We want you to be confident in your purchase. If the product isn’t as described or you
        encounter an issue we can’t resolve, contact us within 14 days for a refund consideration.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">How to Request</h2>
      <ol className="list-decimal ml-5 text-white/70">
        <li>Email <a className="underline" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a> with your order email and reason.</li>
        <li>We’ll respond within 2 business days with next steps.</li>
      </ol>
      <p className="text-white/60 mt-6 text-sm">
        Note: Digital downloads are generally non-returnable, but we’ll make it right if something’s off.
      </p>
    </main>
  );
}
