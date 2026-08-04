"use client";

import { useState } from "react";
import { Github, Globe, BookOpen, ExternalLink, Layers, History, ChevronDown, ChevronRight, Zap, Sparkles, Minus, HelpCircle, AlertTriangle } from "lucide-react";
import { STAGES, MOODS, ADDON_CATEGORIES, IDEA_TYPES } from "@/lib/schema";
import type { ShareProfile, SharedIdea, Stage, VisibilityLevel } from "@/lib/schema";

const MOOD_ICON: Record<string, React.ReactNode> = {
  excited: <Zap size={12} className="text-amber-500" />,
  hopeful: <Sparkles size={12} className="text-emerald-500" />,
  neutral: <Minus size={12} className="text-stone-400" />,
  unsure: <HelpCircle size={12} className="text-indigo-400" />,
  frustrated: <AlertTriangle size={12} className="text-rose-500" />,
};

function shouldShowLinks(visibility: VisibilityLevel) {
  return visibility === "links" || visibility === "docs" || visibility === "summary" || visibility === "full";
}

function shouldShowDocs(visibility: VisibilityLevel) {
  return visibility === "docs" || visibility === "summary" || visibility === "full";
}

function shouldShowSummary(visibility: VisibilityLevel) {
  return visibility === "summary" || visibility === "full";
}

function shouldShowFull(visibility: VisibilityLevel) {
  return visibility === "full";
}

export default function SharedViewClient({
  profile,
  ideas,
}: {
  profile: ShareProfile;
  ideas: SharedIdea[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <section className="space-y-2.5">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-muted">
          Shared portfolio
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
          {profile.name}
        </h1>
        {profile.description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary max-w-xl">
            {profile.description}
          </p>
        ) : (
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary max-w-xl">
            A curated collection of projects in progress.
          </p>
        )}
      </section>

      {ideas.length === 0 ? (
        <div className="card flex flex-col items-center gap-2.5 px-6 py-14 text-center">
          <Layers size={24} className="text-text-muted/30" />
          <p className="mt-1.5 text-sm text-text-secondary">
            This portfolio is empty or all ideas are marked private.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {ideas.map(({ idea, addons, entries }) => {
            const stage = STAGES.find((s) => s.key === idea.stage)!;
            const typeDef = IDEA_TYPES.find((t) => t.key === (idea.idea_type ?? "app"))!;
            const expanded = expandedId === idea.id;
            const showLinks = shouldShowLinks(idea.visibility);
            const showDocs = shouldShowDocs(idea.visibility);
            const showSummary = shouldShowSummary(idea.visibility);
            const showFull = shouldShowFull(idea.visibility);

            return (
              <div key={idea.id} className="card overflow-hidden rounded-xl">
                <button
                  onClick={() => setExpandedId(expanded ? null : idea.id)}
                  className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-2/40"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stage.color} text-white shadow-sm`}
                      >
                        {stage.label}
                      </span>
                      <span className="rounded-md border border-border/60 bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {typeDef.icon} {typeDef.label}
                      </span>
                      {idea.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-surface-2/60 px-2 py-0.5 text-xs font-medium text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-text">
                      {idea.title}
                    </h3>
                    {showSummary && idea.one_liner && (
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
                        {idea.one_liner}
                      </p>
                    )}
                    {showSummary && (
                      <div className="mt-2.5 flex items-center gap-4 text-xs text-text-muted flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                              style={{ width: `${idea.conviction * 10}%` }}
                            />
                          </div>
                          Conviction <span className="font-medium text-text">{idea.conviction}/10</span>
                        </span>
                        {showFull && entries.length > 0 && (
                          <span className="flex items-center gap-1">
                            <History size={13} /> {entries.length}{" "}
                            {entries.length === 1 ? "entry" : "entries"}
                          </span>
                        )}
                        {addons.filter((a) => a.visible).length > 0 && (
                          <span className="flex items-center gap-1">
                            <Layers size={13} />{" "}
                            {addons.filter((a) => a.visible).length}{" "}
                            {addons.filter((a) => a.visible).length === 1 ? "addon" : "addons"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 pt-0.5 text-text-muted mt-0.5">
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border/60 px-5 pb-5 pt-4 space-y-5">
                    {showLinks && (idea.links?.repo || idea.links?.deploy || (showDocs && idea.links?.docs)) && (
                      <div className="flex flex-wrap gap-2.5">
                        {idea.links?.repo && (
                          <a
                            href={idea.links.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <Github size={13} /> {typeDef.links.repo} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        {idea.links?.deploy && (
                          <a
                            href={idea.links.deploy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <Globe size={13} /> {typeDef.links.deploy} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        {showDocs && idea.links?.docs && (
                          <a
                            href={idea.links.docs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <BookOpen size={13} /> {typeDef.links.docs} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                      </div>
                    )}

                    {showFull && addons.filter((a) => a.visible).length > 0 && (
                      <div>
                        <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
                          <Package size={14} />
                          Services &amp; Add-ons
                        </h4>
                        <div className="space-y-1.5">
                          {addons
                            .filter((a) => a.visible)
                            .map((addon) => {
                              const cat = ADDON_CATEGORIES.find(
                                (c) => c.key === addon.category
                              );
                              return (
                                <div
                                  key={addon.id}
                                  className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-surface-2/40 p-3.5"
                                >
                                  <span className="text-sm">{cat?.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-text">
                                        {addon.name}
                                      </span>
                                      <span className="rounded-md bg-surface-2/70 px-2 py-0.5 text-[11px] font-medium text-text-muted border border-border/50">
                                        {cat?.label}
                                      </span>
                                      {addon.account_label && (
                                        <span className="text-[11px] text-text-muted">· {addon.account_label}</span>
                                      )}
                                    </div>
                                    {addon.notes && (
                                      <p className="mt-1 text-xs text-text-secondary">{addon.notes}</p>
                                    )}
                                  </div>
                                  {addon.url && (
                                    <a
                                      href={addon.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-accent transition-colors"
                                    >
                                      <ExternalLink size={13} />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {showFull && entries.length > 0 && (
                      <div>
                        <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
                          <History size={14} />
                          Progress log ({entries.length})
                        </h4>
                        <div className="space-y-2.5">
                          {entries.slice(0, 10).map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-lg border border-border/50 bg-surface-2/40 p-4"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                {entry.mood && (
                                  <span className="inline-flex items-center">
                                    {MOOD_ICON[entry.mood]}
                                  </span>
                                )}
                                <span className="text-xs font-medium text-text-muted">
                                  {new Date(entry.created_at).toLocaleDateString(
                                    undefined,
                                    { month: "long", day: "numeric" }
                                  )}
                                </span>
                                {entry.action_taken && (
                                  <span className="ml-auto rounded-md bg-accent-subtle border border-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                                    {entry.action_taken}
                                  </span>
                                )}
                              </div>
                              {entry.body && (
                                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-text">
                                  {entry.body}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Add missing import for Package used in shared view
import { Package } from "lucide-react";
