"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Inbox, Sparkles, ArrowRight, Github, Globe, BookOpen, Package } from "lucide-react";
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

function hasLinks(idea: Idea): boolean {
  const l = idea.links;
  return !!(l?.repo || l?.deploy || l?.docs);
}

function iconForLinks(idea: Idea) {
  const l = idea.links ?? {};
  const icons: { key: string; icon: React.ReactNode }[] = [];
  if (l.repo) icons.push({ key: "repo", icon: <Github size={10} /> });
  if (l.deploy) icons.push({ key: "deploy", icon: <Globe size={10} /> });
  if (l.docs) icons.push({ key: "docs", icon: <BookOpen size={10} /> });
  return icons;
}

export function DashboardClient({
  initialGroups,
  stages,
  total,
  active,
  addonCounts,
}: {
  initialGroups: Record<string, Idea[]>;
  stages: StageDef[];
  total: number;
  active: number;
  addonCounts: Record<string, number>;
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
      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Your progress log
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
          What are you building?
        </h1>
        <p className="max-w-xl text-sm text-text-secondary">
          Track every idea from a spark to a launch — or a graceful burial.
          Log progress, keep momentum, remember why.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total ideas" value={total.toString()} />
        <Stat label="Active" value={active.toString()} />
        <Stat label="In inbox" value={(initialGroups.inbox ?? []).length.toString()} />
        <Stat label="Launched" value={(initialGroups.launched ?? []).length.toString()} />
      </div>

      <form
        ref={formRef}
        onSubmit={handleQuickAdd}
        className="flex gap-2"
      >
        <input
          name="quick_title"
          type="text"
          placeholder="Capture a new idea…"
          className="input flex-1"
          autoComplete="off"
        />
        <button type="submit" className="btn-primary shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {empty ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stages.map((stage) => {
            const items = initialGroups[stage.key] ?? [];
            return (
              <div key={stage.key}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className="ml-auto rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-text-secondary">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((idea) => {
                    const linkIcons = iconForLinks(idea);
                    const addonCount = addonCounts[idea.id] ?? 0;
                    const typeDef = IDEA_TYPES.find((t) => t.key === (idea.idea_type ?? "app"));
                    return (
                      <a
                        key={idea.id}
                        href={`/ideas/${idea.id}`}
                        className="group block rounded-xl border border-border bg-surface p-3.5 shadow-card transition-all hover:-translate-y-px hover:border-border-strong hover:shadow-card-hover"
                      >
                        <p className="text-sm font-medium leading-snug text-text">
                          {idea.title}
                        </p>
                        {idea.one_liner && (
                          <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">
                            {idea.one_liner}
                          </p>
                        )}
                        {(linkIcons.length > 0 || addonCount > 0) && (
                          <div className="mt-2 flex items-center gap-1.5">
                            {linkIcons.map(({ key, icon }) => (
                              <span
                                key={key}
                                className="inline-flex items-center rounded border border-border/60 bg-surface-2 px-1 py-0.5 text-text-muted"
                              >
                                {icon}
                              </span>
                            ))}
                            {addonCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-text-muted">
                                <Package size={9} />
                                {addonCount}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-3 space-y-2">
                          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-accent/70 transition-all"
                              style={{ width: `${idea.conviction * 10}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-muted">
                            <span>{convictionLabel(idea.conviction)}</span>
                            <span>{new Date(idea.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center">
                      <p className="text-[11px] text-text-muted">Empty</p>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3.5">
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-text">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
        <Sparkles size={22} />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-medium text-text">
          Your log is a blank page
        </h2>
        <p className="mx-auto max-w-sm text-sm text-text-secondary">
          Add your first idea above — it takes about ten seconds. The ones you
          never write down are the ones that quietly disappear.
        </p>
      </div>
      <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-accent">
        <Inbox size={14} />
        Starts in your inbox
        <ArrowRight size={14} />
      </div>
    </div>
  );
}
