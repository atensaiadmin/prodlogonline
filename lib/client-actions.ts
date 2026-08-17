"use client";

/**
 * Client-side data writes.
 *
 * Cloudflare Pages' edge runtime does NOT reliably handle Next.js server
 * actions (they come back as 404 / "An unexpected response was received from
 * the server"), while reads (server components) work fine. So all writes that
 * happen from the browser go straight to the PocketBase API via the JS SDK —
 * the same path the login flow already uses. This keeps every save working on
 * the deployed site with zero edge-runtime involvement.
 *
 * Each function mirrors the server action of the same name so the UI call
 * sites don't change. Auth comes from the `pb_auth` cookie via the client
 * auth store; PocketBase collection rules still enforce authorization.
 */
import { createClientPB } from "./pocketbase-client";
import { DEFAULT_SHARE_LINKS } from "./schema";
import type {
  Idea,
  Entry,
  Stage,
  Mood,
  IdeaType,
  Links,
  VisibilityLevel,
  Addon,
  AddonCategory,
  Bug,
  BugStatus,
  BugSeverity,
  ShareProfile,
  ProfileLayer,
  ShareLinkKey,
} from "./schema";

function authed() {
  const pb = createClientPB();
  if (!pb.authStore.isValid) {
    pb.authStore.loadFromCookie(document.cookie, "pb_auth");
  }
  if (!pb.authStore.isValid) {
    throw new Error("Your session has expired — please sign in again.");
  }
  return pb;
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ---- Ideas ----

export async function createIdea(formData: FormData): Promise<string> {
  const pb = authed();
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title is required");
  const now = new Date().toISOString();
  const record = await pb.collection("ideas").create({
    title,
    one_liner: (formData.get("one_liner") as string)?.trim() ?? "",
    stage: (formData.get("stage") as Stage) || "inbox",
    idea_type: (formData.get("idea_type") as IdeaType) || "app",
    conviction: Math.min(
      10,
      Math.max(1, parseInt(formData.get("conviction") as string) || 5)
    ),
    tags: parseTags(formData.get("tags") as string),
    links: {
      repo: (formData.get("link_repo") as string)?.trim() || undefined,
      deploy: (formData.get("link_deploy") as string)?.trim() || undefined,
      preview: (formData.get("link_preview") as string)?.trim() || undefined,
      docs: (formData.get("link_docs") as string)?.trim() || undefined,
    },
    share_links: { ...DEFAULT_SHARE_LINKS },
    mobile: formData.get("mobile") === "on",
    paper: "",
    visibility: (formData.get("visibility") as VisibilityLevel) || "private",
    created_at: now,
    updated_at: now,
  });
  return record.id;
}

export async function editIdea(formData: FormData): Promise<void> {
  const pb = authed();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title is required");

  const updates: Record<string, unknown> = { title };

  const oneLiner = formData.get("one_liner");
  if (oneLiner !== null) updates.one_liner = (oneLiner as string).trim();

  const ideaType = formData.get("idea_type");
  if (ideaType) updates.idea_type = ideaType as string;

  const conviction = parseInt(formData.get("conviction") as string);
  if (!Number.isNaN(conviction)) {
    updates.conviction = Math.min(10, Math.max(1, conviction));
  }

  const tags = formData.get("tags");
  if (tags !== null) updates.tags = parseTags(tags as string);

  const linkRepo = formData.get("link_repo");
  const linkDeploy = formData.get("link_deploy");
  const linkPreview = formData.get("link_preview");
  const linkDocs = formData.get("link_docs");
  if (linkRepo !== null || linkDeploy !== null || linkPreview !== null || linkDocs !== null) {
    updates.links = {
      repo: (linkRepo as string)?.trim() || undefined,
      deploy: (linkDeploy as string)?.trim() || undefined,
      preview: (linkPreview as string)?.trim() || undefined,
      docs: (linkDocs as string)?.trim() || undefined,
    };
  }

  updates.mobile = formData.get("mobile") === "on";

  const shareKeys: ShareLinkKey[] = ["repo", "deploy", "preview", "docs"];
  const hasShareToggles = shareKeys.some((k) => formData.get(`share_${k}`) !== null);
  if (hasShareToggles) {
    const share_links: Record<ShareLinkKey, boolean> = { ...DEFAULT_SHARE_LINKS };
    for (const k of shareKeys) share_links[k] = formData.get(`share_${k}`) === "on";
    updates.share_links = share_links;
  }

  const visibility = formData.get("visibility");
  if (visibility) updates.visibility = visibility as string;

  await pb.collection("ideas").update(id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export async function updateStage(ideaId: string, stage: Stage) {
  const pb = authed();
  await pb.collection("ideas").update(ideaId, {
    stage,
    updated_at: new Date().toISOString(),
  });
}

export async function updateConviction(ideaId: string, conviction: number) {
  const pb = authed();
  await pb.collection("ideas").update(ideaId, {
    conviction: Math.min(10, Math.max(1, conviction)),
    updated_at: new Date().toISOString(),
  });
}

export async function updateLinksAndShare(
  ideaId: string,
  links: Links,
  share_links: Record<ShareLinkKey, boolean>
) {
  const pb = authed();
  await pb.collection("ideas").update(ideaId, {
    links,
    share_links,
    updated_at: new Date().toISOString(),
  });
}

export async function updateVisibility(ideaId: string, visibility: VisibilityLevel) {
  const pb = authed();
  await pb.collection("ideas").update(ideaId, {
    visibility,
    updated_at: new Date().toISOString(),
  });
}

export async function uploadPaper(ideaId: string, formData: FormData): Promise<void> {
  const pb = authed();
  const file = formData.get("paper");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a PDF file to upload.");
  }
  await pb.collection("ideas").update(ideaId, { paper: file });
}

export async function removePaper(ideaId: string): Promise<void> {
  const pb = authed();
  await pb.collection("ideas").update(ideaId, { paper: null });
}

export async function deleteIdea(id: string) {
  const pb = authed();
  await pb.collection("ideas").delete(id);
}

// ---- Entries ----

export async function addEntry(formData: FormData): Promise<string> {
  const pb = authed();
  const ideaId = formData.get("idea_id") as string;
  const body = (formData.get("body") as string)?.trim() ?? "";
  const mood = (formData.get("mood") as Mood) || null;
  const actionTaken = (formData.get("action_taken") as string)?.trim() ?? "";
  if (!body && !actionTaken) throw new Error("Entry must have body or action");

  const record = await pb.collection("entries").create({
    idea_id: ideaId,
    body,
    mood,
    action_taken: actionTaken,
    created_at: new Date().toISOString(),
  });
  return record.id;
}

export async function editEntry(formData: FormData): Promise<void> {
  const pb = authed();
  const id = formData.get("id") as string;
  const body = (formData.get("body") as string)?.trim() ?? "";
  const mood = (formData.get("mood") as Mood) || null;
  const actionTaken = (formData.get("action_taken") as string)?.trim() ?? "";
  if (!body && !actionTaken) throw new Error("Entry must have body or action");

  await pb.collection("entries").update(id, { body, mood, action_taken: actionTaken });
}

export async function deleteEntry(id: string) {
  const pb = authed();
  await pb.collection("entries").delete(id);
}

// ---- Addons ----

export async function createAddon(formData: FormData): Promise<string> {
  const pb = authed();
  const ideaId = formData.get("idea_id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Addon name is required");

  const record = await pb.collection("addons").create({
    idea_id: ideaId,
    name,
    category: (formData.get("category") as AddonCategory) || "other",
    account_label: (formData.get("account_label") as string)?.trim() ?? "",
    url: (formData.get("url") as string)?.trim() ?? "",
    notes: (formData.get("notes") as string)?.trim() ?? "",
    visible: true,
    created_at: new Date().toISOString(),
  });
  return record.id;
}

export async function toggleAddonVisibility(id: string) {
  const pb = authed();
  const existing = await pb.collection("addons").getOne(id);
  await pb.collection("addons").update(id, { visible: !existing.visible });
}

export async function deleteAddon(id: string) {
  const pb = authed();
  await pb.collection("addons").delete(id);
}

// ---- Bugs ----

export async function addBug(formData: FormData): Promise<string> {
  const pb = authed();
  const ideaId = formData.get("idea_id") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Bug title is required");

  const record = await pb.collection("bugs").create({
    idea_id: ideaId,
    title,
    status: (formData.get("status") as BugStatus) || "open",
    severity: (formData.get("severity") as BugSeverity) || "medium",
    created_at: new Date().toISOString(),
  });
  return record.id;
}

export async function editBug(formData: FormData): Promise<void> {
  const pb = authed();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Bug title is required");

  await pb.collection("bugs").update(id, {
    title,
    status: (formData.get("status") as BugStatus) || "open",
    severity: (formData.get("severity") as BugSeverity) || "medium",
  });
}

export async function updateBugStatus(id: string, status: BugStatus) {
  const pb = authed();
  await pb.collection("bugs").update(id, { status });
}

export async function deleteBug(id: string) {
  const pb = authed();
  await pb.collection("bugs").delete(id);
}

// ---- Share profiles ----

export async function createShareProfile(name: string): Promise<ShareProfile> {
  const pb = authed();
  const base = slugify(name) || "share";
  let slug = base;
  let i = 1;
  for (;;) {
    const existing = await pb
      .collection("share_profiles")
      .getList(1, 1, { filter: `slug="${slug}"` });
    if (existing.totalItems === 0) break;
    slug = `${base}-${i++}`;
  }
  const record = await pb.collection("share_profiles").create({
    name: name.trim(),
    slug,
    description: "",
    layer: "pitch",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description ?? "",
    layer: record.layer ?? "pitch",
    created_at: record.created_at ?? record.created,
    updated_at: record.updated_at ?? record.updated,
  };
}

export async function setProfileIdeas(profileId: string, ideaIds: string[]) {
  const pb = authed();
  const existing = await pb
    .collection("share_profile_ideas")
    .getList(1, 500, { filter: `profile_id="${profileId}"` });
  for (const row of existing.items) {
    await pb.collection("share_profile_ideas").delete(row.id);
  }
  for (const idea_id of ideaIds) {
    await pb.collection("share_profile_ideas").create({ profile_id: profileId, idea_id });
  }
  await pb.collection("share_profiles").update(profileId, {
    updated_at: new Date().toISOString(),
  });
}

export async function updateShareProfile(
  id: string,
  updates: Partial<Omit<ShareProfile, "id" | "created_at">>
) {
  const pb = authed();
  await pb.collection("share_profiles").update(id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export async function renameShareProfile(id: string, name: string) {
  await updateShareProfile(id, { name });
}

export async function updateShareProfileDescription(id: string, description: string) {
  await updateShareProfile(id, { description });
}

export async function updateShareProfileLayer(id: string, layer: ProfileLayer) {
  await updateShareProfile(id, { layer });
}

export async function deleteShareProfile(id: string) {
  const pb = authed();
  await pb.collection("share_profiles").delete(id);
}
