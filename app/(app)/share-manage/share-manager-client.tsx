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
  Share2,
  Sparkles,
} from "lucide-react";
import {
  createShareProfile,
  setProfileIdeas,
  renameShareProfile,
  deleteShareProfile,
  updateShareProfileDescription,
  updateShareProfileLayer,
} from "@/lib/actions";
import { STAGES, VISIBILITY_LEVELS, IDEA_TYPES, PROFILE_LAYERS } from "@/lib/schema";
import type { ShareProfile, Idea, ProfileLayer } from "@/lib/schema";

function describeError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

// An idea is share-ready when it has a one-liner plus a link (or paper) and
// isn't private — enough for a shared profile to look intentional.
function shareReady(idea: Idea): boolean {
  if (idea.visibility === "private") return false;
  const hasLink =
    !!idea.links?.repo ||
    !!idea.links?.deploy ||
    !!idea.links?.preview ||
    !!idea.links?.docs;
  return !!idea.one_liner && (hasLink || !!idea.paper);
}

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const profile = await createShareProfile(newName);
      setNewName("");
      setCreating(false);
      setSelectedProfileId(profile.id);
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this share profile?")) return;
    setError(null);
    try {
      await deleteShareProfile(id);
      if (selectedProfileId === id) setSelectedProfileId(null);
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleRename(id: string, name: string) {
    setError(null);
    try {
      await renameShareProfile(id, name);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleSaveDescription(id: string, description: string) {
    setError(null);
    try {
      await updateShareProfileDescription(id, description);
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleLayerChange(id: string, layer: ProfileLayer) {
    setError(null);
    try {
      await updateShareProfileLayer(id, layer);
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleToggleIdea(profileId: string, ideaId: string) {
    const current = localSelections[profileId] ?? [];
    const next = current.includes(ideaId)
      ? current.filter((id) => id !== ideaId)
      : [...current, ideaId];
    setLocalSelections((prev) => ({ ...prev, [profileId]: next }));
    setError(null);
    try {
      await setProfileIdeas(profileId, next);
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const shareableIdeas = ideas.filter((i) => i.visibility !== "private");
  const readyCount = ideas.filter(shareReady).length;
  const shareUrl = selectedProfile
    ? `${window.location.origin}/share/${selectedProfile.slug}`
    : "";

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text mb-5"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <section className="space-y-1">
          <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-muted">
            Share profiles
          </p>
          <h1 className="font-display text-2xl font-medium tracking-tight text-text sm:text-3xl">
            Curate what you share
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
            Create a share profile, pick the ideas to include, and send the
            link. Each idea respects its visibility settings — you control what
            the reviewer sees.
          </p>
        </section>

        <button
          onClick={() => setCreating(true)}
          className="btn-primary shrink-0 px-4 py-2 text-xs font-semibold"
        >
          <Plus size={14} />
          New profile
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {profiles.length > 0 && ideas.length > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Sparkles size={15} className="text-accent" />
            <span className="text-sm text-text-secondary">
              <span className="font-semibold text-text">{readyCount}</span> of{" "}
              {ideas.length} ideas ready to share
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Ready = has a one-liner plus a link or paper, and isn&apos;t private.
          </p>
        </div>
      )}

      {creating && (
        <form onSubmit={handleCreate} className="card flex gap-2 p-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile name (e.g. Client pitch, Mentor review)"
            className="input flex-1 text-sm py-2"
            autoFocus
          />
          <button type="submit" className="btn-primary px-3 py-1.5 text-xs font-semibold">
            Create
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="btn-secondary px-2 py-1 text-xs"
          >
            <X size={12} />
          </button>
        </form>
      )}

      {profiles.length === 0 ? (
        <div className="card flex flex-col items-center gap-2.5 px-6 py-12 text-center">
          <Share2 size={20} className="text-text-muted/30" />
          <p className="mt-1.5 text-sm text-text-secondary">
            No share profiles yet. Create one above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[200px_1fr] gap-4">
          {/* Profile list */}
          <div className="space-y-1.5">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`relative w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                  profile.id === selectedProfileId
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-text-secondary hover:bg-surface-2/60 hover:text-text"
                }`}
              >
                {profile.id === selectedProfileId && (
                  <span className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
                )}
                <span className={`block truncate ${profile.id === selectedProfileId ? "pl-2.5" : ""}`}>
                  {profile.name}
                </span>
                <span className="block text-[11px] text-text-muted mt-0.5">
                  {new Date(profile.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selectedProfile && (
            <div className="card space-y-4 p-5">
              <div className="flex items-center justify-between">
                {editingId === selectedProfile.id ? (
                  <RenameForm
                    current={selectedProfile.name}
                    onSave={(n) => handleRename(selectedProfile.id, n)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-semibold text-text">
                      {selectedProfile.name}
                    </h3>
                    <button
                      onClick={() => setEditingId(selectedProfile.id)}
                      className="rounded p-1 text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    >
                      <Pencil size={13} />
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

              {/* URL bar */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/50 p-2">
                <code className="flex-1 truncate text-xs text-text-secondary break-all">
                  {shareUrl}
                </code>
                <button
                  onClick={copyUrl}
                  className="btn-secondary px-2.5 py-1.5 text-xs"
                >
                  <Copy size={13} /> Copy
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-2.5 py-1.5 text-xs"
                >
                  <ExternalLink size={13} /> Open
                </a>
              </div>

              {/* Profile description */}
              <DescriptionEditor
                key={selectedProfile.id}
                initial={selectedProfile.description ?? ""}
                onSave={(d) => handleSaveDescription(selectedProfile.id, d)}
              />

              {/* What this profile shows (Pitch / Tech / Full) */}
              <LayerSelector
                key={`layer-${selectedProfile.id}`}
                current={selectedProfile.layer ?? "pitch"}
                onSelect={(l) => handleLayerChange(selectedProfile.id, l)}
              />

              {/* Checkbox list for idea selection */}
              <div>
                <h4 className="mb-2.5 font-mono text-[0.75rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
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
                      const vis = VISIBILITY_LEVELS.find(
                        (v) => v.key === idea.visibility
                      )!;
                      const selectedIds = localSelections[selectedProfile.id] ?? [];
                      const checked = selectedIds.includes(idea.id);

                      return (
                        <label
                          key={idea.id}
                          className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
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
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent checked:bg-accent checked:focus:ring-accent/30 focus:ring-accent/30"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-text truncate">{idea.title}</span>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${stage.color} text-white`}
                              >
                                {stage.label}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                              <span>{vis?.label}</span>
                              {idea.links?.repo && <span>· Repo</span>}
                              {idea.links?.deploy && <span>· Deploy</span>}
                              {idea.links?.preview && <span>· Preview</span>}
                              {idea.links?.docs && <span>· Docs</span>}
                              {idea.paper && <span>· Paper</span>}
                              <span
                                className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                                  shareReady(idea)
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-surface-2/70 text-text-muted"
                                }`}
                              >
                                {shareReady(idea) ? (
                                  <>
                                    <Check size={10} /> Ready
                                  </>
                                ) : (
                                  "Needs more"
                                )}
                              </span>
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
        className="input py-1.5 text-sm"
        autoFocus
      />
      <button
        type="submit"
        className="rounded p-1.5 text-emerald-600 hover:bg-emerald-500/10"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded p-1.5 text-text-muted hover:bg-surface-2"
      >
        <X size={13} />
      </button>
    </form>
  );
}

function DescriptionEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (description: string) => void;
}) {
  const [val, setVal] = useState(initial);
  const [dirty, setDirty] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Description
        </h4>
        {dirty && (
          <button
            onClick={() => onSave(val.trim())}
            className="btn-primary px-2.5 py-1 text-xs font-semibold"
          >
            <Check size={12} /> Save
          </button>
        )}
      </div>
      <textarea
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setDirty(true);
        }}
        rows={5}
        maxLength={2000}
        placeholder="Short description shown at the top of your share page — e.g. Building in public: web apps, tools, and side projects."
        className="input w-full resize-y text-sm py-2"
      />
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>Optional — appears under your profile name for anyone viewing the link.</span>
        <span className="tabular-nums">{val.length}/2000</span>
      </div>
    </div>
  );
}

function LayerSelector({
  current,
  onSelect,
}: {
  current: ProfileLayer;
  onSelect: (layer: ProfileLayer) => void;
}) {
  const active = PROFILE_LAYERS.find((l) => l.key === current)!;
  return (
    <div className="space-y-1.5">
      <h4 className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
        What this profile shows
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {PROFILE_LAYERS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => onSelect(l.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              current === l.key
                ? "bg-accent text-white shadow-card"
                : "border border-border bg-surface/80 text-text-secondary hover:border-border-strong"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-text-muted">{active.description}</p>
    </div>
  );
}
