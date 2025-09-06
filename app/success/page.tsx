import Link from "next/link";
import { PRODUCT } from "../../lib/config"; // ← up one to /lib

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Payment received 🎉</h1>
        <p className="text-white/80">
          Thanks for supporting {PRODUCT.name || "our work"}.
          We emailed your receipt and links. If you don’t see it, check spam or contact{" "}
          <a className="underline" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a>.
        </p>
        <div className="space-y-2 text-left bg-white/5 border border-white/10 p-4 rounded-xl">
          <p className="font-medium">Download your purchase:</p>
          <ul className="list-disc pl-5 text-white/80">
            <li>Notion template link (coming soon)</li>
            <li>Google Sheets pack (coming soon)</li>
            <li>PDF bundle (coming soon)</li>
          </ul>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="rounded-xl px-4 py-2 bg-yellow-400 text-black font-medium">
            Home
          </Link>
          <Link href="/rst/login" className="rounded-xl px-4 py-2 border border-white/15">
            Open Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
    }
