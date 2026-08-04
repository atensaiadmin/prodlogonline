"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Idea, IdeaType, Stage } from "@/lib/schema";
import { IDEA_TYPES, STAGES } from "@/lib/schema";
import { Grid3X3, Rows, SlidersHorizontal, X, Search, Plus } from "lucide-react";

export function IdeasIndexClient({
  initialIdeas,
  addonCounts,
}: {
  initialIdeas: Idea[];
  addonCounts: Record<string, number>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState<string>(searchParams.get("q") ?? "");
  const [stage, setStage] = useState<Stage | "all">(
    (searchParams.get("stage") as Stage | null) ?? "all"
  );
  const [type, setType] = useState<IdeaType | "all">(
    (searchParams.get("type") as IdeaType | null) ?? "all"
  );
  const [view, setView] = useState<"grid" | "table">(
    (searchParams.get("view") as "grid" | "table" | null) ?? "grid"
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (searchParams.get("tags")?.split(",").filter(Boolean) as string[]) ?? []
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return initialIdeas.filter((i) => {
      if (stage !== "all" && i.stage !== stage) return false;
      if (type !== "all" && i.idea_type !== type) return false;
      if (selectedTags.length > 0) {
        const tags = i.tags ?? [];
        for (const t of selectedTags) if (!tags.includes(t)) return false;
      }
      if (!term) return true;
      const hay = [i.title, i.one_liner, ...(i.tags ?? [])].join(" \u0000 ").toLowerCase();
      return hay.includes(term);
    });
  }, [initialIdeas, q, stage, type, selectedTags]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const i of initialIdeas) for (const t of i.tags ?? []) if (t) s.add(t);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [initialIdeas]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (stage !== "all") sp.set("stage", stage);
      if (type !== "all") sp.set("type", type);
      if (view !== "grid") sp.set("view", view);
      if (selectedTags.length > 0) sp.set("tags", selectedTags.join(","));
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
  }, [q, stage, type, view, selectedTags, pathname, router]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setQ("");
    setStage("all");
    setType("all");
    setSelectedTags([]);
  }

  const filterCount = (stage !== "all" ? 1 : 0) + (type !== "all" ? 1 : 0) + (q ? 1 : 0) + (selectedTags.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1.5">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-muted">All ideas</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text">Ideas</h1>
      </div>

      {/* Controls */}
      <div className="card divide-y divide-border/60 overflow-hidden">
        <div className="grid items-center gap-3 p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, one-liner, tags…"
              className="input h-10 pl-11 text-sm"
            />
            {q && (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:border-border-strong transition-colors"
                onClick={() => setQ("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="hidden text-xs font-medium text-text-secondary sm:block">Stage</label>
            <select
              className="input h-10 text-xs"
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
            >
              <option value="all">All</option>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="hidden text-xs font-medium text-text-secondary sm:block">Type</label>
            <select
              className="input h-10 text-xs"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="all">All</option>
              {IDEA_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 sm:hidden lg:flex">
            <span className="text-xs font-medium text-text-muted mr-0.5">View</span>
            <button
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                view === "grid"
                  ? "border-accent bg-accent/5 text-accent shadow-sm"
                  : "border-border text-text-secondary hover:border-border-strong"
              }`}
              onClick={() => setView("grid")}
            >
              <Grid3X3 size={14} /> Grid
            </button>
            <button
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                view === "table"
                  ? "border-accent bg-accent/5 text-accent shadow-sm"
                  : "border-border text-text-secondary hover:border-border-strong"
              }`}
              onClick={() => setView("table")}
            >
              <Rows size={14} /> Table
            </button>
          </div>

          <Link href="/ideas/new" className="btn-primary px-4 py-2 text-xs font-semibold">
            <Plus size={14} />
            New idea
          </Link>
        </div>

        <div className="flex flex-col gap-2 px-4 py-2.5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between bg-surface-2/30">
          <span className="font-medium">{filtered.length} of {initialIdeas.length} ideas</span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-text-muted">
              <SlidersHorizontal size={12} />
              Filters active: <span className="font-medium text-text">{filterCount}</span>
            </div>
            {filterCount > 0 && (
              <button
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:border-border-strong transition-colors"
                onClick={clearFilters}
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="-mt-2 flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const active = selectedTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  active
                    ? "border border-accent bg-accent text-white shadow-sm"
                    : "border border-border bg-surface/80 text-text-secondary hover:border-border-strong"
                }`}
              >
                {t}
                {active && <X size={10} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid or Table */}
      {view === "grid" ? (
        <GridView ideas={filtered} addonCounts={addonCounts} />
      ) : (
        <TableView ideas={filtered} addonCounts={addonCounts} />
      )}
    </div>
  );
}

function GridView({ ideas, addonCounts }: { ideas: Idea[]; addonCounts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ideas.map((idea) => {
        const typeDef = IDEA_TYPES.find((t) => t.key === (idea.idea_type ?? "app"));
        const stageDef = STAGES.find((s) => s.key === idea.stage);
        const addons = addonCounts[idea.id] ?? 0;
        return (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="group block overflow-hidden rounded-xl border border-border/70 bg-surface/80 backdrop-blur-sm p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[15px] font-semibold text-text truncate">{idea.title}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2/80 px-2 py-0.5 text-xs font-medium text-text-muted">
                <span className={`h-1.5 w-1.5 rounded-full ${stageDef?.color}`} />
                {stageDef?.label}
              </span>
            </div>

            {idea.one_liner && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">{idea.one_liner}</p>
            )}

            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-all duration-500"
                  style={{ width: `${idea.conviction * 10}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Conviction <span className="font-medium text-text">{idea.conviction}/10</span></span>
                <span className="tabular-nums">{new Date(idea.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border/40">
              <span>{addons} add-on{addons !== 1 ? 's' : ''}</span>
              {idea.tags?.length ? (
                <span className="truncate max-w-[50%]">{idea.tags.slice(0, 2).join(", ")}{idea.tags.length > 2 ? '…' : ""}</span>
              ) : (
                <span className="opacity-60 italic">No tags</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function TableView({ ideas, addonCounts }: { ideas: Idea[]; addonCounts: Record<string, number> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-surface/80 backdrop-blur-sm shadow-card">
      <table className="min-w-[720px] w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-2/50 text-left text-xs text-text-secondary">
            <th className="rounded-tl-xl p-3 font-medium">Title</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Stage</th>
            <th className="p-3 font-medium">Conviction</th>
            <th className="p-3 font-medium">Tags</th>
            <th className="p-3 font-medium">Add-ons</th>
            <th className="rounded-tr-xl p-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((i) => {
            const typeDef = IDEA_TYPES.find((t) => t.key === (i.idea_type ?? "app"));
            const stageDef = STAGES.find((s) => s.key === i.stage);
            return (
              <tr key={i.id} className="group border-t border-border/50 transition-colors hover:bg-surface-2/40">
                <td className="p-3">
                  <Link href={`/ideas/${i.id}`} className="font-medium text-text group-hover:text-accent transition-colors">
                    {i.title}
                  </Link>
                  {i.one_liner && (
                    <div className="mt-0.5 text-xs text-text-muted line-clamp-1">{i.one_liner}</div>
                  )}
                </td>
                <td className="p-3 text-text-secondary">{typeDef?.label}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2/80 px-2 py-0.5 text-xs font-medium text-text-muted">
                    <span className={`h-1.5 w-1.5 rounded-full ${stageDef?.color}`} />
                    {stageDef?.label}
                  </span>
                </td>
                <td className="p-3 tabular-nums"><span className="font-medium text-text">{i.conviction}</span>/10</td>
                <td className="p-3 text-text-muted max-w-[180px] truncate">{i.tags?.join(", ") || <span className="opacity-50">—</span>}</td>
                <td className="p-3 tabular-nums">{addonCounts[i.id] ?? 0}</td>
                <td className="p-3 text-text-muted whitespace-nowrap">{new Date(i.updated_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
