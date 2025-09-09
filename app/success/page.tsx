// app/success/page.tsx
export const dynamic = "force-dynamic"; // avoid static pre-render issues

export default function SuccessPage() {
  const downloadUrl = process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL || "";
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-semibold">Thanks for your purchase! 🎉</h1>
        <p className="text-white/70">
          Your order is confirmed. We’ve also emailed a receipt.
        </p>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
          >
            Download your product
          </a>
        ) : (
          <p className="text-sm text-white/60">
            Download link isn’t configured yet. Add{" "}
            <code className="bg-white/10 px-1 py-0.5 rounded">
              NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL
            </code>{" "}
            in Vercel envs.
          </p>
        )}

        <p className="text-xs text-white/50">
          Need help? Email support@rstglobal.ca
        </p>
      </div>
    </main>
  );
}
