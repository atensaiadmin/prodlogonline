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
  Link2,
  Package,
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
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
            <Link2 size={15} className="text-accent" />
            Links
          </h3>
          <div className="flex gap-1.5">
            <button onClick={save} className="btn-primary px-3 py-1.5 text-xs font-semibold">
              <Check size={13} /> Save
            </button>
            <button onClick={cancel} className="btn-secondary px-3 py-1.5 text-xs font-semibold">
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="relative flex items-center gap-2">
            <Github size={14} className="shrink-0 absolute left-3 text-text-muted" />
            <input
              type="url"
              placeholder={`${typeDef.links.repo} URL`}
              value={links.repo ?? ""}
              onChange={(e) =>
                setLinks((l) => ({ ...l, repo: e.target.value || undefined }))
              }
              className="input pl-9 text-xs py-2 flex-1"
            />
          </div>
          <div className="relative flex items-center gap-2">
            <Globe size={14} className="shrink-0 absolute left-3 text-text-muted" />
            <input
              type="url"
              placeholder={`${typeDef.links.deploy} URL`}
              value={links.deploy ?? ""}
              onChange={(e) =>
                setLinks((l) => ({ ...l, deploy: e.target.value || undefined }))
              }
              className="input pl-9 text-xs py-2 flex-1"
            />
          </div>
          <div className="relative flex items-center gap-2">
            <BookOpen size={14} className="shrink-0 absolute left-3 text-text-muted" />
            <input
              type="url"
              placeholder={`${typeDef.links.docs} URL`}
              value={links.docs ?? ""}
              onChange={(e) =>
                setLinks((l) => ({ ...l, docs: e.target.value || undefined }))
              }
              className="input pl-9 text-xs py-2 flex-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
          <Link2 size={15} className="text-accent" />
          Links
        </h3>
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          {hasLinks ? "Edit" : "Add links"}
        </button>
      </div>
      {hasLinks ? (
        <div className="flex flex-wrap gap-2.5">
          {links.repo && (
            <a
              href={links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
            >
              <Github size={13} /> {typeDef.links.repo}
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
          {links.deploy && (
            <a
              href={links.deploy}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
            >
              <Globe size={13} /> {typeDef.links.deploy}
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
          {links.docs && (
            <a
              href={links.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text hover:bg-surface-2/80"
            >
              <BookOpen size={13} /> {typeDef.links.docs}
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted leading-relaxed">
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
    <div className="card p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
          <Package size={15} className="text-accent" />
          Add-ons &amp; Services
          {addons.length > 0 && (
            <span className="ml-1.5 font-normal text-text-muted text-xs">
              ({addons.length})
            </span>
          )}
        </h3>
        <button
          onClick={() => setAdding(!adding)}
          className="btn-primary px-3 py-1.5 text-xs font-semibold"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2.5 rounded-lg border border-dashed border-border/50 bg-surface-2/40 p-4">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Service name (e.g. Supabase)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input text-xs py-2"
              autoFocus
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AddonCategory)}
              className="input text-xs py-2"
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
              className="input text-xs py-2"
            />
            <input
              type="url"
              placeholder="Dashboard URL (optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input text-xs py-2"
            />
          </div>
          <input
            type="text"
            placeholder="Notes (e.g. max 3 projects on free tier)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input text-xs py-2"
          />
          <div className="flex justify-end gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="btn-secondary px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-3 py-1.5 text-xs font-semibold">
              Save
            </button>
          </div>
        </form>
      )}

      {addons.length === 0 && !adding ? (
        <p className="text-xs text-text-muted leading-relaxed">
          Track services used here — hosting, databases, auth, etc.
        </p>
      ) : (
        <div className="space-y-2">
          {addons.map((addon) => {
            const cat = ADDON_CATEGORIES.find((c) => c.key === addon.category);
            return (
              <div
                key={addon.id}
                className={`group flex items-start gap-3 rounded-lg border p-3 transition-all ${
                  addon.visible ? "border-border/50 bg-surface-2/30" : "border-dashed border-border/50 opacity-55"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text">{addon.name}</span>
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
                  {addon.url && (
                    <a
                      href={addon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      Open dashboard <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    onClick={() => handleToggle(addon.id)}
                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                    title={addon.visible ? "Hide when sharing" : "Show when sharing"}
                  >
                    {addon.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id)}
                    className="rounded-md p-1.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500"
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
    <div className="card p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
          <Shield size={15} className="text-accent" />
          Sharing visibility
        </h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          {open ? "Close" : "Change"}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded-lg border border-border bg-surface-2/60 px-3 py-1 text-xs font-medium text-text-secondary">
          {current?.label}
        </span>
        <span className="text-xs text-text-muted">{current?.description}</span>
      </div>

      {open && (
        <div className="space-y-1 rounded-lg border border-dashed border-border/50 bg-surface-2/40 p-2.5">
          {VISIBILITY_LEVELS.map((level) => {
            const active = level.key === idea.visibility;
            return (
              <button
                key={level.key}
                onClick={() => handleChange(level.key)}
                className={`w-full rounded-lg px-3.5 py-2.5 text-left transition-all ${
                  active
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-text-secondary hover:bg-surface-2/50 hover:text-text"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{level.label}</span>
                  {active && <Check size={13} />}
                </div>
                <p className="mt-0.5 text-[11px] opacity-65">{level.description}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
