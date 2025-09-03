// app/layout.js
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MuseMint — by RST Global",
  description: "Smart tools & templates for digital planners and business growth.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ai.rstglobal.ca"),
  openGraph: {
    title: "MuseMint — by RST Global",
    description: "Smart tools & templates for digital planners and business growth.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ai.rstglobal.ca",
    siteName: "MuseMint",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-[#0a0f12] text-white antialiased selection:bg-brand-yellow/50">
        <div className="min-h-screen flex flex-col">
          {/* Optional top bar – keep minimal */}
          <header className="w-full px-4 py-3 border-b border-white/10 bg-black/20">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight">
                MuseMint
              </Link>
              <nav className="flex items-center gap-4 text-sm text-white/80">
                <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
                <Link href="/support" className="hover:text-white">Support</Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="w-full px-4 py-6 border-t border-white/10 bg-black/20">
            <div className="max-w-6xl mx-auto text-xs text-white/60">
              © {new Date().getFullYear()} RST Global. All rights reserved.
            </div>
          </footer>
        </div>

        {/* GA4 (safe no-op if NEXT_PUBLIC_GA_ID not set) */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
