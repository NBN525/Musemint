// app/layout.tsx
import './globals.css'; // keep if you have it; remove if not

export const metadata = {
  title: 'MuseMint / RST Global',
  description: 'RST Global apps and dashboards',
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
