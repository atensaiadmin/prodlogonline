import { createServerPB } from "./pocketbase-server";
import type { RecordModel } from "pocketbase";
import type { Idea, Entry, Addon, Bug, ShareProfile, ShareProfileIdea } from "./schema";

// PocketBase record ids (15-char) are returned by the API; Supabase UUIDs are
// gone. Every read/write goes through the authenticated server client so the
// collection rules are enforced.

// ---- Ideas ----

export async function getIdeas(): Promise<Idea[]> {
  const pb = await createServerPB();
  const result = await pb.collection("ideas").getList(1, 200, {
    sort: "-updated_at",
  });
  return result.items.map(migrateIdea);
}

export async function getIdea(id: string): Promise<Idea | null> {
  const pb = await createServerPB();
  try {
    return migrateIdea(await pb.collection("ideas").getOne(id));
  } catch {
    return null;
  }
}

export async function insertIdea(idea: Idea): Promise<Idea> {
  const pb = await createServerPB();
  const record = await pb.collection("ideas").create({
    title: idea.title,
    one_liner: idea.one_liner,
    stage: idea.stage,
    idea_type: idea.idea_type,
    conviction: idea.conviction,
    tags: idea.tags,
    links: idea.links,
    visibility: idea.visibility,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return migrateIdea(record);
}

export async function updateIdea(
  id: string,
  updates: Partial<Omit<Idea, "id" | "created_at">>
) {
  const pb = await createServerPB();
  await pb.collection("ideas").update(id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteIdea(id: string) {
  // entries, addons, share_profile_ideas cascade on delete
  const pb = await createServerPB();
  await pb.collection("ideas").delete(id);
}

// ---- Entries ----

export async function getEntries(ideaId: string): Promise<Entry[]> {
  const pb = await createServerPB();
  const result = await pb.collection("entries").getList(1, 200, {
    filter: `idea_id="${ideaId}"`,
    sort: "-created_at",
  });
  return result.items.map(migrateEntry);
}

export async function insertEntry(entry: Entry): Promise<Entry> {
  const pb = await createServerPB();
  const record = await pb.collection("entries").create({
    idea_id: entry.idea_id,
    body: entry.body,
    mood: entry.mood,
    action_taken: entry.action_taken,
    created_at: new Date().toISOString(),
  });
  return migrateEntry(record);
}

export async function updateEntry(
  id: string,
  updates: Partial<Omit<Entry, "id" | "idea_id" | "created_at">>
) {
  const pb = await createServerPB();
  await pb.collection("entries").update(id, updates);
}

export async function deleteEntry(id: string) {
  const pb = await createServerPB();
  await pb.collection("entries").delete(id);
}

// ---- Addons ----

export async function getAddons(ideaId?: string): Promise<Addon[]> {
  const pb = await createServerPB();
  const result = await pb.collection("addons").getList(1, 200, {
    ...(ideaId ? { filter: `idea_id="${ideaId}"` } : {}),
    sort: "-created_at",
  });
  return result.items.map(migrateAddon);
}

export async function getAddon(id: string): Promise<Addon | null> {
  const pb = await createServerPB();
  try {
    return migrateAddon(await pb.collection("addons").getOne(id));
  } catch {
    return null;
  }
}

export async function insertAddon(addon: Addon): Promise<Addon> {
  const pb = await createServerPB();
  const record = await pb.collection("addons").create({
    idea_id: addon.idea_id,
    name: addon.name,
    category: addon.category,
    account_label: addon.account_label,
    url: addon.url,
    notes: addon.notes,
    visible: addon.visible,
    created_at: new Date().toISOString(),
  });
  return migrateAddon(record);
}

export async function updateAddon(
  id: string,
  updates: Partial<Omit<Addon, "id" | "idea_id" | "created_at">>
) {
  const pb = await createServerPB();
  await pb.collection("addons").update(id, updates);
}

export async function deleteAddon(id: string) {
  const pb = await createServerPB();
  await pb.collection("addons").delete(id);
}

// ---- Bugs ----

export async function getBugs(ideaId?: string): Promise<Bug[]> {
  const pb = await createServerPB();
  const result = await pb.collection("bugs").getList(1, 200, {
    ...(ideaId ? { filter: `idea_id="${ideaId}"` } : {}),
    sort: "-created_at",
  });
  return result.items.map(migrateBug);
}

export async function getBug(id: string): Promise<Bug | null> {
  const pb = await createServerPB();
  try {
    return migrateBug(await pb.collection("bugs").getOne(id));
  } catch {
    return null;
  }
}

export async function insertBug(bug: Bug): Promise<Bug> {
  const pb = await createServerPB();
  const record = await pb.collection("bugs").create({
    idea_id: bug.idea_id,
    title: bug.title,
    status: bug.status,
    severity: bug.severity,
    created_at: new Date().toISOString(),
  });
  return migrateBug(record);
}

export async function updateBug(
  id: string,
  updates: Partial<Omit<Bug, "id" | "idea_id" | "created_at">>
) {
  const pb = await createServerPB();
  await pb.collection("bugs").update(id, updates);
}

export async function deleteBug(id: string) {
  const pb = await createServerPB();
  await pb.collection("bugs").delete(id);
}

// ---- Share profiles ----

export async function getShareProfiles(): Promise<ShareProfile[]> {
  const pb = await createServerPB();
  const result = await pb.collection("share_profiles").getList(1, 200, {
    sort: "-updated_at",
  });
  return result.items.map(migrateShareProfile);
}

export async function getShareProfileBySlug(slug: string): Promise<ShareProfile | null> {
  const pb = await createServerPB();
  try {
    return migrateShareProfile(
      await pb.collection("share_profiles").getFirstListItem(`slug="${slug}"`)
    );
  } catch {
    return null;
  }
}

export async function getShareProfileIdeas(profileId: string): Promise<ShareProfileIdea[]> {
  const pb = await createServerPB();
  const result = await pb.collection("share_profile_ideas").getList(1, 500, {
    filter: `profile_id="${profileId}"`,
  });
  return result.items.map((r) => ({ profile_id: r.profile_id, idea_id: r.idea_id }));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function insertShareProfile(name: string): Promise<ShareProfile> {
  const pb = await createServerPB();
  const base = slugify(name) || "share";
  // ensure unique slug
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
  return migrateShareProfile(record);
}

export async function updateShareProfile(
  id: string,
  updates: Partial<Omit<ShareProfile, "id" | "created_at">>
) {
  const pb = await createServerPB();
  await pb.collection("share_profiles").update(id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteShareProfile(id: string) {
  // share_profile_ideas cascade
  const pb = await createServerPB();
  await pb.collection("share_profiles").delete(id);
}

export async function setProfileIdeas(profileId: string, ideaIds: string[]) {
  const pb = await createServerPB();
  // delete existing then insert new mappings
  const existing = await pb
    .collection("share_profile_ideas")
    .getList(1, 500, { filter: `profile_id="${profileId}"` });
  for (const row of existing.items) {
    await pb.collection("share_profile_ideas").delete(row.id);
  }
  for (const idea_id of ideaIds) {
    await pb.collection("share_profile_ideas").create({ profile_id: profileId, idea_id });
  }
  // bump the profile's updated timestamp
  await pb.collection("share_profiles").update(profileId, {});
}

// ---- mappers (Supabase shape -> PocketBase shape) ----

function migrateIdea(r: RecordModel): Idea {
  return {
    id: r.id,
    title: r.title,
    one_liner: r.one_liner ?? "",
    stage: r.stage as Idea["stage"],
    idea_type: r.idea_type as Idea["idea_type"],
    conviction: r.conviction,
    tags: r.tags ?? [],
    links: r.links ?? {},
    visibility: r.visibility as Idea["visibility"],
    created_at: r.created_at ?? r.created,
    updated_at: r.updated_at ?? r.updated,
  };
}

function migrateEntry(r: RecordModel): Entry {
  return {
    id: r.id,
    idea_id: r.idea_id,
    body: r.body ?? "",
    mood: r.mood ?? null,
    action_taken: r.action_taken ?? "",
    created_at: r.created_at ?? r.created,
  };
}

function migrateAddon(r: RecordModel): Addon {
  return {
    id: r.id,
    idea_id: r.idea_id,
    name: r.name,
    category: r.category ?? "other",
    account_label: r.account_label ?? "",
    url: r.url ?? "",
    notes: r.notes ?? "",
    visible: r.visible ?? true,
    created_at: r.created_at ?? r.created,
  };
}

function migrateBug(r: RecordModel): Bug {
  return {
    id: r.id,
    idea_id: r.idea_id,
    title: r.title,
    status: r.status ?? "open",
    severity: r.severity ?? "medium",
    created_at: r.created_at ?? r.created,
  };
}

function migrateShareProfile(r: RecordModel): ShareProfile {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    layer: r.layer ?? "pitch",
    created_at: r.created_at ?? r.created,
    updated_at: r.updated_at ?? r.updated,
  };
}
