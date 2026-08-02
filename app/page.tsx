import Link from "next/link";
import { ArrowRight, Check, X, Cloud, FileText, Zap, Users, Plus } from "lucide-react";
import MarketingHeader from "./components/marketing-header";
import Reveal from "./components/reveal";

export default function LandingPage() {
  return (
    <div>
      <MarketingHeader />
      <Hero />
      <HowItWorks />
      <WhatItIsnt />
      <UseCases />
      <FAQ />
      <BottomCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="grain relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dotgrid" />
        <div className="glow-layer -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2" />
        <div className="glow-layer right-[5%] top-[45%] h-72 w-72 opacity-70" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow justify-center">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Built for solo founders who ship
            </p>
          </Reveal>

          <Reveal className="mt-8">
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-text sm:text-6xl lg:text-[4.75rem]">
              Track it. Build it.
              <br />
              <em className="font-medium italic text-accent">Share it.</em>
            </h1>
          </Reveal>

          <Reveal className="mt-8">
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
              The progress log for people who build things. Track every idea,
              document your infra stack, and share curated portfolios—without
              the bloat of project management tools.
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-glow transition-all hover:bg-accent-hover hover:shadow-[0_12px_40px_-10px_rgba(79,70,229,0.6)] active:scale-[0.98]"
              >
                Start tracking for free
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3 text-base font-semibold text-text shadow-sm transition-all hover:border-border-strong hover:shadow-md active:scale-[0.98]"
              >
                See how it works
              </a>
            </div>
          </Reveal>

          <Reveal className="mt-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
              No credit card required · 30 seconds to your first idea
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Capture an idea",
      desc: "Drop it into your inbox in 10 seconds. Title, one-liner, done. Every idea starts somewhere.",
      icon: <Zap size={18} />,
    },
    {
      step: "02",
      title: "Log your progress",
      desc: "Track mood, note what you shipped, keep momentum visible. Look back and see how far you've come.",
      icon: <FileText size={18} />,
    },
    {
      step: "03",
      title: "Document your stack",
      desc: "Which Supabase account? Which free tier? Never forget where your 10 projects actually live.",
      icon: <Cloud size={18} />,
    },
    {
      step: "04",
      title: "Share portfolios",
      desc: "Pick which ideas to show. Control what's visible. Send one link to a mentor, client, or grant reviewer.",
      icon: <Users size={18} />,
    },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-16 border-b border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow justify-center">How it works</p>
          </Reveal>
          <Reveal className="mt-5">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-text sm:text-5xl">
              From spark to shipped
            </h2>
          </Reveal>
          <Reveal className="mt-4">
            <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
              Four steps. No rigid frameworks. Prodlog adapts to how you actually work.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => (
            <Reveal key={item.step} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-text-muted group-hover:text-accent">
                    {item.step}
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    {item.icon}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-text">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">{item.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight
                    size={16}
                    className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-border-strong lg:block"
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            Track it · Build it · Share it
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function WhatItIsnt() {
  const notList = [
    "Sprint planning and velocity tracking",
    "Team dashboards you need to keep updated",
    "Gantt charts and dependency graphs",
    "Feature request voting systems",
  ];
  const isList = [
    "A lightweight log for solo builders",
    "Progress notes you actually want to write",
    "Infrastructure documentation you'll reference later",
    "Shareable portfolios for mentors and clients",
  ];

  return (
    <section className="border-b border-border bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="eyebrow justify-center">The pitch</p>
          </Reveal>
          <Reveal className="mt-5">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-text sm:text-4xl">
              Not another PM tool
            </h2>
          </Reveal>
          <Reveal className="mt-4">
            <p className="mx-auto max-w-2xl text-base text-text-secondary">
              Prodlog is peer-to-peer documentation. No sprints, no Gantt charts, no performance reviews.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-border p-8 sm:p-10 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
                  <X size={15} />
                  What it isn't
                </div>
                <p className="mt-2.5 font-display text-base italic text-text-muted">
                  Deadweight from tools built for teams of fifty.
                </p>
                <ul className="mt-7 space-y-1">
                  {notList.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-rose-500/[0.05]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/[0.07] text-rose-500 dark:text-rose-400">
                        <X size={14} />
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  <Check size={15} />
                  What it is
                </div>
                <p className="mt-2.5 font-display text-base italic text-text-muted">
                  Just enough structure to keep you moving.
                </p>
                <ul className="mt-7 space-y-1">
                  {isList.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-emerald-500/[0.05]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-600 dark:text-emerald-400">
                        <Check size={14} />
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function UseCases() {
  const useCases = [
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
  ];

  return (
    <section id="use-cases" className="relative scroll-mt-16 border-b border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="eyebrow justify-center">Use cases</p>
          </Reveal>
          <Reveal className="mt-5">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-text sm:text-5xl">
              Built for how you work
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((use, i) => (
            <Reveal key={use.title} className="h-full">
              <div className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-text">
                  {use.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">{use.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
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
    <section className="border-b border-border bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center">
          <Reveal>
            <p className="eyebrow justify-center">FAQ</p>
          </Reveal>
          <Reveal className="mt-5">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-text sm:text-4xl">
              Quick answers
            </h2>
          </Reveal>
        </div>
        <div className="mx-auto grid max-w-3xl gap-3">
          {faqs.map((f) => (
            <Reveal key={f.q}>
              <details className="group rounded-xl border border-border bg-surface p-5 transition-colors open:border-accent/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-text">
                  {f.q}
                  <span className="font-mono text-lg leading-none text-text-muted transition-transform duration-300 group-open:rotate-45 group-open:text-accent">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="grain relative overflow-hidden border-b border-border bg-bg">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dotgrid" />
        <div className="glow-layer left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <Reveal>
          <div className="mx-auto mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 shadow-glow">
            <img
              src="/image/iconalone.png"
              alt="ProdLog"
              className="h-10 w-10 object-contain"
            />
          </div>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-text sm:text-5xl">
            Start logging your ideas
          </h2>
        </Reveal>

        <Reveal className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-text-secondary">
            The ones you never write down are the ones that quietly disappear.
          </p>
          <p className="mt-3 font-display text-base font-medium italic text-text">
            Ten seconds to capture. A lifetime to build.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white shadow-glow transition-all hover:bg-accent-hover hover:shadow-[0_16px_48px_-12px_rgba(79,70,229,0.65)] active:scale-[0.98]"
          >
            Open your log
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <Reveal className="mt-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
            Free to start · No credit card · Takes 30 seconds
          </p>
        </Reveal>
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
              <img
                src="/image/iconalone.png"
                alt="ProdLog"
                className="h-8 w-8 object-contain"
              />
              <span className="font-display text-lg font-semibold tracking-tight text-text">prodlog</span>
            </div>
            <p className="max-w-sm text-sm text-text-secondary">
              The progress log for solo founders. Track it. Build it. Share it.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="text-text-secondary transition-colors hover:text-text">
                  How it works
                </a>
              </li>
              <li>
                <a href="#use-cases" className="text-text-secondary transition-colors hover:text-text">
                  Use cases
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-secondary transition-colors hover:text-text">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-text-secondary transition-colors hover:text-text">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary transition-colors hover:text-text">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary transition-colors hover:text-text">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-xs text-text-muted">© 2026 Prodlog</p>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted/70">
            Track it · Build it · Share it
          </p>
        </div>
      </div>
    </footer>
  );
}
