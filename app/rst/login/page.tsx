"use client";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const returnTo = params.get("returnTo") || "/rst/dashboard";

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form
        method="POST"
        action="/rst/login"
        className="w-full max-w-sm space-y-4 rounded-xl border border-white/15 p-6"
      >
        <h1 className="text-lg font-semibold">RST Admin Login</h1>
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md bg-black/20 border border-white/15 p-2"
            placeholder="Enter admin password"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-brand-yellow text-black font-medium py-2"
        >
          Sign in
        </button>
        <p className="text-xs text-white/60">
          Tip: set <code>DASHBOARD_PASSWORD</code> in Vercel env vars.
        </p>
      </form>
    </main>
  );
}
