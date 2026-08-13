"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Inbox, Sparkles, ArrowRight, Github, Globe, BookOpen, Package, Search, Bug } from "lucide-react";
import { createIdea } from "@/lib/actions";
import { IDEA_TYPES } from "@/lib/schema";
import type { Idea, Stage } from "@/lib/schema";

interface StageDef {
  key: Stage;
  label: string;
  color: string;
}

function convictionLabel(n: number) {
  if (n >= 8) return "Strong";
  if (n >= 6) return "Solid";
  if (n >= 4) return "Curious";
  return "Faint";
}

function iconForLinks(idea: Idea) {
  const l = idea.links ?? {};
  const icons: { key: string; icon: React.ReactNode }[] = [];
  if (l.repo) icons.push({ key: "repo", icon: <Github size={12} /> });
  if (l.deploy) icons.push({ key: "deploy", icon: <Globe size={12} /> });
  if (l.docs) icons.push({ key: "docs", icon: <BookOpen size={12} /> });
  return icons;
}

export function DashboardClient({
  initialGroups,
  stages,
  total,
  active,
  addonCounts,
  bugCounts,
}: {
  initialGroups: Record<string, Idea[]>;
  stages: StageDef[];
  total: number;
  active: number;
  addonCounts: Record<string, number>;
  bugCounts: Record<string, number>;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleQuickAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get("quick_title") as string)?.trim();
    if (!title) return;

    const fullFd = new FormData();
    fullFd.set("title", title);
    fullFd.set("one_liner", "");
    fullFd.set("conviction", "5");
    fullFd.set("tags", "");
    fullFd.set("stage", "inbox");

    await createIdea(fullFd);
    form.reset();
    router.refresh();
  }

  const empty = total === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-full w-full rounded-full bg-emerald-500"></span>
          </span>
          <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-muted">
            Your progress log
          </p>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
          What are you building?
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-text-secondary">
          Track every idea from a spark to a launch — or a graceful burial.
          Log progress, keep momentum, remember why.
        </p>
      </section>

      {/* Quick add */}
      <form
        ref={formRef}
        onSubmit={handleQuickAdd}
        className="relative"
      >
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          name="quick_title"
          type="text"
          placeholder="Capture a new idea…"
          className="input h-11 pl-11 pr-24 text-sm focus:ring-4 focus:ring-accent/5"
          autoComplete="off"
        />
        <button type="submit" className="btn-primary absolute right-1.5 top-1.5 bottom-1.5 shrink-0 px-4 h-8 text-xs font-semibold">
          <Plus size={15} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {empty ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stages.map((stage) => {
            const items = initialGroups[stage.key] ?? [];
            return (
              <div key={stage.key}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    {stage.label}
                  </span>
                  <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary border border-border/50">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((idea) => {
                    const linkIcons = iconForLinks(idea);
                    const addonCount = addonCounts[idea.id] ?? 0;
                    const bugCount = bugCounts[idea.id] ?? 0;
                    return (
                      <a
                        key={idea.id}
                        href={`/ideas/${idea.id}`}
                        className="group relative block overflow-hidden rounded-xl border border-border/70 bg-surface/80 backdrop-blur-sm p-3.5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
                      >
                        <p className="text-sm font-semibold leading-snug text-text line-clamp-2">
                          {idea.title}
                        </p>
                        {idea.one_liner && (
                          <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
                            {idea.one_liner}
                          </p>
                        )}
                        {(linkIcons.length > 0 || addonCount > 0 || bugCount > 0) && (
                          <div className="mt-2 flex items-center gap-1.5">
                            {linkIcons.map(({ key, icon }) => (
                              <span
                                key={key}
                                className="inline-flex items-center rounded-md border border-border/50 bg-surface-2/80 px-1.5 py-0.5 text-text-muted"
                              >
                                {icon}
                              </span>
                            ))}
                            {addonCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-surface-2/80 px-2 py-0.5 text-xs font-medium text-text-muted">
                                <Package size={10} />
                                {addonCount}
                              </span>
                            )}
                            {bugCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                                <Bug size={10} />
                                {bugCount}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-3 space-y-2">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-all duration-700"
                              style={{ width: `${idea.conviction * 10}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-text-muted">
                            <span>{convictionLabel(idea.conviction)}</span>
                            <span>{new Date(idea.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="absolute right-3 top-3 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-0.5 text-accent" />
                      </a>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/50 p-6 text-center">
                      <p className="text-sm text-text-muted">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card relative overflow-hidden flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="glow-layer left-1/2 top-0 h-40 w-56 -translate-x-1/2 opacity-50" />
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent animate-float shadow-glow">
        <Sparkles size={22} />
      </div>
      <div className="relative z-10 space-y-1.5">
        <h2 className="font-display text-lg font-medium text-text">
          Your log is a blank page
        </h2>
        <p className="mx-auto max-w-sm text-sm text-text-secondary leading-relaxed">
          Add your first idea above — it takes about ten seconds. The ones you
          never write down are the ones that quietly disappear.
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-1.5 pt-1 text-xs font-medium text-accent">
        <Inbox size={14} />
        Starts in your inbox
        <ArrowRight size={14} />
      </div>
    </div>
  );
}
