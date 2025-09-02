import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="opacity-70 mb-6">Let’s get you back on track.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="rounded-md px-4 py-2 bg-yellow-400 text-black font-medium">
            Home
          </Link>
          <Link href="/rst/dashboard" className="rounded-md px-4 py-2 border border-white/20">
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
