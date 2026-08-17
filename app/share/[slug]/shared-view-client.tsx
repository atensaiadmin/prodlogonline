"use client";

import { useState } from "react";
import { Github, Globe, BookOpen, ExternalLink, Layers, History, Package, ChevronDown, ChevronRight, Zap, Sparkles, Minus, HelpCircle, AlertTriangle, Eye, FileText, Smartphone } from "lucide-react";
import { STAGES, MOODS, ADDON_CATEGORIES, IDEA_TYPES } from "@/lib/schema";
import { convictionGradient } from "@/app/(app)/components/conviction-slider";
import { PB_URL } from "@/lib/pb";
import type { ShareProfile, SharedIdea, Stage, VisibilityLevel, ProfileLayer } from "@/lib/schema";

const MOOD_ICON: Record<string, React.ReactNode> = {
  excited: <Zap size={12} className="text-amber-500" />,
  hopeful: <Sparkles size={12} className="text-emerald-500" />,
  neutral: <Minus size={12} className="text-stone-400" />,
  unsure: <HelpCircle size={12} className="text-indigo-400" />,
  frustrated: <AlertTriangle size={12} className="text-rose-500" />,
};

// What a profile layer allows on the share page.
function layerFlags(layer: ProfileLayer) {
  switch (layer) {
    case "pitch":
      return { showRepo: false, showDeploy: true, showPreview: true, showDocs: true, showAddons: false, showEntries: false };
    case "tech":
      return { showRepo: true, showDeploy: true, showPreview: true, showDocs: true, showAddons: false, showEntries: false };
    case "full":
      return { showRepo: true, showDeploy: true, showPreview: true, showDocs: true, showAddons: true, showEntries: true };
  }
}

// Per-idea caps: an idea's own visibility can still hide more.
function capOneLiner(visibility: VisibilityLevel) {
  return visibility === "summary" || visibility === "full";
}
function capDocs(visibility: VisibilityLevel) {
  return visibility === "docs" || visibility === "summary" || visibility === "full";
}
function capFull(visibility: VisibilityLevel) {
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <section className="space-y-1.5">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="space-y-1">
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-muted">
              Shared portfolio
            </p>
            <h1 className="font-display text-2xl font-medium tracking-tight text-text sm:text-3xl">
              {profile.name}
            </h1>
          </div>
          <span className="shrink-0 rounded-full border border-border/70 bg-surface-2/50 px-3 py-1 text-xs font-medium tabular-nums text-text-secondary">
            {ideas.length} project{ideas.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
          {profile.description || "A curated collection of projects in progress."}
        </p>
      </section>

      {ideas.length === 0 ? (
        <div className="card flex flex-col items-center gap-2.5 px-6 py-14 text-center">
          <Layers size={24} className="text-text-muted/30" />
          <p className="mt-1.5 text-sm text-text-secondary">
            This portfolio is empty or all ideas are marked private.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map(({ idea, addons, entries }) => {
            const stage = STAGES.find((s) => s.key === idea.stage)!;
            const typeDef = IDEA_TYPES.find((t) => t.key === (idea.idea_type ?? "app"))!;
            const expanded = expandedId === idea.id;
            const lf = layerFlags(profile.layer ?? "pitch");
            const showOneLiner = capOneLiner(idea.visibility);
            const showRepo = lf.showRepo && !!idea.share_links?.repo;
            const showDeploy = lf.showDeploy && !!idea.share_links?.deploy;
            const showPreview = lf.showPreview && !!idea.share_links?.preview;
            const showDocs = lf.showDocs && capDocs(idea.visibility) && !!idea.share_links?.docs;
            const showAddons = lf.showAddons && capFull(idea.visibility);
            const showEntries = lf.showEntries && capFull(idea.visibility);
            const showLinks = showRepo || showDeploy || showPreview || showDocs;
            const showPaper = !!idea.paper;

            return (
              <div key={idea.id} className="card overflow-hidden rounded-xl">
                <button
                  onClick={() => setExpandedId(expanded ? null : idea.id)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2/40"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stage.color} text-white shadow-sm`}
                      >
                        {stage.label}
                      </span>
                      <span className="rounded-md border border-border/60 bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {typeDef.icon} {typeDef.label}
                      </span>
                      {idea.mobile && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-2/60 px-2 py-0.5 text-xs font-medium text-text-secondary">
                          <Smartphone size={11} /> Mobile
                        </span>
                      )}
                      {idea.paper && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-2/60 px-2 py-0.5 text-xs font-medium text-text-secondary">
                          <FileText size={11} /> Paper
                        </span>
                      )}
                      {idea.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-surface-2/60 px-2 py-0.5 text-xs font-medium text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-base font-semibold text-text">
                      {idea.title}
                    </h3>
                    {showOneLiner && idea.one_liner && (
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
                        {idea.one_liner}
                      </p>
                    )}
                    {showOneLiner && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-text-muted flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${convictionGradient(idea.conviction)}`}
                              style={{ width: `${idea.conviction * 10}%` }}
                            />
                          </div>
                          Conviction <span className="font-medium text-text">{idea.conviction}/10</span>
                        </span>
                        {showEntries && entries.length > 0 && (
                          <span className="flex items-center gap-1">
                            <History size={13} /> {entries.length}{" "}
                            {entries.length === 1 ? "entry" : "entries"}
                          </span>
                        )}
                        {showAddons && addons.filter((a) => a.visible).length > 0 && (
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
                  <div className="border-t border-border/60 px-4 pb-4 pt-3.5 space-y-4">
                    {showLinks && (idea.links?.repo || idea.links?.deploy || idea.links?.preview || (showDocs && idea.links?.docs)) && (
                      <div className="flex flex-wrap gap-2.5">
                        {showRepo && idea.links?.repo && (
                          <a
                            href={idea.links.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <Github size={13} /> {typeDef.links.repo} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        {showDeploy && idea.links?.deploy && (
                          <a
                            href={idea.links.deploy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <Globe size={13} /> {typeDef.links.deploy} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        {showPreview && idea.links?.preview && (
                          <a
                            href={idea.links.preview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <Eye size={13} /> Preview <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
                        {showPaper && (
                          <a
                            href={`${PB_URL}/api/files/ideas/${idea.id}/${idea.paper}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
                          >
                            <FileText size={13} /> Paper <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                      </div>
                    )}

                    {showAddons && addons.filter((a) => a.visible).length > 0 && (
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

                    {showEntries && entries.length > 0 && (
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
