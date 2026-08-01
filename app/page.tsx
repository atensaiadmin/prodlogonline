import Link from "next/link";
import { ArrowRight, Layers, History, Eye, Shield, Package, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div>
      <Nav />

      <Hero />

      <HowItWorks />

      <Features />

      <BottomCTA />

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent font-display text-sm font-semibold text-white shadow-card">
            p
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-text">
            prodlog
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-text-secondary hover:text-text transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary px-4 py-1.5 text-xs"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-accent/[0.06] to-transparent" />
      <div className="mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Built for solo founders
        </p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-text sm:text-5xl md:text-6xl">
          The progress log for
          <br />
          <span className="text-accent">people who build things</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Track every idea from a spark to a launch — or a graceful burial.
          Log progress, document your infrastructure, and share curated
          portfolios with mentors, clients, or your future self.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Start your log <ArrowRight size={15} />
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary px-5 py-2.5 text-sm"
          >
            How it works
          </a>
        </div>
        <p className="mt-4 text-xs text-text-muted">No account needed to preview.</p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Capture an idea",
      description:
        "Drop an idea into your inbox in seconds. Add a one-liner, set conviction, tag it. Every idea starts somewhere.",
      color: "text-indigo-500",
    },
    {
      step: "02",
      title: "Log your progress",
      description:
        "As you build, validate, or research — log entries. Track your mood, note actions taken, keep momentum visible.",
      color: "text-amber-500",
    },
    {
      step: "03",
      title: "Document your infra",
      description:
        "Attach links (repo, deploy, docs) and add-ons (hosting, databases, auth services). Never forget which Supabase account that project lives on.",
      color: "text-emerald-500",
    },
    {
      step: "04",
      title: "Share curated portfolios",
      description:
        "Create share profiles — pick which ideas to show, control what the viewer sees. Send a link to a mentor, client, or grant reviewer.",
      color: "text-cyan-500",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
            Four steps from spark to shared
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            No rigid frameworks. Prodlog adapts to how you work — apps, papers,
            research, writing. You decide what matters.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span
                className={`font-display text-2xl font-semibold ${s.color}`}
              >
                {s.step}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-text">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Layers size={18} />,
      title: "Stage pipeline",
      description:
        "Inbox → Validating → Building → Launched → Dead. Move ideas through stages. Kill them gracefully when needed.",
    },
    {
      icon: <History size={18} />,
      title: "Progress entries",
      description:
        "Timestamped log entries with mood tracking. Every entry is a thread — look back and see how far you've come.",
    },
    {
      icon: <Package size={18} />,
      title: "Infra documentation",
      description:
        "Track every service attached to a project. Which hosting, which database, which free tier you're burning through.",
    },
    {
      icon: <Eye size={18} />,
      title: "Granular visibility",
      description:
        "Per-idea visibility controls. Show links only, docs only, full details, or nothing. You decide what the reviewer sees.",
    },
    {
      icon: <Globe size={18} />,
      title: "Any type of work",
      description:
        "Not just apps. Track papers, research projects, writing, or anything in between. Link labels adapt to the type.",
    },
    {
      icon: <Shield size={18} />,
      title: "Coming soon",
      description:
        "Multi-tenant accounts, Google sign-in, free and paid tiers, and team sharing. The foundation is built — scaling is next.",
    },
  ];

  return (
    <section className="border-t border-border bg-surface-2/50">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
            Features
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
            Built for the solo builder&apos;s brain
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            Prodlog is not another project management tool. It&apos;s a
            lightweight log that respects how founders actually think.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                {f.icon}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-text">
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-24">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
          <span className="font-display text-xl font-semibold">p</span>
        </div>
        <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
          Start logging your ideas
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
          The ones you never write down are the ones that quietly disappear.
          Ten seconds to capture, a lifetime to build.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-primary px-5 py-2.5 text-sm">
            Open the log <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent font-display text-xs font-semibold text-white">
            p
          </span>
          <span className="font-display text-sm font-medium tracking-tight text-text">
            prodlog
          </span>
        </div>
        <p className="text-[11px] text-text-muted">
          The progress log for solo founders.
        </p>
      </div>
    </footer>
  );
}
