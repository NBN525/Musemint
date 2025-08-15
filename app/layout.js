export const metadata = { title: "MuseMint", description: "Design-led digital products by RST Global" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">{children}</body>
    </html>
  );
}
