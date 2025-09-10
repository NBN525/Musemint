// app/page.tsx
"use client";

import Link from "next/link";

const PRODUCT_NAME =
  process.env.NEXT_PUBLIC_PRODUCT_NAME || "Startup Planner Pro";
const PRODUCT_PRICE =
  process.env.NEXT_PUBLIC_PRODUCT_PRICE || "49";
const PRODUCT_CURRENCY =
  process.env.NEXT_PUBLIC_PRODUCT_CURRENCY || "USD";
const BUY_URL =
  process.env.NEXT_PUBLIC_BUY_URL || "/#buy";
const BADGE =
  process.env.NEXT_PUBLIC_BADGE || "Launch • 50% OFF";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />
      <Hero />
      <Logos />
      <Benefits />
      <FeatureGrid />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );

  function Nav() {
    return (
      <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-semibold tracking-tight">{PRODUCT_NAME}</span>
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80"
            >
              Features
            </a>
            <a
              href="#how"
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80"
            >
              FAQ
            </a>
            <a
              href={BUY_URL}
              className="ml-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
            >
              Buy {PRODUCT_NAME} — {PRODUCT_CURRENCY} {PRODUCT_PRICE}
            </a>
          </nav>
        </div>
      </header>
    );
  }

  function Hero() {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
            {BADGE}
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            Build with clarity. <br />
            <span className="text-white/80">
              A premium planner built for modern founders.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/70">
            Replace messy spreadsheets with a fast, automated planning suite:
            real-time revenue, cashflow, CRM, goals, and daily email digests —
            all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href={BUY_URL}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
            >
              Get {PRODUCT_NAME} — {PRODUCT_CURRENCY} {PRODUCT_PRICE}
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-white/15 hover:bg-white/5 transition"
            >
              See what’s inside
            </a>
          </div>

          {/* Preview card */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#0b0f14] p-4">
            <div className="aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-white/5 to-white/0 grid place-items-center">
              <div className="text-center">
                <div className="text-sm uppercase tracking-widest text-white/50 mb-2">
                  Live Dashboard
                </div>
                <div className="text-4xl font-semibold">
                  Revenue · Orders · AOV · Runway
                </div>
                <p className="mt-2 text-white/60">
                  Investor-ready visuals. Zero setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function Logos() {
    return (
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 place-items-center text-white/40">
          <span>Stripe</span>
          <span>Etsy</span>
          <span>Payhip</span>
          <span>Google Sheets</span>
        </div>
      </section>
    );
  }

  function Benefits() {
    const items = [
      {
        title: "Real-time clarity",
        desc:
          "Live KPIs for revenue, orders, burn rate, and runway. No more manual crunching.",
      },
      {
        title: "Automations included",
        desc:
          "Stripe/Etsy/Payhip friendly. Daily digest emails and goals tracking built-in.",
      },
      {
        title: "Founder-first design",
        desc:
          "Clean, keyboard-friendly layout with quick-add actions and a command palette.",
      },
    ];
    return (
      <section id="features" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Everything you need to run a lean startup
          </h2>
          <p className="mt-2 text-white/70 max-w-2xl">
            From first sale to fundraising, {PRODUCT_NAME} gives you the numbers
            and systems that actually move the business.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {items.map((it) => (
              <div
                key={it.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="text-yellow-400">◆</div>
                <div className="mt-2 font-medium">{it.title}</div>
                <div className="mt-1 text-white/70 text-sm">{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function FeatureGrid() {
    const rows = [
      {
        k: "Smart Dashboard",
        v: "Revenue, Orders, AOV, Burn, Runway, Goal health, and 7-day trends.",
      },
      {
        k: "Cashflow + Forecast",
        v: "Automatic runway and break-even based on real inputs.",
      },
      {
        k: "CRM + Tasks",
        v: "Track leads, deals, next steps, and founder priorities.",
      },
      {
        k: "Multi-channel",
        v: "Works great with Stripe, Etsy, Payhip. Add others easily.",
      },
      {
        k: "Email Digests",
        v: "Daily/weekly summaries to your inbox. Stay on top of the KPIs.",
      },
      {
        k: "Goal Tracking",
        v: "Declare targets and see instant progress with health colors.",
      },
    ];
    return (
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#0b0f14] p-6">
              <div className="text-sm uppercase tracking-widest text-white/50">
                Inside the product
              </div>
              <h3 className="mt-2 text-2xl font-semibold">
                A planning system that answers real questions
              </h3>
              <ul className="mt-4 space-y-2 text-white/80">
                {rows.map((r) => (
                  <li key={r.k} className="flex gap-3">
                    <span className="text-yellow-400">■</span>
                    <div>
                      <div className="font-medium">{r.k}</div>
                      <div className="text-white/70 text-sm">{r.v}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="h-full grid place-items-center text-center">
                <div>
                  <div className="text-sm uppercase tracking-widest text-white/60">
                    Preview
                  </div>
                  <div className="mt-2 text-3xl font-semibold">
                    Clean visuals. Zero clutter.
                  </div>
                  <p className="mt-2 text-white/70">
                    Works beautifully on desktop and mobile. Built for speed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function HowItWorks() {
    const steps = [
      {
        t: "Buy & get instant access",
        d: "Secure checkout. You’ll receive your download + setup guide by email.",
      },
      {
        t: "One-time 5-minute setup",
        d: "Open the file, click Setup, paste two links — you’re live.",
      },
      {
        t: "See real KPIs, daily",
        d: "Your dashboard updates with every sale. Daily summary in your inbox.",
      },
    ];
    return (
      <section id="how" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h3 className="text-3xl font-semibold">How it works</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div
                key={s.t}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="text-5xl leading-none text-white/20">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 font-medium">{s.t}</div>
                <div className="text-white/70 text-sm mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function SocialProof() {
    const quotes = [
      {
        q: "This replaced three spreadsheets and a Notion board. Finally feel on top of the numbers.",
        a: "Indie founder",
      },
      {
        q: "Our investors asked for a monthly snapshot — this sends it every morning.",
        a: "Pre-seed startup",
      },
      {
        q: "It’s the first planner that actually pushes me to act. The runway tile is genius.",
        a: "Solo builder",
      },
    ];
    return (
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h3 className="text-3xl font-semibold">Loved by lean teams</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {quotes.map((t) => (
              <div
                key={t.q}
                className="rounded-2xl border border-white/10 bg-[#0b0f14] p-5"
              >
                <div className="text-white/90">{t.q}</div>
                <div className="mt-3 text-white/50 text-sm">— {t.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function FAQ() {
    const items = [
      {
        q: "What exactly do I receive?",
        a: "A premium Google Sheets workspace and setup guide. It includes the dashboard, transactions, CRM, cashflow, goals, tasks, and webhooks.",
      },
      {
        q: "Does it work with Stripe / Etsy / Payhip?",
        a: "Yes. The template is channel-friendly and includes a webhook endpoint + quick import for CSVs.",
      },
      {
        q: "Do I get updates?",
        a: "Yes — lifetime updates. You’ll get an email when new versions ship.",
      },
      {
        q: "Can I use it for multiple projects?",
        a: "Your license is for you/your company. Duplicate for internal projects as needed.",
      },
    ];
    return (
      <section id="faq" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h3 className="text-3xl font-semibold">FAQ</h3>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {items.map((it) => (
              <div
                key={it.q}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="font-medium">{it.q}</div>
                <div className="text-white/70 mt-2">{it.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function CTA() {
    return (
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h3 className="text-3xl md:text-4xl font-semibold">
            Ready to plan like a pro?
          </h3>
          <p className="mt-2 text-white/70">
            Join early adopters building with clarity — not chaos.
          </p>
          <div className="mt-6">
            <a
              href={BUY_URL}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-yellow-400 text-black font-medium hover:brightness-110 transition"
            >
              Get {PRODUCT_NAME} — {PRODUCT_CURRENCY} {PRODUCT_PRICE}
            </a>
          </div>
          <p className="mt-3 text-xs text-white/50">
            Instant access · Lifetime updates · Premium support
          </p>
        </div>
      </section>
    );
  }

  function Footer() {
    return (
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/60 flex flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-between">
          <div>© {new Date().getFullYear()} {PRODUCT_NAME}</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href="#faq">FAQ</a>
            <Link className="hover:text-white" href="/rst/login">Customer Portal</Link>
          </div>
        </div>
      </footer>
    );
  }
}
