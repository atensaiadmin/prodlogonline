import { createServerSupabase } from "./supabase-server";
import type { Idea, Entry, Addon, ShareProfile, ShareProfileIdea } from "./schema";

// ---- Ideas ----

export async function getIdeas(): Promise<Idea[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(migrateIdea);
}

export async function getIdea(id: string): Promise<Idea | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? migrateIdea(data) : null;
}

export async function insertIdea(idea: Idea) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("ideas").insert({
    id: idea.id,
    title: idea.title,
    one_liner: idea.one_liner,
    stage: idea.stage,
    idea_type: idea.idea_type,
    conviction: idea.conviction,
    tags: idea.tags,
    links: idea.links,
    visibility: idea.visibility,
    created_at: idea.created_at,
    updated_at: idea.updated_at,
  });
  if (error) throw new Error(error.message);
}

export async function updateIdea(
  id: string,
  updates: Partial<Omit<Idea, "id" | "created_at">>
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("ideas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteIdea(id: string) {
  // entries, addons, share_profile_ideas cascade on delete
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Entries ----

export async function getEntries(ideaId: string): Promise<Entry[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function insertEntry(entry: Entry) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("entries").insert({
    id: entry.id,
    idea_id: entry.idea_id,
    body: entry.body,
    mood: entry.mood,
    action_taken: entry.action_taken,
    created_at: entry.created_at,
  });
  if (error) throw new Error(error.message);
}

// ---- Addons ----

export async function getAddons(ideaId?: string): Promise<Addon[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("addons")
    .select("*")
    .order("created_at", { ascending: false });
  if (ideaId) query = query.eq("idea_id", ideaId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAddon(id: string): Promise<Addon | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function insertAddon(addon: Addon) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("addons").insert({
    id: addon.id,
    idea_id: addon.idea_id,
    name: addon.name,
    category: addon.category,
    account_label: addon.account_label,
    url: addon.url,
    notes: addon.notes,
    visible: addon.visible,
    created_at: addon.created_at,
  });
  if (error) throw new Error(error.message);
}

export async function updateAddon(
  id: string,
  updates: Partial<Omit<Addon, "id" | "idea_id" | "created_at">>
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("addons").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAddon(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("addons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Share profiles ----

export async function getShareProfiles(): Promise<ShareProfile[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("share_profiles")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getShareProfileBySlug(slug: string): Promise<ShareProfile | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("share_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getShareProfileIdeas(profileId: string): Promise<ShareProfileIdea[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("share_profile_ideas")
    .select("profile_id, idea_id")
    .eq("profile_id", profileId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function insertShareProfile(name: string): Promise<ShareProfile> {
  const supabase = await createServerSupabase();
  const base = slugify(name) || "share";
  // ensure unique slug
  let slug = base;
  let i = 1;
  for (;;) {
    const { data } = await supabase
      .from("share_profiles")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    slug = `${base}-${i++}`;
  }
  const now = new Date().toISOString();
  const profile: ShareProfile = { id: crypto.randomUUID(), name: name.trim(), slug, created_at: now, updated_at: now };
  const { error } = await supabase.from("share_profiles").insert(profile);
  if (error) throw new Error(error.message);
  return profile;
}

export async function updateShareProfile(
  id: string,
  updates: Partial<Omit<ShareProfile, "id" | "created_at">>
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("share_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteShareProfile(id: string) {
  // share_profile_ideas cascade
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("share_profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setProfileIdeas(profileId: string, ideaIds: string[]) {
  const supabase = await createServerSupabase();
  // delete existing then insert new mappings
  const { error: delErr } = await supabase
    .from("share_profile_ideas")
    .delete()
    .eq("profile_id", profileId);
  if (delErr) throw new Error(delErr.message);

  if (ideaIds.length > 0) {
    const rows = ideaIds.map((idea_id) => ({ profile_id: profileId, idea_id }));
    const { error: insErr } = await supabase
      .from("share_profile_ideas")
      .insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  await updateShareProfile(profileId, {});
}

function migrateIdea(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    title: row.title as string,
    one_liner: row.one_liner as string,
    stage: row.stage as Idea["stage"],
    idea_type: row.idea_type as Idea["idea_type"],
    conviction: row.conviction as number,
    tags: (row.tags as string[]) ?? [],
    links: (row.links as Idea["links"]) ?? {},
    visibility: row.visibility as Idea["visibility"],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
