// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "RST Global",
  description: "Internal tools & dashboards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
