"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, Plus, Trash2, PenLine, Check, X } from "lucide-react";
import { addBug, editBug, deleteBug, updateBugStatus } from "@/lib/client-actions";
import { BUG_STATUSES, BUG_SEVERITIES } from "@/lib/schema";
import type { Bug as BugType, BugStatus, BugSeverity } from "@/lib/schema";

export default function IdeaBugs({
  ideaId,
  bugs,
}: {
  ideaId: string;
  bugs: BugType[];
}) {
  const router = useRouter();

  // Quick-add draft
  const [draft, setDraft] = useState("");
  const [draftSeverity, setDraftSeverity] = useState<BugSeverity>("medium");
  const [adding, setAdding] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<BugStatus>("open");
  const [editSeverity, setEditSeverity] = useState<BugSeverity>("medium");

  const [error, setError] = useState<string | null>(null);

  const openCount = bugs.filter(
    (b) => b.status === "open" || b.status === "in_progress"
  ).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setError(null);
    setAdding(true);
    try {
      const fd = new FormData();
      fd.set("idea_id", ideaId);
      fd.set("title", title);
      fd.set("status", "open");
      fd.set("severity", draftSeverity);
      await addBug(fd);
      setDraft("");
      setDraftSeverity("medium");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't add the bug. Please try again."
      );
    } finally {
      setAdding(false);
    }
  }

  function startEdit(bug: BugType) {
    setEditingId(bug.id);
    setEditTitle(bug.title);
    setEditStatus(bug.status);
    setEditSeverity(bug.severity);
    setError(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const title = editTitle.trim();
    if (!title) return;
    try {
      const fd = new FormData();
      fd.set("id", editingId);
      fd.set("title", title);
      fd.set("status", editStatus);
      fd.set("severity", editSeverity);
      await editBug(fd);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't save the bug. Please try again."
      );
    }
  }

  async function handleToggle(bug: BugType) {
    // Quick checkbox: flip between open and fixed.
    const next: BugStatus = bug.status === "fixed" ? "open" : "fixed";
    try {
      await updateBugStatus(bug.id, next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't update the bug. Please try again."
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bug?")) return;
    try {
      await deleteBug(id);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't delete the bug. Please try again."
      );
    }
  }

  return (
    <section className="card p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-text">
          <Bug size={15} className="text-accent" />
          Bugs to fix
          {openCount > 0 && (
            <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-xs font-medium tabular-nums text-rose-600 dark:text-rose-400">
              {openCount} open
            </span>
          )}
        </h2>
        <span className="text-xs text-text-muted">
          One-line issues, Jira-style
        </span>
      </div>

      {/* Quick add */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          type="text"
          className="input h-9 flex-1 text-sm"
          placeholder="Log a bug or issue to fix…"
          autoComplete="off"
        />
        <select
          value={draftSeverity}
          onChange={(e) => setDraftSeverity(e.target.value as BugSeverity)}
          className="input h-9 w-auto text-xs"
          title="Severity"
        >
          {BUG_SEVERITIES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding || !draft.trim()}
          className="btn-primary h-9 shrink-0 px-3.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={14} /> Add
        </button>
      </form>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

      {/* Bug list */}
      {bugs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-2/40 px-4 py-6 text-center">
          <p className="text-sm text-text-secondary">No bugs logged yet.</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Add a one-line note for each issue you need to fix.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {bugs.map((bug) => {
            const status = BUG_STATUSES.find((s) => s.key === bug.status)!;
            const severity = BUG_SEVERITIES.find((s) => s.key === bug.severity)!;
            const fixed = bug.status === "fixed";
            return (
              <li
                key={bug.id}
                className="group flex items-start gap-2.5 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5 transition-colors hover:border-border-strong"
              >
                {editingId === bug.id ? (
                  <form onSubmit={handleEdit} className="flex w-full flex-col gap-2">
                    <textarea
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      rows={2}
                      autoFocus
                      className="input resize-none text-sm"
                      placeholder="Describe the bug…"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as BugStatus)}
                        className="input h-8 w-auto text-xs"
                      >
                        {BUG_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editSeverity}
                        onChange={(e) =>
                          setEditSeverity(e.target.value as BugSeverity)
                        }
                        className="input h-8 w-auto text-xs"
                      >
                        {BUG_SEVERITIES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <div className="ml-auto flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="btn-secondary h-8 px-2.5 text-xs font-semibold"
                        >
                          <X size={13} /> Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!editTitle.trim()}
                          className="btn-primary h-8 px-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Check size={13} /> Save
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Toggle open/fixed */}
                    <button
                      onClick={() => handleToggle(bug)}
                      title={fixed ? "Mark open" : "Mark fixed"}
                      aria-label={fixed ? "Mark open" : "Mark fixed"}
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all active:scale-90 ${
                        fixed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border-strong bg-surface hover:border-emerald-500"
                      }`}
                    >
                      {fixed && <Check size={11} strokeWidth={3} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-relaxed break-words ${
                          fixed
                            ? "text-text-muted line-through decoration-text-muted/40"
                            : "text-text"
                        }`}
                      >
                        {bug.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-muted"
                          title={`${severity.label} severity`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${severity.dot}`} />
                          {severity.label}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {new Date(bug.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(bug)}
                        className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text"
                        title="Edit bug"
                      >
                        <PenLine size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(bug.id)}
                        className="rounded p-1 text-text-muted hover:bg-rose-500/10 hover:text-rose-500"
                        title="Delete bug"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
