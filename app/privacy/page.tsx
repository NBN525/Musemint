export const dynamic = "force-dynamic";
export default function Privacy() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-white/70">
          We collect only what we need to process orders, deliver products, and
          provide support. We never sell personal data. Email{" "}
          <a className="underline" href="mailto:support@rstglobal.ca">
            support@rstglobal.ca
          </a>{" "}
          for any request.
        </p>
      </div>
    </main>
  );
}
