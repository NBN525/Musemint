// app/rst/layout.tsx
export const metadata = {
  title: "RST · Admin",
};

export default function RstSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
