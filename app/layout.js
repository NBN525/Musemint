import "./globals.css";

export const metadata = {
  title: "MuseMint",
  description:
    "Smart tools & templates for digital planners and business growth — by RST Global.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
