"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Github, Globe, BookOpen } from "lucide-react";
import { createIdea } from "@/lib/actions";
import { STAGES, VISIBILITY_LEVELS, IDEA_TYPES } from "@/lib/schema";
import type { VisibilityLevel, IdeaType } from "@/lib/schema";
import Link from "next/link";

export default function NewIdeaPage() {
  const router = useRouter();
  const [ideaType, setIdeaType] = useState<IdeaType>("app");
  const [linkRepo, setLinkRepo] = useState("");
  const [linkDeploy, setLinkDeploy] = useState("");
  const [linkDocs, setLinkDocs] = useState("");
  const [visibility, setVisibility] = useState<VisibilityLevel>("private");

  const typeDef = IDEA_TYPES.find((t) => t.key === ideaType)!;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("idea_type", ideaType);
    fd.set("link_repo", linkRepo);
    fd.set("link_deploy", linkDeploy);
    fd.set("link_docs", linkDocs);
    fd.set("visibility", visibility);
    const id = await createIdea(fd);
    router.push(`/ideas/${id}`);
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text"
      >
        <ArrowLeft size={14} />
        All ideas
      </Link>

      <div className="mb-6 space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
          New idea
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text">
          Capture the spark
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-lg space-y-5 p-5 sm:p-6">
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-xs font-medium text-text-secondary"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="input"
            placeholder="What's the idea?"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="one_liner"
            className="mb-1.5 block text-xs font-medium text-text-secondary"
          >
            One-liner
          </label>
          <textarea
            id="one_liner"
            name="one_liner"
            rows={2}
            className="input resize-none"
            placeholder="Briefly describe the idea..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    ideaType === t.key
                      ? "bg-accent text-white shadow-card"
                      : "border border-border bg-surface text-text-secondary hover:border-border-strong"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="stage"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Stage
            </label>
            <select
              id="stage"
              name="stage"
              defaultValue="inbox"
              className="input"
            >
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="conviction"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Conviction (1-10)
            </label>
            <input
              id="conviction"
              name="conviction"
              type="number"
              min={1}
              max={10}
              defaultValue={5}
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="input"
              placeholder="e.g. saas, b2b, ai"
            />
          </div>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="text-xs font-medium text-text-secondary">
            Links
          </legend>
          <div className="flex items-center gap-2">
            <Github size={14} className="shrink-0 text-text-muted" />
            <input
              type="url"
              value={linkRepo}
              onChange={(e) => setLinkRepo(e.target.value)}
              placeholder={`${typeDef.links.repo} URL`}
              className="input flex-1 py-2 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="shrink-0 text-text-muted" />
            <input
              type="url"
              value={linkDeploy}
              onChange={(e) => setLinkDeploy(e.target.value)}
              placeholder={`${typeDef.links.deploy} URL`}
              className="input flex-1 py-2 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="shrink-0 text-text-muted" />
            <input
              type="url"
              value={linkDocs}
              onChange={(e) => setLinkDocs(e.target.value)}
              placeholder={`${typeDef.links.docs} URL`}
              className="input flex-1 py-2 text-xs"
            />
          </div>
        </fieldset>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Sharing visibility
          </label>
          <div className="space-y-1">
            {VISIBILITY_LEVELS.map((level) => (
              <label
                key={level.key}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  visibility === level.key
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border text-text-secondary hover:border-border-strong"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={level.key}
                  checked={visibility === level.key}
                  onChange={() => setVisibility(level.key)}
                  className="sr-only"
                />
                <span className="text-xs font-medium">{level.label}</span>
                <span className="text-[10px] opacity-60">{level.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary">
            Create idea
          </button>
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
