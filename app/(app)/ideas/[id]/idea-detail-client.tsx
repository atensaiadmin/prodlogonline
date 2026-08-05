"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, PenLine, Clock, Zap, Sparkles, Minus, HelpCircle, AlertTriangle, Check, X } from "lucide-react";
import {
  updateStage,
  updateConviction,
  addEntry,
  editEntry,
  deleteEntry,
  deleteIdea,
} from "@/lib/actions";
import { STAGES, MOODS, IDEA_TYPES } from "@/lib/schema";
import type { Idea, Entry, Addon, Stage, Mood } from "@/lib/schema";
import IdeaResources from "./idea-resources";
import EditIdeaForm from "./edit-idea-form";

const MOOD_ICON: Record<string, React.ReactNode> = {
  excited: <Zap size={14} />,
  hopeful: <Sparkles size={14} />,
  neutral: <Minus size={14} />,
  unsure: <HelpCircle size={14} />,
  frustrated: <AlertTriangle size={14} />,
};

const MOOD_DOT: Record<string, string> = {
  excited: "bg-amber-400",
  hopeful: "bg-emerald-400",
  neutral: "bg-stone-400 dark:bg-stone-600",
  unsure: "bg-indigo-400",
  frustrated: "bg-rose-400",
};

// Conviction bar changes shade by score: low -> all-in.
function convictionGradient(conviction: number) {
  if (conviction <= 3) return "from-rose-500/70 to-rose-500";
  if (conviction <= 6) return "from-amber-500/70 to-amber-500";
  if (conviction <= 8) return "from-emerald-500/70 to-emerald-500";
  return "from-cyan-500/70 to-cyan-500";
}

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
  const [editing, setEditing] = useState(false);
  const [entryBody, setEntryBody] = useState("");
  const [entryMood, setEntryMood] = useState<Mood | "">("");
  const [entryAction, setEntryAction] = useState("");
  const [convictionInput, setConvictionInput] = useState(
    idea.conviction.toString()
  );
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryBody, setEditEntryBody] = useState("");
  const [editEntryMood, setEditEntryMood] = useState<Mood | "">("");
  const [editEntryAction, setEditEntryAction] = useState("");

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

  function startEditEntry(entry: Entry) {
    setEditingEntryId(entry.id);
    setEditEntryBody(entry.body);
    setEditEntryMood(entry.mood ?? "");
    setEditEntryAction(entry.action_taken);
  }

  async function handleEditEntrySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEntryId) return;
    if (!editEntryBody.trim() && !editEntryAction.trim()) return;

    const fd = new FormData();
    fd.set("id", editingEntryId);
    fd.set("body", editEntryBody);
    fd.set("mood", editEntryMood || "");
    fd.set("action_taken", editEntryAction);

    await editEntry(fd);
    setEditingEntryId(null);
    router.refresh();
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm("Delete this log entry?")) return;
    await deleteEntry(id);
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
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text mb-5"
      >
        <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
        All ideas
      </Link>

      {/* Header section */}
      <section className="space-y-3">
        {editing ? (
          <EditIdeaForm
            idea={idea}
            onDone={() => {
              setEditing(false);
              router.refresh();
            }}
          />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${currentStage.color} text-white shadow-sm`}>
                  {currentStage.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {typeDef.label}
                </span>
                {idea.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border/60 bg-surface-2/60 px-2 py-0.5 text-xs font-medium text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-text">
                {idea.title}
              </h1>
              {idea.one_liner && (
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary max-w-2xl">
                  {idea.one_liner}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-2 text-text-muted border border-transparent transition-all hover:border-border-strong hover:bg-surface-2 hover:text-text"
                title="Edit idea"
              >
                <PenLine size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg p-2 text-text-muted border border-transparent transition-all hover:border-rose-500/30 hover:bg-rose-500/8 hover:text-rose-500"
                title="Delete idea"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Conviction bar */}
        <div className="card p-4 space-y-2.5">
          <label className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 px-3.5 py-2.5">
            <span className="text-xs font-medium text-text-muted">Conviction</span>
            <input
              type="number"
              min={1}
              max={10}
              value={convictionInput}
              onChange={(e) => setConvictionInput(e.target.value)}
              onBlur={handleConvictionBlur}
              onKeyDown={(e) => e.key === "Enter" && handleConvictionBlur()}
              className="w-9 bg-transparent text-center text-base font-semibold tabular-nums outline-none text-text"
            />
            <span className="text-xs text-text-muted">/10</span>
          </label>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <span
              className={`block h-full rounded-full bg-gradient-to-r ${convictionGradient(idea.conviction)} transition-all duration-700`}
              style={{ width: `${idea.conviction * 10}%` }}
            />
          </div>
        </div>

        {/* Stage pills */}
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((stage) => (
            <button
              key={stage.key}
              onClick={() => handleStageChange(stage.key)}
              disabled={stage.key === idea.stage}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                stage.key === idea.stage
                  ? `${stage.color} text-white shadow-card`
                  : "border border-border bg-surface/80 text-text-secondary hover:border-border-strong hover:text-text hover:bg-surface"
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </section>

      <IdeaResources idea={idea} addons={addons} />

      {/* Log entry form */}
      <section className="card p-5 space-y-3.5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-text">
          <PenLine size={15} className="text-accent" />
          Log progress
        </h2>
        <form onSubmit={handleEntrySubmit} className="space-y-3">
          <textarea
            value={entryBody}
            onChange={(e) => setEntryBody(e.target.value)}
            rows={3}
            className="input resize-none text-sm leading-relaxed"
            placeholder="What happened? What did you learn?"
          />
          <input
            value={entryAction}
            onChange={(e) => setEntryAction(e.target.value)}
            type="text"
            className="input text-sm"
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
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    active
                      ? "bg-accent text-white shadow-card"
                      : "border border-border bg-surface/80 text-text-secondary hover:border-border-strong hover:bg-surface"
                  }`}
                >
                  <span className="opacity-80">{MOOD_ICON[m.key]}</span>
                  {m.label}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" className="btn-primary px-5 py-2 text-sm font-semibold">
              Log entry
            </button>
          </div>
        </form>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="mb-4 flex items-baseline gap-2 text-sm font-semibold text-text-secondary">
          <Clock size={15} className="text-accent" />
          Progress log
          {entries.length > 0 && (
            <span className="font-normal text-text-muted ml-1.5">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </h2>

        {sortedEntries.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">
              No entries yet. Log the first chapter of this idea above.
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Every log entry is a thread that keeps momentum alive.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-b from-accent/40 via-border to-border">
            {sortedEntries.map((entry) => (
              <li key={entry.id} className="relative pl-10">
                <span
                  className={`absolute top-1.5 left-0 h-[14px] w-[14px] rounded-full border-2 border-bg ${
                    entry.mood && MOOD_DOT[entry.mood]
                      ? MOOD_DOT[entry.mood]
                      : "bg-stone-300 dark:bg-stone-600"
                  }`}
                />
                <div className="card p-4 group/card">
                  {editingEntryId === entry.id ? (
                    <form onSubmit={handleEditEntrySubmit} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-muted">
                          Editing entry ·{" "}
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingEntryId(null)}
                          className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text"
                          title="Close editor"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        value={editEntryBody}
                        onChange={(e) => setEditEntryBody(e.target.value)}
                        rows={3}
                        className="input resize-none text-sm leading-relaxed"
                        placeholder="What happened? What did you learn?"
                      />
                      <input
                        value={editEntryAction}
                        onChange={(e) => setEditEntryAction(e.target.value)}
                        type="text"
                        className="input text-sm"
                        placeholder="Action taken (optional)"
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
                        {MOODS.map((m) => {
                          const active = editEntryMood === m.key;
                          return (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() =>
                                setEditEntryMood(active ? "" : m.key)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                                active
                                  ? "bg-accent text-white shadow-card"
                                  : "border border-border bg-surface/80 text-text-secondary hover:border-border-strong hover:bg-surface"
                              }`}
                            >
                              <span className="opacity-80">{MOOD_ICON[m.key]}</span>
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingEntryId(null)}
                          className="btn-secondary px-3 py-1.5 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary px-3 py-1.5 text-xs font-semibold"
                        >
                          <Check size={13} /> Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1.5">
                        {entry.mood && (
                          <span className="text-xs text-text-muted inline-flex items-center gap-1" title={MOODS.find((m) => m.key === entry.mood)?.label}>
                            {MOOD_ICON[entry.mood]}
                          </span>
                        )}
                        <span className="text-xs font-medium text-text-muted">
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: new Date(entry.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                          })}
                        </span>
                        {entry.action_taken && (
                          <span className="ml-auto inline-flex rounded-md bg-accent-subtle border border-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                            {entry.action_taken}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
                          <button
                            onClick={() => startEditEntry(entry)}
                            className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text"
                            title="Edit entry"
                          >
                            <PenLine size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="rounded p-1 text-text-muted hover:bg-rose-500/10 hover:text-rose-500"
                            title="Delete entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {entry.body && (
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-text">
                          {entry.body}
                        </p>
                      )}
                    </>
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
