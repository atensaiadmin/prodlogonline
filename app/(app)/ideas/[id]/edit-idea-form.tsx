"use client";

import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { editIdea } from "@/lib/client-actions";
import { IDEA_TYPES } from "@/lib/schema";
import type { Idea, IdeaType } from "@/lib/schema";

export default function EditIdeaForm({
  idea,
  onDone,
}: {
  idea: Idea;
  onDone: () => void;
}) {
  const [ideaType, setIdeaType] = useState<IdeaType>(idea.idea_type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("idea_type", ideaType);
      await editIdea(fd);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-none space-y-4 p-5 sm:p-6">
      <input type="hidden" name="id" value={idea.id} />

      <div>
        <label
          htmlFor="edit-title"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Title <span className="ml-1 text-rose-500">*</span>
        </label>
        <input
          id="edit-title"
          name="title"
          type="text"
          required
          defaultValue={idea.title}
          className="input h-10 text-sm"
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="edit-one-liner"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          One-liner
        </label>
        <textarea
          id="edit-one-liner"
          name="one_liner"
          rows={3}
          defaultValue={idea.one_liner}
          className="input resize-y text-sm leading-relaxed"
          placeholder="Briefly describe the idea..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {IDEA_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setIdeaType(t.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                ideaType === t.key
                  ? "bg-accent text-white shadow-card"
                  : "border border-border bg-surface/80 text-text-secondary hover:border-border-strong"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-text-secondary">
        <input
          type="checkbox"
          name="mobile"
          defaultChecked={idea.mobile}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Mobile-friendly / mobile-first
      </label>

      <div>
        <label
          htmlFor="edit-tags"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Tags (comma-separated)
        </label>
        <input
          id="edit-tags"
          name="tags"
          type="text"
          defaultValue={idea.tags.join(", ")}
          className="input h-10 text-sm"
          placeholder="e.g. saas, b2b, ai"
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-500">{error}</p>
      )}

      <div className="flex gap-2 border-t border-border pt-4">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-5 py-2 text-sm font-semibold"
        >
          <Check size={14} /> {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="btn-secondary px-5 py-2 text-sm font-semibold"
        >
          <X size={14} /> Cancel
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <Sparkles size={11} />
        Links, visibility, conviction, and add-ons are edited in the sections below.
      </p>
    </form>
  );
}
