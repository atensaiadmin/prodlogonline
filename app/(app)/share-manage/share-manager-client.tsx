"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Copy,
  Pencil,
  X,
} from "lucide-react";
import {
  createShareProfile,
  setProfileIdeas,
  renameShareProfile,
  deleteShareProfile,
} from "@/lib/actions";
import { STAGES, VISIBILITY_LEVELS, IDEA_TYPES } from "@/lib/schema";
import type { ShareProfile, Idea } from "@/lib/schema";

export default function ShareManagerClient({
  profiles,
  ideas,
  profileIdeaIds,
}: {
  profiles: ShareProfile[];
  ideas: Idea[];
  profileIdeaIds: Record<string, string[]>;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles[0]?.id ?? null
  );
  const [localSelections, setLocalSelections] = useState<Record<string, string[]>>(
    profileIdeaIds
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const profile = await createShareProfile(newName);
    setNewName("");
    setCreating(false);
    setSelectedProfileId(profile.id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this share profile?")) return;
    await deleteShareProfile(id);
    if (selectedProfileId === id) setSelectedProfileId(null);
    router.refresh();
  }

  async function handleRename(id: string, name: string) {
    await renameShareProfile(id, name);
    setEditingId(null);
    router.refresh();
  }

  async function handleToggleIdea(profileId: string, ideaId: string) {
    const current = localSelections[profileId] ?? [];
    const next = current.includes(ideaId)
      ? current.filter((id) => id !== ideaId)
      : [...current, ideaId];
    setLocalSelections((prev) => ({ ...prev, [profileId]: next }));
    await setProfileIdeas(profileId, next);
    router.refresh();
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const shareableIdeas = ideas.filter((i) => i.visibility !== "private");
  const shareUrl = selectedProfile
    ? `${window.location.origin}/share/${selectedProfile.slug}`
    : "";

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <section className="space-y-1">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Share profiles
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text">
          Curate what you share
        </h1>
        <p className="max-w-xl text-sm text-text-secondary">
          Create a share profile, pick the ideas to include, and send the link.
          Each idea respects its visibility settings — you control what the
          reviewer sees.
        </p>
      </section>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCreating(true)}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          <Plus size={14} />
          New profile
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card flex gap-2 p-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile name (e.g. Client pitch, Mentor review)"
            className="input flex-1 py-2 text-xs"
            autoFocus
          />
          <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
            Create
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="btn-secondary px-2.5 py-1 text-xs"
          >
            <X size={12} />
          </button>
        </form>
      )}

      {profiles.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">
            No share profiles yet. Create one above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-1">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  profile.id === selectedProfileId
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{profile.name}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {new Date(profile.updated_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedProfile && (
            <div className="card space-y-4 p-4 sm:col-span-3">
              <div className="flex items-center justify-between">
                {editingId === selectedProfile.id ? (
                  <RenameForm
                    current={selectedProfile.name}
                    onSave={(n) => handleRename(selectedProfile.id, n)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text">
                      {selectedProfile.name}
                    </h3>
                    <button
                      onClick={() => setEditingId(selectedProfile.id)}
                      className="rounded p-0.5 text-text-muted hover:text-text"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(selectedProfile.id)}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                  title="Delete profile"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/50 p-2">
                <code className="flex-1 truncate text-xs text-text-secondary">
                  {shareUrl}
                </code>
                <button
                  onClick={copyUrl}
                  className="btn-secondary px-2 py-1 text-xs"
                >
                  <Copy size={12} />
                  Copy
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-2 py-1 text-xs"
                >
                  <ExternalLink size={12} />
                  Open
                </a>
              </div>

              <div>
                <h4 className="mb-2 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Select ideas to share
                </h4>
                {shareableIdeas.length === 0 ? (
                  <p className="text-xs text-text-muted">
                    No shareable ideas yet. Set an idea&apos;s visibility to
                    anything other than &quot;Private&quot; to make it
                    appear here.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {shareableIdeas.map((idea) => {
                      const stage = STAGES.find((s) => s.key === idea.stage)!;
                      const typeDef = IDEA_TYPES.find((t) => t.key === (idea.idea_type ?? "app"))!;
                      const vis = VISIBILITY_LEVELS.find(
                        (v) => v.key === idea.visibility
                      )!;
                      const selectedIds = localSelections[selectedProfile.id] ?? [];
                      const checked = selectedIds.includes(idea.id);

                      return (
                        <label
                          key={idea.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                            checked
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-border-strong"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handleToggleIdea(selectedProfile.id, idea.id)
                            }
                            className="mt-0.5 accent-accent"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-text truncate">
                                {typeDef.icon} {idea.title}
                              </span>
                              <span
                                className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${stage.color} text-white`}
                              >
                                {stage.label}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                              <span>{vis?.label}</span>
                              {idea.links?.repo && <span>· Repo</span>}
                              {idea.links?.deploy && <span>· Deploy</span>}
                              {idea.links?.docs && <span>· Docs</span>}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RenameForm({
  current,
  onSave,
  onCancel,
}: {
  current: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(current);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (val.trim()) onSave(val.trim());
      }}
      className="flex items-center gap-1.5"
    >
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="input py-1.5 text-xs"
        autoFocus
      />
      <button
        type="submit"
        className="rounded p-1 text-emerald-600 hover:bg-emerald-500/10"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded p-1 text-text-muted hover:bg-surface-2"
      >
        <X size={14} />
      </button>
    </form>
  );
}
