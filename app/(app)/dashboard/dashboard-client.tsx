"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Inbox, Sparkles, ArrowRight, Github, Globe, BookOpen, Package, Search, Bug, LayoutGrid, Rows } from "lucide-react";
import { createIdea } from "@/lib/actions";
import { ConvictionSlider, ConvictionCell, convictionLabel } from "../components/conviction-slider";
import type { Idea, Stage } from "@/lib/schema";

interface StageDef {
  key: Stage;
  label: string;
  color: string;
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
  const [view, setView] = useState<"board" | "list">("board");

  // Remember the last view the user picked.
  useEffect(() => {
    const saved = window.localStorage.getItem("prodlog:dashboard:view");
    if (saved === "board" || saved === "list") setView(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("prodlog:dashboard:view", view);
  }, [view]);

  return (
    <div className="space-y-6">
      {/* Compact header */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-text-muted">
              Your progress log
            </p>
          </div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-text sm:text-3xl">
            What are you building?
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
            Track every idea from a spark to a launch — or a graceful burial.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-border/70 bg-surface-2/50 px-3 py-1 text-xs font-medium tabular-nums text-text-secondary sm:inline-flex">
          {total} idea{total === 1 ? "" : "s"}
        </span>
      </div>

      {/* Controls: quick capture + board/list toggle */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:px-3.5 sm:py-3">
          <form ref={formRef} onSubmit={handleQuickAdd} className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              name="quick_title"
              type="text"
              placeholder="Capture a new idea…"
              className="input h-10 pl-11 pr-24 text-sm focus:ring-4 focus:ring-accent/5"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary absolute right-1.5 top-1.5 bottom-1.5 h-7 shrink-0 px-3 text-xs font-semibold">
              <Plus size={14} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="inline-flex text-xs font-medium tabular-nums text-text-muted sm:hidden">
              {total} idea{total === 1 ? "" : "s"}
            </span>
            <div className="inline-flex items-center rounded-lg border border-border bg-surface-2/60 p-0.5" role="tablist" aria-label="View">
              <button
                role="tab"
                aria-selected={view === "board"}
                onClick={() => setView("board")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  view === "board" ? "bg-surface text-accent shadow-sm" : "text-text-secondary hover:text-text"
                }`}
              >
                <LayoutGrid size={14} />
                Board
              </button>
              <button
                role="tab"
                aria-selected={view === "list"}
                onClick={() => setView("list")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  view === "list" ? "bg-surface text-accent shadow-sm" : "text-text-secondary hover:text-text"
                }`}
              >
                <Rows size={14} />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {empty ? (
        <EmptyState />
      ) : view === "board" ? (
        <BoardView
          groups={initialGroups}
          stages={stages}
          addonCounts={addonCounts}
          bugCounts={bugCounts}
        />
      ) : (
        <ListView groups={initialGroups} stages={stages} />
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

/* ------------------------------------------------------------------
   Board view — only non-empty columns are rendered; cards are fixed
   height with strict line clamps so baselines stay aligned.
   ------------------------------------------------------------------ */
function BoardView({
  groups,
  stages,
  addonCounts,
  bugCounts,
}: {
  groups: Record<string, Idea[]>;
  stages: StageDef[];
  addonCounts: Record<string, number>;
  bugCounts: Record<string, number>;
}) {
  const columns = stages.filter((s) => (groups[s.key] ?? []).length > 0);
  if (columns.length === 0) return null;

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
      {columns.map((stage) => {
        const items = groups[stage.key] ?? [];
        return (
          <div key={stage.key} className="flex flex-col">
            <div className="mb-2.5 flex items-center gap-2 px-0.5">
              <span className={`h-2 w-2 rounded-full ${stage.color}`} />
              <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
                {stage.label}
              </span>
              <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary border border-border/50">
                {items.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {items.map((idea) => (
                <BoardCard
                  key={idea.id}
                  idea={idea}
                  addonCount={addonCounts[idea.id] ?? 0}
                  bugCount={bugCounts[idea.id] ?? 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({
  idea,
  addonCount,
  bugCount,
}: {
  idea: Idea;
  addonCount: number;
  bugCount: number;
}) {
  const [conviction, setConviction] = useState(idea.conviction);
  const linkIcons = iconForLinks(idea);
  const hasMeta = linkIcons.length > 0 || addonCount > 0 || bugCount > 0;

  return (
    <a
      href={`/ideas/${idea.id}`}
      className="group relative flex h-[168px] flex-col overflow-hidden rounded-xl border border-border/70 bg-surface/80 p-3.5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-1 text-sm font-semibold leading-snug text-text">
          {idea.title}
        </h4>
        <ArrowRight
          size={13}
          className="mt-0.5 shrink-0 text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>

      {idea.one_liner ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {idea.one_liner}
        </p>
      ) : (
        <p className="mt-1 text-xs italic text-text-muted/70">No one-liner yet</p>
      )}

      {hasMeta && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {linkIcons.map(({ key, icon }) => (
            <span
              key={key}
              className="inline-flex h-5 items-center rounded-md border border-border/50 bg-surface-2/80 px-1.5 text-text-muted"
            >
              {icon}
            </span>
          ))}
          {addonCount > 0 && (
            <span className="inline-flex h-5 items-center gap-1 rounded-md border border-border/50 bg-surface-2/80 px-1.5 text-[0.7rem] font-medium text-text-muted">
              <Package size={10} />
              {addonCount}
            </span>
          )}
          {bugCount > 0 && (
            <span className="inline-flex h-5 items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-1.5 text-[0.7rem] font-medium text-rose-600 dark:text-rose-400">
              <Bug size={10} />
              {bugCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-2.5">
        <ConvictionSlider ideaId={idea.id} value={conviction} onLiveChange={setConviction} />
        <div className="mt-1 flex items-center justify-between text-[0.68rem] text-text-muted">
          <span className="font-medium">{convictionLabel(conviction)}</span>
          <span className="tabular-nums">
            {new Date(idea.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------
   List view — flat, scannable table across every stage.
   ------------------------------------------------------------------ */
function ListView({
  groups,
  stages,
}: {
  groups: Record<string, Idea[]>;
  stages: StageDef[];
}) {
  const ideas = useMemo(() => {
    const all: Idea[] = [];
    for (const s of stages) all.push(...(groups[s.key] ?? []));
    return all;
  }, [groups, stages]);

  if (ideas.length === 0) return null;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left">
            <th className="p-3 pl-4 text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">Name</th>
            <th className="p-3 text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">Stage</th>
            <th className="p-3 text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">Progress</th>
            <th className="p-3 pr-4 text-right text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {ideas.map((idea) => {
            const stageDef = stages.find((s) => s.key === idea.stage) ?? stages[0];
            return (
              <tr key={idea.id} className="group transition-colors hover:bg-surface-2/40">
                <td className="p-3 pl-4">
                  <Link href={`/ideas/${idea.id}`} className="block max-w-[320px]">
                    <span className="block truncate font-medium text-text transition-colors group-hover:text-accent">
                      {idea.title}
                    </span>
                    {idea.one_liner && (
                      <span className="block truncate text-xs text-text-muted">{idea.one_liner}</span>
                    )}
                  </Link>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2/80 px-2 py-0.5 text-xs font-medium text-text-secondary">
                    <span className={`h-1.5 w-1.5 rounded-full ${stageDef.color}`} />
                    {stageDef.label}
                  </span>
                </td>
                <td className="p-3">
                  <ConvictionCell idea={idea} />
                </td>
                <td className="p-3 pr-4 text-right text-xs tabular-nums text-text-muted">
                  {new Date(idea.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
