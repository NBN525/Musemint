export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full ring-4 ring-amber-400/80 flex items-center justify-center">
          <span className="text-3xl">🌿</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold">MuseMint</h1>
        <p className="mt-3 text-white/70">Design-led digital planners & templates by RST Global.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <a href="/dashboard" className="px-4 py-2 rounded-xl bg-amber-400/90 text-black font-medium">Open Dashboard</a>
          <a href="mailto:hello@rstglobal.ca" className="px-4 py-2 rounded-xl border border-white/20">Contact</a>
        </div>
      </div>
    </main>
  );
}
