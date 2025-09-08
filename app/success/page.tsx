// app/success/page.tsx
"use client";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-green-400">🎉 Payment Successful!</h1>
        <p className="text-lg text-white/80">
          Thank you for your purchase. Your product is ready below.
        </p>

        {/* Replace this link with your Google Drive link */}
        <a
          href="https://drive.google.com/YOUR_PRODUCT_LINK"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-semibold hover:brightness-110 transition"
        >
          ⬇️ Download Your Product
        </a>

        <p className="text-sm text-white/60">
          We’ve also emailed you this link. If you don’t see it, please check your spam folder.
        </p>
      </div>
    </main>
  );
}
