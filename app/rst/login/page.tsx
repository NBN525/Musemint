// app/rst/login/page.tsx
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function Login({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const hasError = searchParams?.error === "1";
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 p-6 bg-black/30 backdrop-blur">
        <div className="flex justify-center mb-4">
          <Image src="/MuseMintLogo.png" alt="MuseMint" width={72} height={72} />
        </div>
        <h1 className="text-xl font-semibold text-center mb-1">Admin login</h1>
        <p className="text-sm text-white/60 text-center mb-6">
          Enter the admin password to access the RST dashboard.
        </p>

        {hasError && (
          <div className="mb-4 text-sm text-red-300/90">
            Incorrect password. Please try again.
          </div>
        )}

        <form method="POST" action="/api/rst/login" className="space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none"
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-yellow text-black font-medium py-2"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
