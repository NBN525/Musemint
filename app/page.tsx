import Image from "next/image";
import dynamic from "next/dynamic";

const ProductCTA = dynamic(() => import("./components/ProductCTA"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-6 py-10">
      {/* Logo */}
      <div className="mb-5">
        <Image
          src="/MuseMintLogo.png"
          alt="MuseMint"
          width={140}
          height={140}
          priority
        />
      </div>

      {/* Accessible H1 for SEO (kept visually clean) */}
      <h1 className="sr-only">MuseMint Premium Planner — by RST Global</h1>

      <p className="mb-8 text-center text-sm md:text-base text-white/85">
        Smart tools &amp; templates for disciplined growth — by{" "}
        <span className="text-brand-teal font-medium">RST Global</span>.
      </p>

      {/* Product block */}
      <ProductCTA />

      {/* Footer micro-nav */}
      <div className="mt-10 flex gap-4 text-sm text-white/70">
        <a className="underline" href="/cancel">Refund policy</a>
        <a className="underline" href="mailto:hello@rstglobal.ca">Support</a>
      </div>
    </main>
  );
}
