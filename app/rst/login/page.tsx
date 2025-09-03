// app/rst/login/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";

export default function AdminLoginPage() {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("rst_admin")?.value === "1";

  if (isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center p-6 bg-[#0a0f12] text-white">
        <div className="text-center space-y-4">
          <p className="text-white/80">You’re already logged in.</p>
          <Link
            href="/rst/dashboard"
            className="px-4 py-2 rounded-lg bg-brand-yellow text-black font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // --- LOGIN FORM (your existing code goes here) ---
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0f12] text-white">
      <div className="max-w-sm w-full space-y-6 bg-black/40 p-6 rounded-xl border border-white/10">
        <h1 className="text-xl font-semibold text-center">Admin Login</h1>
        <form
          method="POST"
          action="/api/rst/login"
          className="space-y-4"
        >
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="w-full px-3 py-2 rounded-md bg-black/60 border border-white/20 focus:outline-none focus:border-brand-yellow"
            required
          />
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-brand-yellow text-black font-medium hover:bg-yellow-400 transition"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  );
}
