"use server";

import { v4 as uuidv4 } from "uuid";
import * as store from "./store";
import type { Idea, Entry, Addon, Stage, Mood, AddonCategory, VisibilityLevel, Links, ShareProfile, SharedIdea, IdeaType, ProfileLayer } from "./schema";

export async function getIdeas(): Promise<Idea[]> {
  return store.getIdeas();
}

export async function getIdea(id: string): Promise<Idea | null> {
  return store.getIdea(id);
}

export async function getEntries(ideaId: string): Promise<Entry[]> {
  return store.getEntries(ideaId);
}

export async function getAddons(ideaId: string): Promise<Addon[]> {
  return store.getAddons(ideaId);
}

export async function createIdea(formData: FormData): Promise<string> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title is required");

  const now = new Date().toISOString();

  const idea: Idea = {
    id: uuidv4(),
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
      docs: (formData.get("link_docs") as string)?.trim() || undefined,
    },
    visibility: (formData.get("visibility") as VisibilityLevel) || "private",
    created_at: now,
    updated_at: now,
  };

  await store.insertIdea(idea);
  return idea.id;
}

export async function updateStage(ideaId: string, stage: Stage) {
  await store.updateIdea(ideaId, { stage });
}

export async function updateConviction(ideaId: string, conviction: number) {
  await store.updateIdea(ideaId, {
    conviction: Math.min(10, Math.max(1, conviction)),
  });
}

export async function updateLinks(ideaId: string, links: Links) {
  await store.updateIdea(ideaId, { links });
}

export async function updateVisibility(ideaId: string, visibility: VisibilityLevel) {
  await store.updateIdea(ideaId, { visibility });
}

export async function addEntry(formData: FormData): Promise<string> {
  const ideaId = formData.get("idea_id") as string;
  const body = (formData.get("body") as string)?.trim() ?? "";
  const mood = (formData.get("mood") as Mood) || null;
  const actionTaken = (formData.get("action_taken") as string)?.trim() ?? "";

  if (!body && !actionTaken) throw new Error("Entry must have body or action");

  const entry: Entry = {
    id: uuidv4(),
    idea_id: ideaId,
    body,
    mood,
    action_taken: actionTaken,
    created_at: new Date().toISOString(),
  };

  await store.insertEntry(entry);
  return entry.id;
}

export async function editEntry(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const body = (formData.get("body") as string)?.trim() ?? "";
  const mood = (formData.get("mood") as Mood) || null;
  const actionTaken = (formData.get("action_taken") as string)?.trim() ?? "";

  if (!body && !actionTaken) throw new Error("Entry must have body or action");

  await store.updateEntry(id, { body, mood, action_taken: actionTaken });
}

export async function deleteEntry(id: string) {
  await store.deleteEntry(id);
}

export async function editIdea(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title is required");

  // Partial update: only touch fields that are present in the form so
  // editing just the header never clobbers conviction/links/visibility.
  const updates: Partial<Omit<Idea, "id" | "created_at">> = { title };

  const oneLiner = formData.get("one_liner");
  if (oneLiner !== null) updates.one_liner = (oneLiner as string).trim();

  const ideaType = formData.get("idea_type");
  if (ideaType) updates.idea_type = ideaType as IdeaType;

  const conviction = parseInt(formData.get("conviction") as string);
  if (!Number.isNaN(conviction)) {
    updates.conviction = Math.min(10, Math.max(1, conviction));
  }

  const tags = formData.get("tags");
  if (tags !== null) updates.tags = parseTags(tags as string);

  const linkRepo = formData.get("link_repo");
  const linkDeploy = formData.get("link_deploy");
  const linkDocs = formData.get("link_docs");
  if (linkRepo !== null || linkDeploy !== null || linkDocs !== null) {
    updates.links = {
      repo: (linkRepo as string)?.trim() || undefined,
      deploy: (linkDeploy as string)?.trim() || undefined,
      docs: (linkDocs as string)?.trim() || undefined,
    };
  }

  const visibility = formData.get("visibility");
  if (visibility) updates.visibility = visibility as VisibilityLevel;

  await store.updateIdea(id, updates);
}

export async function deleteIdea(id: string) {
  await store.deleteIdea(id);
}

export async function createAddon(formData: FormData): Promise<string> {
  const ideaId = formData.get("idea_id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Addon name is required");

  const addon: Addon = {
    id: uuidv4(),
    idea_id: ideaId,
    name,
    category: (formData.get("category") as AddonCategory) || "other",
    account_label: (formData.get("account_label") as string)?.trim() ?? "",
    url: (formData.get("url") as string)?.trim() ?? "",
    notes: (formData.get("notes") as string)?.trim() ?? "",
    visible: true,
    created_at: new Date().toISOString(),
  };

  await store.insertAddon(addon);
  return addon.id;
}

export async function updateAddon(
  id: string,
  updates: Partial<Omit<Addon, "id" | "idea_id" | "created_at">>
) {
  await store.updateAddon(id, updates);
}

export async function toggleAddonVisibility(id: string) {
  const existing = await store.getAddon(id);
  if (!existing) return;
  await store.updateAddon(id, { visible: !existing.visible });
}

export async function deleteAddon(id: string) {
  await store.deleteAddon(id);
}

export async function getShareProfiles(): Promise<ShareProfile[]> {
  return store.getShareProfiles();
}

export async function getShareProfileBySlug(slug: string): Promise<ShareProfile | null> {
  return store.getShareProfileBySlug(slug);
}

export async function createShareProfile(name: string): Promise<ShareProfile> {
  return store.insertShareProfile(name);
}

export async function setProfileIdeas(profileId: string, ideaIds: string[]) {
  await store.setProfileIdeas(profileId, ideaIds);
}

export async function getProfileIdeaIds(profileId: string): Promise<string[]> {
  const rows = await store.getShareProfileIdeas(profileId);
  return rows.map((spi) => spi.idea_id);
}

export async function getAllProfileIdeaIds(): Promise<Record<string, string[]>> {
  const map: Record<string, string[]> = {};
  const profiles = await store.getShareProfiles();
  for (const p of profiles) {
    const rows = await store.getShareProfileIdeas(p.id);
    map[p.id] = rows.map((spi) => spi.idea_id);
  }
  return map;
}

export async function renameShareProfile(id: string, name: string) {
  await store.updateShareProfile(id, { name });
}

export async function updateShareProfileDescription(id: string, description: string) {
  await store.updateShareProfile(id, { description });
}

export async function updateShareProfileLayer(id: string, layer: ProfileLayer) {
  await store.updateShareProfile(id, { layer });
}

export async function deleteShareProfile(id: string) {
  await store.deleteShareProfile(id);
}

export async function getSharedProfileData(slug: string): Promise<{
  profile: ShareProfile;
  ideas: SharedIdea[];
} | null> {
  const profile = await store.getShareProfileBySlug(slug);
  if (!profile) return null;

  const profileIdeas = await store.getShareProfileIdeas(profile.id);
  const sharedIdeas: SharedIdea[] = [];

  for (const spi of profileIdeas) {
    const idea = await store.getIdea(spi.idea_id);
    if (!idea || idea.visibility === "private") continue;

    const addons = await store.getAddons(spi.idea_id);
    const entries = await store.getEntries(spi.idea_id);

    sharedIdeas.push({ idea, addons, entries });
  }

  return { profile, ideas: sharedIdeas };
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
