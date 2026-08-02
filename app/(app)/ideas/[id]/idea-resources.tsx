"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  BookOpen,
  Github,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  X,
  Shield,
} from "lucide-react";
import {
  updateLinks,
  updateVisibility,
  createAddon,
  toggleAddonVisibility,
  deleteAddon,
} from "@/lib/actions";
import { ADDON_CATEGORIES, VISIBILITY_LEVELS, IDEA_TYPES } from "@/lib/schema";
import type { Idea, Addon, Links, VisibilityLevel, AddonCategory } from "@/lib/schema";

export default function IdeaResources({ idea, addons }: { idea: Idea; addons: Addon[] }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <LinksSection idea={idea} router={router} />
      <AddonsSection ideaId={idea.id} addons={addons} router={router} />
      <VisibilitySection idea={idea} router={router} />
    </div>
  );
}

function LinksSection({ idea, router }: { idea: Idea; router: ReturnType<typeof useRouter> }) {
  const [editing, setEditing] = useState(false);
  const [links, setLinks] = useState<Links>({ ...idea.links });
  const typeDef = IDEA_TYPES.find((t) => t.key === idea.idea_type)!;

  const hasLinks = links.repo || links.deploy || links.docs;

  async function save() {
    await updateLinks(idea.id, links);
    setEditing(false);
    router.refresh();
  }

  function cancel() {
    setLinks({ ...idea.links });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Links
          </h3>
          <div className="flex gap-1.5">
            <button onClick={save} className="btn-primary px-2.5 py-1 text-xs">
              <Check size={12} /> Save
            </button>
            <button onClick={cancel} className="btn-secondary px-2.5 py-1 text-xs">
              <X size={12} />
            </button>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Github size={14} className="shrink-0 text-text-muted" />
            <input
              type="url"
              placeholder={`${typeDef.links.repo} URL`}
              value={links.repo ?? ""}
              onChange={(e) =>
                setLinks((l) => ({ ...l, repo: e.target.value || undefined }))
              }
              className="input flex-1 py-2 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="shrink-0 text-text-muted" />
            <input
              type="url"
              placeholder={`${typeDef.links.deploy} URL`}
              value={links.deploy ?? ""}
              onChange={(e) =>
                setLinks((l) => ({ ...l, deploy: e.target.value || undefined }))
              }
              className="input flex-1 py-2 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="shrink-0 text-text-muted" />
            <input
              type="url"
              placeholder={`${typeDef.links.docs} URL`}
              value={links.docs ?? ""}
              onChange={(e) =>
                setLinks((l) => ({ ...l, docs: e.target.value || undefined }))
              }
              className="input flex-1 py-2 text-xs"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Links
        </h3>
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-accent hover:text-accent-hover"
        >
          {hasLinks ? "Edit" : "Add links"}
        </button>
      </div>
      {hasLinks ? (
        <div className="flex flex-wrap gap-3">
            {links.repo && (
              <a
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
              >
                <Github size={13} /> {typeDef.links.repo} <ExternalLink size={10} />
              </a>
            )}
            {links.deploy && (
              <a
                href={links.deploy}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
              >
                <Globe size={13} /> {typeDef.links.deploy} <ExternalLink size={10} />
              </a>
            )}
            {links.docs && (
              <a
                href={links.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
              >
                <BookOpen size={13} /> {typeDef.links.docs} <ExternalLink size={10} />
              </a>
            )}
        </div>
      ) : (
        <p className="text-xs text-text-muted">
          No links yet. Add repo, deploy, or docs URLs.
        </p>
      )}
    </div>
  );
}

function AddonsSection({
  ideaId,
  addons,
  router,
}: {
  ideaId: string;
  addons: Addon[];
  router: ReturnType<typeof useRouter>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AddonCategory>("other");
  const [accountLabel, setAccountLabel] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const fd = new FormData();
    fd.set("idea_id", ideaId);
    fd.set("name", name);
    fd.set("category", category);
    fd.set("account_label", accountLabel);
    fd.set("url", url);
    fd.set("notes", notes);
    await createAddon(fd);
    setName("");
    setCategory("other");
    setAccountLabel("");
    setUrl("");
    setNotes("");
    setAdding(false);
    router.refresh();
  }

  async function handleToggle(id: string) {
    await toggleAddonVisibility(id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteAddon(id);
    router.refresh();
  }

  return (
    <div className="card p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Add-ons &amp; Services
          {addons.length > 0 && (
            <span className="ml-1.5 font-normal text-text-muted">
              ({addons.length})
            </span>
          )}
        </h3>
        <button
          onClick={() => setAdding(!adding)}
          className="btn-primary px-2.5 py-1 text-xs"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2.5 rounded-lg border border-dashed border-border bg-surface-2/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Service name (e.g. Supabase)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input py-2 text-xs"
              autoFocus
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AddonCategory)}
              className="input py-2 text-xs"
            >
              {ADDON_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Account label (e.g. free tier)"
              value={accountLabel}
              onChange={(e) => setAccountLabel(e.target.value)}
              className="input py-2 text-xs"
            />
            <input
              type="url"
              placeholder="Dashboard URL (optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input py-2 text-xs"
            />
          </div>
          <input
            type="text"
            placeholder="Notes (e.g. max 3 projects on free tier)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input py-2 text-xs"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="btn-secondary px-2.5 py-1 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-2.5 py-1 text-xs">
              Save
            </button>
          </div>
        </form>
      )}

      {addons.length === 0 && !adding ? (
        <p className="text-xs text-text-muted">
          Track services used here — hosting, databases, auth, etc. Helps you remember
          which account, which tier, and avoid forgotten free-tier setups.
        </p>
      ) : (
        <div className="space-y-2">
          {addons.map((addon) => {
            const cat = ADDON_CATEGORIES.find((c) => c.key === addon.category);
            return (
              <div
                key={addon.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${
                  addon.visible ? "border-border bg-surface-2/50" : "border-dashed border-border/50 opacity-60"
                }`}
              >
                {/* Removed emoji icon; using label chip only */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text">{addon.name}</span>
                    <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-text-muted">
                      {cat?.label}
                    </span>
                    {addon.account_label && (
                      <span className="text-xs text-text-muted">
                        · {addon.account_label}
                      </span>
                    )}
                  </div>
                  {addon.notes && (
                    <p className="mt-0.5 text-xs text-text-secondary">{addon.notes}</p>
                  )}
                  {addon.url && (
                    <a
                      href={addon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      Open dashboard <ExternalLink size={9} />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    onClick={() => handleToggle(addon.id)}
                    className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                    title={addon.visible ? "Hide when sharing" : "Show when sharing"}
                  >
                    {addon.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id)}
                    className="rounded-md p-1 text-text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                    title="Remove addon"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VisibilitySection({
  idea,
  router,
}: {
  idea: Idea;
  router: ReturnType<typeof useRouter>;
}) {
  const [open, setOpen] = useState(false);

  async function handleChange(level: VisibilityLevel) {
    await updateVisibility(idea.id, level);
    router.refresh();
  }

  const current = VISIBILITY_LEVELS.find((v) => v.key === idea.visibility);

  return (
    <div className="card p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          <Shield size={12} />
          Sharing visibility
        </h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs font-medium text-accent hover:text-accent-hover"
        >
          {open ? "Close" : "Change"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
          {current?.label}
        </span>
        <span className="text-xs text-text-muted">{current?.description}</span>
      </div>

      {open && (
        <div className="space-y-1 rounded-lg border border-dashed border-border bg-surface-2/50 p-2">
          {VISIBILITY_LEVELS.map((level) => {
            const active = level.key === idea.visibility;
            return (
              <button
                key={level.key}
                onClick={() => handleChange(level.key)}
                className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{level.label}</span>
                  {active && <Check size={13} />}
                </div>
                <p className="mt-0.5 text-xs opacity-70">{level.description}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
