import Link from "next/link";
import { ArrowRight, Check, X, Cloud, FileText, Zap, Users } from "lucide-react";
import MarketingHeader from "./components/marketing-header";
import Reveal from "./components/reveal";

export default function LandingPage() {
  return (
    <div>
      <MarketingHeader />
      <Hero />
      <SocialProof />
      <LogoStrip />
      <HowItWorks />
      <WhatItIsnt />
      <UseCases />
      <FAQ />
      <BottomCTA />
      <Footer />
    </div>
  );
}

// MarketingHeader replaces the old Nav component for consistency with the app shell

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* elevated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute left-[10%] top-[15%] h-64 w-64 glow-spot" />
        <div className="absolute right-[5%] top-[35%] h-80 w-80 glow-spot" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Built for solo founders who ship
          </div>

          <h1 className="font-display text-5xl font-semibold tracking-tight text-text sm:text-6xl lg:text-7xl">
            Track it. Build it.
            <br />
            <span className="bg-gradient-to-r from-accent to-cyan-600 bg-clip-text text-transparent">
              Share it.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
            The progress log for people who build things. Track every idea, document your infra stack, and share curated portfolios—without the bloat of project management tools.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]"
            >
              Start tracking for free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-base font-semibold text-text shadow-sm transition-all hover:border-border-strong hover:shadow-md active:scale-[0.98]"
            >
              See how it works
            </a>
          </div>

          <p className="mt-6 text-xs text-text-muted">
            No credit card required · Start building your log in 30 seconds
          </p>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { label: "Ideas tracked", value: "10,000+" },
    { label: "Services documented", value: "12 categories" },
    { label: "Share profiles", value: "Unlimited" },
    { label: "Time to first idea", value: "< 30 sec" },
  ];

  return (
    <section className="border-b border-border bg-surface-2/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-text sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const logos = [
    { name: "Pioneer", width: 84 },
    { name: "Monarch", width: 88 },
    { name: "Orbit", width: 64 },
    { name: "Raindrop", width: 92 },
    { name: "Nova", width: 56 },
  ];

  return (
    <section className="border-b border-border bg-bg/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-text-muted">
          Trusted by independent builders
        </p>
        <div className="grid grid-cols-3 items-center justify-items-center gap-6 opacity-70 sm:grid-cols-5">
          {logos.map((l) => (
            <div
              key={l.name}
              className="flex h-8 items-center justify-center text-text-muted"
              style={{ width: l.width }}
              aria-label={l.name}
              title={l.name}
            >
              <span className="font-display text-sm font-semibold tracking-tight">
                {l.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-bg scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            From spark to shipped
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            Four steps. No rigid frameworks. Prodlog adapts to how you actually work.
          </p>
        </div>

        {/* Visual flow */}
        <Reveal className="mb-8 flex items-center justify-center gap-3 overflow-x-auto pb-4 sm:gap-4">
          {["Capture", "Log progress", "Document infra", "Share"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 sm:gap-4">
              <div className="flex min-w-[140px] flex-col items-center gap-2 sm:min-w-[160px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-accent bg-accent/10 font-display text-lg font-bold text-accent">
                  {i + 1}
                </div>
                <span className="text-center text-xs font-semibold text-text sm:text-sm">
                  {step}
                </span>
              </div>
              {i < 3 && <ArrowRight size={20} className="shrink-0 text-border-strong" />}
            </div>
          ))}
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Capture an idea",
              desc: "Drop it into your inbox in 10 seconds. Title, one-liner, done. Every idea starts somewhere.",
              icon: <Zap size={20} />,
            },
            {
              step: "02",
              title: "Log your progress",
              desc: "Track mood, note what you shipped, keep momentum visible. Look back and see how far you've come.",
              icon: <FileText size={20} />,
            },
            {
              step: "03",
              title: "Document your stack",
              desc: "Which Supabase account? Which free tier? Never forget where your 10 projects actually live.",
              icon: <Cloud size={20} />,
            },
            {
              step: "04",
              title: "Share portfolios",
              desc: "Pick which ideas to show. Control what's visible. Send one link to a mentor, client, or grant reviewer.",
              icon: <Users size={20} />,
            },
          ].map((item) => (
            <Reveal
              key={item.step}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                {item.icon}
              </div>
              <div className="mb-2 font-display text-xs font-bold text-text-muted">STEP {item.step}</div>
              <h3 className="mb-2 text-base font-semibold text-text">{item.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{item.desc}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="font-display text-sm font-medium italic text-text-secondary">
            Track it. Build it. Share it.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItIsnt() {
  return (
    <section className="border-b border-border bg-surface-2/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Not another PM tool
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary">
            Prodlog is peer-to-peer documentation. No sprints, no Gantt charts, no performance reviews.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/30 p-8">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-rose-700">
              <X size={18} />
              What it isn't
            </div>
            <ul className="space-y-3">
              {[
                "Sprint planning and velocity tracking",
                "Team dashboards you need to keep updated",
                "Gantt charts and dependency graphs",
                "Feature request voting systems",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <X size={16} className="mt-0.5 shrink-0 text-rose-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-8">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
              <Check size={18} />
              What it is
            </div>
            <ul className="space-y-3">
              {[
                "A lightweight log for solo builders",
                "Progress notes you actually want to write",
                "Infrastructure documentation you'll reference later",
                "Shareable portfolios for mentors and clients",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section id="use-cases" className="border-b border-border bg-bg scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Use cases</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Built for how you work
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Solo founders",
              desc: "Track 5 ideas in parallel. Document which free tiers you're burning through. Share progress with mentors.",
            },
            {
              title: "Researchers",
              desc: "Log experiments, document datasets, track preprints. Link DOIs and journal submissions.",
            },
            {
              title: "Writers",
              desc: "Track essays, drafts, and publications. Note submission status and where each piece lives.",
            },
            {
              title: "Grant applicants",
              desc: "Curate a portfolio showing only shipped projects. Control what reviewers see.",
            },
            {
              title: "Indie hackers",
              desc: "Document your SaaS stack, track conviction over time, share your build-in-public journey.",
            },
            {
              title: "Portfolio builders",
              desc: "One shareable link with 3 best projects. Hide the rest. Perfect for client pitches.",
            },
          ].map((use) => (
            <Reveal
              key={use.title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
            >
              <div className="mb-3 h-8 w-8 rounded-lg bg-accent/10" aria-hidden="true" />
              <h3 className="mb-2 text-base font-semibold text-text">{use.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{use.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-bg to-surface-2/50">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/20">
          <span className="font-display text-2xl font-bold text-white">p</span>
        </div>

        <h2 className="font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Start logging your ideas
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
          The ones you never write down are the ones that quietly disappear.
          <br />
          <span className="font-medium text-text">Ten seconds to capture. A lifetime to build.</span>
        </p>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-accent/30 transition-all hover:bg-accent-hover hover:shadow-2xl hover:shadow-accent/40 active:scale-[0.98]"
          >
            Open your log
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="mt-6 text-xs text-text-muted">Free to start · No credit card · Takes 30 seconds</p>

        <div className="mt-16 border-t border-border pt-8">
          <p className="font-display text-sm font-medium italic text-text-muted">Track it. Build it. Share it.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-sm font-semibold text-white">
                p
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-text">prodlog</span>
            </div>
            <p className="max-w-sm text-sm text-text-secondary">
              The progress log for solo founders. Track it. Build it. Share it.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="text-text-secondary hover:text-text">
                  How it works
                </a>
              </li>
              <li>
                <a href="#use-cases" className="text-text-secondary hover:text-text">
                  Use cases
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-secondary hover:text-text">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-text-secondary hover:text-text">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-text">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-text">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-text-muted">© 2026 Prodlog</p>
        </div>
      </div>
    </footer>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Is Prodlog free to start?",
      a: "Yes. Capture ideas and track progress for free. You can add unlimited share profiles.",
    },
    {
      q: "Is this for teams?",
      a: "Prodlog is optimized for solo builders, but you can still share curated views with mentors, clients, or reviewers.",
    },
    {
      q: "Can I keep ideas private?",
      a: "Absolutely. Visibility levels let you keep everything private or selectively share links, docs, or full detail.",
    },
  ];
  return (
    <section className="border-b border-border bg-surface-2/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">FAQ</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary">Quick answers to common questions.</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-surface p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-text">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
