export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-white/70 grid md:grid-cols-3 gap-4">
        <div>
          <p className="font-medium text-white">RST Global</p>
          <p className="text-white/60">Operating brand: MuseMint</p>
          <p className="text-white/50 mt-2">© {new Date().getFullYear()} RST Global. All rights reserved.</p>
        </div>
        <div className="flex gap-4">
          <a className="hover:underline" href="/legal/terms">Terms</a>
          <a className="hover:underline" href="/legal/privacy">Privacy</a>
          <a className="hover:underline" href="/refunds">Refunds</a>
          <a className="hover:underline" href="/contact">Contact</a>
        </div>
        <div className="text-white/60">
          <p>Support: <a className="underline" href="mailto:hello@rstglobal.ca">hello@rstglobal.ca</a></p>
          <p>Phone: +1 (343) 453-4071</p>
        </div>
      </div>
    </footer>
  );
}
