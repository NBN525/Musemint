// app/store/success/page.tsx
import Link from "next/link";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function SuccessPage({ searchParams }: Props) {
  const sessionId =
    typeof searchParams?.session_id === "string"
      ? searchParams?.session_id
      : "";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Payment received 🎉</h1>
        <p className="opacity-80">
          Thank you for supporting MuseMint. A receipt has been emailed to you.
          Your Stripe session id is:
        </p>
        <code className="block break-all text-xs bg-white/10 p-3 rounded">
          {sessionId || "—"}
        </code>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/rst/dashboard"
            className="rounded-md bg-yellow-400 text-black font-semibold px-4 py-2"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-md border border-white/20 px-4 py-2"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
