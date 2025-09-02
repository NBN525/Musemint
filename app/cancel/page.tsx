import Link from "next/link";
export default function CancelPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold mb-2">Checkout canceled</h1>
        <p className="opacity-70 mb-6">No charge was made.</p>
        <Link href="/" className="rounded-md px-4 py-2 bg-yellow-400 text-black font-medium">
          Try again
        </Link>
      </div>
    </main>
  );
}
