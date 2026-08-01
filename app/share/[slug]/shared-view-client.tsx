"use client";

import { useState } from "react";
import { Github, Globe, BookOpen, ExternalLink, Layers, History, ChevronDown, ChevronRight } from "lucide-react";
import { STAGES, MOODS, ADDON_CATEGORIES, IDEA_TYPES } from "@/lib/schema";
import type { ShareProfile, SharedIdea, Stage, VisibilityLevel } from "@/lib/schema";

const MOOD_EMOJI: Record<string, string> = {
  excited: "⚡",
  hopeful: "🌱",
  neutral: "—",
  unsure: "🤔",
  frustrated: "😤",
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
    <div className="space-y-8">
      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Shared portfolio
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
          {profile.name}
        </h1>
        <p className="text-sm text-text-secondary">
          A curated collection of projects in progress.
        </p>
      </section>

      {ideas.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-sm text-text-secondary">
            This portfolio is empty or all ideas are marked private.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map(({ idea, addons, entries }) => {
            const stage = STAGES.find((s) => s.key === idea.stage)!;
            const typeDef = IDEA_TYPES.find((t) => t.key === (idea.idea_type ?? "app"))!;
            const expanded = expandedId === idea.id;
            const showLinks = shouldShowLinks(idea.visibility);
            const showDocs = shouldShowDocs(idea.visibility);
            const showSummary = shouldShowSummary(idea.visibility);
            const showFull = shouldShowFull(idea.visibility);

            return (
              <div key={idea.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : idea.id)}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left transition-colors hover:bg-surface-2/50"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${stage.color} text-white`}
                      >
                        {stage.label}
                      </span>
                      <span className="rounded-full border border-border/60 bg-surface px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        {typeDef.icon} {typeDef.label}
                      </span>
                      {idea.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-lg font-medium text-text">
                      {idea.title}
                    </h3>
                    {showSummary && idea.one_liner && (
                      <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                        {idea.one_liner}
                      </p>
                    )}
                    {showSummary && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-accent/60"
                              style={{ width: `${idea.conviction * 10}%` }}
                            />
                          </div>
                          Conviction {idea.conviction}/10
                        </span>
                        {showFull && entries.length > 0 && (
                          <span className="flex items-center gap-1">
                            <History size={11} /> {entries.length}{" "}
                            {entries.length === 1 ? "entry" : "entries"}
                          </span>
                        )}
                        {addons.filter((a) => a.visible).length > 0 && (
                          <span className="flex items-center gap-1">
                            <Layers size={11} />{" "}
                            {addons.filter((a) => a.visible).length}{" "}
                            {addons.filter((a) => a.visible).length === 1 ? "addon" : "addons"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 pt-1 text-text-muted">
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                    {showLinks && (idea.links?.repo || idea.links?.deploy || (showDocs && idea.links?.docs)) && (
                      <div className="flex flex-wrap gap-2">
                        {idea.links?.repo && (
                          <a
                            href={idea.links.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                          >
                            <Github size={13} /> {typeDef.links.repo} <ExternalLink size={10} />
                          </a>
                        )}
                        {idea.links?.deploy && (
                          <a
                            href={idea.links.deploy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                          >
                            <Globe size={13} /> {typeDef.links.deploy} <ExternalLink size={10} />
                          </a>
                        )}
                        {showDocs && idea.links?.docs && (
                          <a
                            href={idea.links.docs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                          >
                            <BookOpen size={13} /> {typeDef.links.docs} <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}

                    {showFull && addons.filter((a) => a.visible).length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
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
                                  className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/50 p-2.5"
                                >
                                  <span className="text-sm">{cat?.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-text">
                                        {addon.name}
                                      </span>
                                      <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] text-text-muted">
                                        {cat?.label}
                                      </span>
                                      {addon.account_label && (
                                        <span className="text-[10px] text-text-muted">
                                          · {addon.account_label}
                                        </span>
                                      )}
                                    </div>
                                    {addon.notes && (
                                      <p className="mt-0.5 text-[10px] text-text-muted">
                                        {addon.notes}
                                      </p>
                                    )}
                                  </div>
                                  {addon.url && (
                                    <a
                                      href={addon.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0 rounded p-1 text-text-muted hover:text-accent"
                                    >
                                      <ExternalLink size={12} />
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
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          Progress log ({entries.length})
                        </h4>
                        <div className="space-y-3">
                          {entries.slice(0, 10).map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-lg border border-border bg-surface-2/50 p-3"
                            >
                              <div className="flex items-center gap-2">
                                {entry.mood && (
                                  <span className="text-xs">
                                    {MOOD_EMOJI[entry.mood]}
                                  </span>
                                )}
                                <span className="text-[10px] font-medium text-text-muted">
                                  {new Date(entry.created_at).toLocaleDateString(
                                    undefined,
                                    { month: "long", day: "numeric" }
                                  )}
                                </span>
                                {entry.action_taken && (
                                  <span className="ml-auto rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                                    {entry.action_taken}
                                  </span>
                                )}
                              </div>
                              {entry.body && (
                                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-text">
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
