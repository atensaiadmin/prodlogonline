"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, PenLine } from "lucide-react";
import {
  updateStage,
  updateConviction,
  addEntry,
  deleteIdea,
} from "@/lib/actions";
import { STAGES, MOODS, IDEA_TYPES } from "@/lib/schema";
import type { Idea, Entry, Addon, Stage, Mood } from "@/lib/schema";
import IdeaResources from "./idea-resources";

const MOOD_EMOJI: Record<string, string> = {
  excited: "⚡",
  hopeful: "🌱",
  neutral: "—",
  unsure: "🤔",
  frustrated: "😤",
};

const MOOD_DOT: Record<string, string> = {
  excited: "bg-amber-400",
  hopeful: "bg-emerald-400",
  neutral: "bg-stone-300",
  unsure: "bg-indigo-300",
  frustrated: "bg-rose-400",
};

export default function IdeaDetailPage({
  idea,
  entries,
  addons,
}: {
  idea: Idea;
  entries: Entry[];
  addons: Addon[];
}) {
  const router = useRouter();
  const [entryBody, setEntryBody] = useState("");
  const [entryMood, setEntryMood] = useState<Mood | "">("");
  const [entryAction, setEntryAction] = useState("");
  const [convictionInput, setConvictionInput] = useState(
    idea.conviction.toString()
  );

  async function handleStageChange(newStage: Stage) {
    await updateStage(idea.id, newStage);
    router.refresh();
  }

  async function handleConvictionBlur() {
    const val = parseInt(convictionInput);
    if (val && val >= 1 && val <= 10) {
      await updateConviction(idea.id, val);
      router.refresh();
    } else {
      setConvictionInput(idea.conviction.toString());
    }
  }

  async function handleEntrySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryBody.trim() && !entryAction.trim()) return;

    const fd = new FormData();
    fd.set("idea_id", idea.id);
    fd.set("body", entryBody);
    fd.set("mood", entryMood || "");
    fd.set("action_taken", entryAction);

    await addEntry(fd);
    setEntryBody("");
    setEntryMood("");
    setEntryAction("");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this idea and all its entries?")) return;
    await deleteIdea(idea.id);
    router.push("/");
  }

  const currentStage = STAGES.find((s) => s.key === idea.stage)!;
  const typeDef = IDEA_TYPES.find((t) => t.key === idea.idea_type)!;
  const sortedEntries = [...entries];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text"
      >
        <ArrowLeft size={14} />
        All ideas
      </Link>

      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${currentStage.color} text-white`}>
                {currentStage.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                {typeDef.label}
              </span>
              {idea.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-text sm:text-4xl">
              {idea.title}
            </h1>
            {idea.one_liner && (
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {idea.one_liner}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            title="Delete idea"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs">
            <span className="text-text-muted">Conviction</span>
            <input
              type="number"
              min={1}
              max={10}
              value={convictionInput}
              onChange={(e) => setConvictionInput(e.target.value)}
              onBlur={handleConvictionBlur}
              onKeyDown={(e) => e.key === "Enter" && handleConvictionBlur()}
              className="w-6 bg-transparent text-center font-semibold tabular-nums outline-none"
            />
            <span className="text-text-muted">/10</span>
          </label>
          <span className="h-1 w-24 overflow-hidden rounded-full bg-surface-2">
            <span
              className="block h-full rounded-full bg-accent/70"
              style={{ width: `${idea.conviction * 10}%` }}
            />
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((stage) => (
            <button
              key={stage.key}
              onClick={() => handleStageChange(stage.key)}
              disabled={stage.key === idea.stage}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.97] ${
                stage.key === idea.stage
                  ? `${stage.color} text-white shadow-card`
                  : "border border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text"
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </section>

      <IdeaResources idea={idea} addons={addons} />

      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          <PenLine size={13} />
          Log progress
        </h2>
        <form onSubmit={handleEntrySubmit} className="space-y-3">
          <textarea
            value={entryBody}
            onChange={(e) => setEntryBody(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="What happened? What did you learn?"
          />
          <input
            value={entryAction}
            onChange={(e) => setEntryAction(e.target.value)}
            type="text"
            className="input"
            placeholder="Action taken (optional)"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {MOODS.map((m) => {
              const active = entryMood === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setEntryMood(active ? "" : m.key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                    active
                      ? "bg-accent text-white shadow-card"
                      : "border border-border bg-surface text-text-secondary hover:border-border-strong"
                  }`}
                >
                  {MOOD_EMOJI[m.key]} {m.label}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Log entry
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 flex items-baseline gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Progress log
          {entries.length > 0 && (
            <span className="font-normal text-text-muted">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </h2>

        {sortedEntries.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">
              No entries yet. Log the first chapter of this idea above.
            </p>
            <p className="text-xs text-text-muted">
              Every log entry is a thread that keeps momentum alive.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {sortedEntries.map((entry) => (
              <li key={entry.id} className="relative pl-8">
                <span
                  className={`absolute top-1.5 left-0 h-[15px] w-[15px] rounded-full border-2 border-bg ${
                    entry.mood && MOOD_DOT[entry.mood]
                      ? MOOD_DOT[entry.mood]
                      : "bg-stone-300"
                  }`}
                />
                <div className="card p-4">
                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <span
                        className="text-xs"
                        title={MOODS.find((m) => m.key === entry.mood)?.label}
                      >
                        {MOOD_EMOJI[entry.mood]}
                      </span>
                    )}
                    <span className="text-xs font-medium text-text-muted">
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {entry.action_taken && (
                      <span className="ml-auto rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
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
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
