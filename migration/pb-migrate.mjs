#!/usr/bin/env node
/**
 * pb-migrate.mjs — migrate prodlogonline from Supabase to PocketBase.
 *
 * Reads the exported Supabase data from ./data/*.json and:
 *   1. Creates the PocketBase collections (ideas, entries, addons, bugs,
 *      share_profiles, share_profile_ideas)
 *   2. Imports every record, remapping Supabase UUID ids -> PocketBase ids
 *      and re-pointing all relations (idea_id / profile_id).
 *
 * No external dependencies — uses Node's built-in fetch.
 *
 * Usage:
 *   PB_URL=http://127.0.0.1:8099 \
 *   PB_ADMIN_EMAIL=test@test.com \
 *   PB_ADMIN_PASSWORD=testpass123 \
 *   node pb-migrate.mjs
 *
 * Env:
 *   PB_URL             PocketBase base URL (default http://127.0.0.1:8099)
 *   PB_ADMIN_EMAIL     PocketBase superuser email (required)
 *   PB_ADMIN_PASSWORD  PocketBase superuser password (required)
 *   FORCE=1            delete + recreate any existing collections first
 */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

const PB_URL = (process.env.PB_URL || "http://127.0.0.1:8099").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;
const FORCE = process.env.FORCE === "1";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD env vars");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function api(pathname, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = token;
  const res = await fetch(`${PB_URL}${pathname}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${pathname} -> ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

/** Deterministic PocketBase id (15 chars, [a-z0-9]) from a Supabase UUID. */
function pbId(uuid) {
  return createHash("md5").update(String(uuid)).digest("hex").slice(0, 15);
}

async function loadData(name) {
  const raw = await readFile(path.join(dataDir, `${name}.json`), "utf8");
  const parsed = JSON.parse(raw);
  // Supabase returns a non-array error payload when a table doesn't exist
  // (e.g. "bugs" was never created). Treat that as an empty dataset.
  return Array.isArray(parsed) ? parsed : [];
}

// PocketBase REQUIRES the autodate system fields on every collection — without
// them records get null created/updated and sorting fails. We must include them
// explicitly when creating a collection via the API.
const AUTODATE_FIELDS = [
  { name: "created", type: "autodate", onCreate: true, onUpdate: false },
  { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
];

// Custom date fields that carry the ORIGINAL Supabase timestamps. PocketBase
// ignores explicit created/updated (it always overwrites them), so we keep the
// real dates in dedicated fields instead.
const dateField = (name) => ({ name, type: "date" });

function normDate(iso) {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// ---------------------------------------------------------------------------
// Step 0 — authenticate as superuser
// ---------------------------------------------------------------------------

console.log(`Connecting to ${PB_URL} ...`);

// Auth as superuser. Modern PocketBase (v0.23+) uses the "_superusers"
// collection; older versions expose /api/admins. Try both.
async function superuserAuth() {
  const body = { identity: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  try {
    const res = await api("/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body,
    });
    return res.token;
  } catch {
    const res = await api("/api/admins/auth-with-password", {
      method: "POST",
      body,
    });
    return res.token;
  }
}

const token = await superuserAuth();
console.log(`Authenticated as superuser: ${ADMIN_EMAIL}`);

// ---------------------------------------------------------------------------
// Step 1 — collections
// ---------------------------------------------------------------------------

// Which of our collections already exist on this instance?
const existing = await api("/api/collections?perPage=200", { token });
const existingNames = new Set(existing.items.map((c) => c.name));

const wanted = [
  "ideas",
  "entries",
  "addons",
  "bugs",
  "share_profiles",
  "share_profile_ideas",
];

// FORCE mode: wipe our collections so the import is fully repeatable.
// Delete in reverse dependency order — PocketBase refuses to delete a
// collection that other collections still reference via relation fields.
if (FORCE) {
  const forceOrder = [...wanted].reverse();
  for (const name of forceOrder) {
    if (!existingNames.has(name)) continue;
    const c = existing.items.find((x) => x.name === name);
    await api(`/api/collections/${c.id}`, { method: "DELETE", token });
    console.log(`FORCE: deleted existing collection "${name}"`);
  }
}

async function createCollection(name, def) {
  const res = await api("/api/collections", {
    method: "POST",
    token,
    body: {
      name,
      type: def.type || "base",
      listRule: def.listRule ?? null,
      viewRule: def.viewRule ?? null,
      createRule: def.createRule ?? null,
      updateRule: def.updateRule ?? null,
      deleteRule: def.deleteRule ?? null,
      fields: def.fields,
    },
  });
  console.log(`  + collection "${name}" (id ${res.id})`);
  return res.id;
}

async function ensureCollection(name, def) {
  const c = existing.items.find((x) => x.name === name);
  if (c && !FORCE) {
    console.log(`  = collection "${name}" already exists (id ${c.id}), skipped`);
    return c.id;
  }
  return createCollection(name, def);
}

console.log("\n[1/5] Creating collections ...");

// ideas + share_profiles first (no relations to our own collections).
// NOTE: ideas/entries/addons get their final shared-read viewRule patched in
// after share_profile_ideas exists (PocketBase validates back-relation refs at
// collection-creation time, so the target collection must already exist).

const ideasId = await ensureCollection("ideas", {
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
  fields: [
    { name: "title", type: "text", required: true },
    { name: "one_liner", type: "text" },
    {
      name: "stage",
      type: "select",
      maxSelect: 1,
      values: ["inbox", "validating", "building", "launched", "dead"],
    },
    {
      name: "idea_type",
      type: "select",
      maxSelect: 1,
      values: ["app", "paper", "research", "writing", "other"],
    },
    { name: "conviction", type: "number", min: 1, max: 10, onlyInt: true },
    { name: "tags", type: "json" },
    { name: "links", type: "json" },
    { name: "share_links", type: "json" },
    { name: "mobile", type: "bool" },
    {
      name: "paper",
      type: "file",
      maxSelect: 1,
      maxSize: 20971520,
      mimeTypes: ["application/pdf"],
    },
    {
      name: "visibility",
      type: "select",
      maxSelect: 1,
      values: ["private", "links", "docs", "summary", "full"],
    },
    ...AUTODATE_FIELDS,
    dateField("created_at"),
    dateField("updated_at"),
  ],
});

const shareProfilesId = await ensureCollection("share_profiles", {
  listRule: "",
  viewRule: "",
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "text" },
    {
      name: "layer",
      type: "select",
      maxSelect: 1,
      values: ["pitch", "tech", "full"],
    },
    ...AUTODATE_FIELDS,
    dateField("created_at"),
    dateField("updated_at"),
  ],
});

// Child collections (relations to ideas).
const entriesId = await ensureCollection("entries", {
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
  fields: [
    {
      name: "idea_id",
      type: "relation",
      collectionId: ideasId,
      cascadeDelete: true,
      minSelect: 1,
      maxSelect: 1,
    },
    { name: "body", type: "text" },
    {
      name: "mood",
      type: "select",
      maxSelect: 1,
      values: ["excited", "hopeful", "neutral", "unsure", "frustrated"],
    },
    { name: "action_taken", type: "text" },
    ...AUTODATE_FIELDS,
    dateField("created_at"),
  ],
});

const addonsId = await ensureCollection("addons", {
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
  fields: [
    {
      name: "idea_id",
      type: "relation",
      collectionId: ideasId,
      cascadeDelete: true,
      minSelect: 1,
      maxSelect: 1,
    },
    { name: "name", type: "text", required: true },
    {
      name: "category",
      type: "select",
      maxSelect: 1,
      values: [
        "hosting",
        "database",
        "auth",
        "storage",
        "analytics",
        "email",
        "payments",
        "monitoring",
        "ci_cd",
        "domains",
        "ai",
        "other",
      ],
    },
    { name: "account_label", type: "text" },
    { name: "url", type: "text" },
    { name: "notes", type: "text" },
    { name: "visible", type: "bool" },
    ...AUTODATE_FIELDS,
    dateField("created_at"),
  ],
});

const bugsId = await ensureCollection("bugs", {
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
  fields: [
    {
      name: "idea_id",
      type: "relation",
      collectionId: ideasId,
      cascadeDelete: true,
      minSelect: 1,
      maxSelect: 1,
    },
    { name: "title", type: "text", required: true },
    {
      name: "status",
      type: "select",
      maxSelect: 1,
      values: ["open", "in_progress", "fixed", "wontfix"],
    },
    {
      name: "severity",
      type: "select",
      maxSelect: 1,
      values: ["low", "medium", "high", "critical"],
    },
    ...AUTODATE_FIELDS,
    dateField("created_at"),
  ],
});

const shareProfileIdeasId = await ensureCollection("share_profile_ideas", {
  listRule: "",
  viewRule: "",
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
  fields: [
    {
      name: "profile_id",
      type: "relation",
      collectionId: shareProfilesId,
      cascadeDelete: true,
      minSelect: 1,
      maxSelect: 1,
    },
    {
      name: "idea_id",
      type: "relation",
      collectionId: ideasId,
      cascadeDelete: true,
      minSelect: 1,
      maxSelect: 1,
    },
    ...AUTODATE_FIELDS,
  ],
});

// Now that share_profile_ideas exists, patch the shared-read rules that
// reference the back-relation so anonymous visitors of a public share page can
// read the idea (and its entries/addons) — mirroring the Supabase RLS.
// Both listRule AND viewRule need it: PocketBase enforces them separately,
// and the app reads entries/addons/profiles via list queries, not by id.
async function patchRules(collectionName, listRule, viewRule) {
  const col = (await api("/api/collections?filter=" + encodeURIComponent(`name="${collectionName}"`) + "&perPage=1", { token })).items[0];
  await api(`/api/collections/${col.id}`, {
    method: "PATCH",
    token,
    body: { listRule, viewRule },
  });
  console.log(`  ~ patched rules on "${collectionName}"`);
}

const sharedRead =
  '@request.auth.id != "" || (visibility != "private" && share_profile_ideas_via_idea_id.id != null)';
const sharedReadEntries =
  '@request.auth.id != "" || (idea_id.visibility != "private" && idea_id.share_profile_ideas_via_idea_id.id != null)';
const sharedReadAddons =
  '@request.auth.id != "" || (visible = true && idea_id.visibility != "private" && idea_id.share_profile_ideas_via_idea_id.id != null)';

await patchRules("ideas", sharedRead, sharedRead);
await patchRules("entries", sharedReadEntries, sharedReadEntries);
await patchRules("addons", sharedReadAddons, sharedReadAddons);

// ---------------------------------------------------------------------------
// Step 2 — import data
// ---------------------------------------------------------------------------

async function importRecords(collection, rows, transform) {
  let ok = 0;
  let skipped = 0;
  for (const row of rows) {
    const body = transform(row);
    try {
      await api(`/api/collections/${collection}/records`, {
        method: "POST",
        token,
        body,
      });
      ok++;
    } catch (err) {
      // Duplicate id on re-run -> skip quietly (import is idempotent per id).
      if (String(err.message).includes("invalid record id") || /already exists|unique/.test(String(err.message))) {
        skipped++;
      } else {
        throw err;
      }
    }
  }
  console.log(`  ${collection}: ${ok} imported, ${skipped} skipped (duplicates)`);
}

console.log("\n[2/5] Importing data ...");

const ideas = await loadData("ideas");
await importRecords("ideas", ideas, (r) => ({
  id: pbId(r.id),
  created_at: normDate(r.created_at),
  updated_at: normDate(r.updated_at),
  title: r.title,
  one_liner: r.one_liner ?? "",
  stage: r.stage ?? "inbox",
  idea_type: r.idea_type ?? "app",
  conviction: r.conviction ?? 5,
  tags: r.tags ?? [],
  links: r.links ?? {},
  visibility: r.visibility ?? "private",
}));

const entries = await loadData("entries");
await importRecords("entries", entries, (r) => ({
  id: pbId(r.id),
  created_at: normDate(r.created_at),
  idea_id: pbId(r.idea_id),
  body: r.body ?? "",
  mood: r.mood ?? null,
  action_taken: r.action_taken ?? "",
}));

const addons = await loadData("addons");
await importRecords("addons", addons, (r) => ({
  id: pbId(r.id),
  created_at: normDate(r.created_at),
  idea_id: pbId(r.idea_id),
  name: r.name,
  category: r.category ?? "other",
  account_label: r.account_label ?? "",
  url: r.url ?? "",
  notes: r.notes ?? "",
  visible: r.visible ?? true,
}));

const bugs = await loadData("bugs");
await importRecords("bugs", bugs, (r) => ({
  id: pbId(r.id),
  created_at: normDate(r.created_at),
  idea_id: pbId(r.idea_id),
  title: r.title,
  status: r.status ?? "open",
  severity: r.severity ?? "medium",
}));

const shareProfiles = await loadData("share_profiles");
await importRecords("share_profiles", shareProfiles, (r) => ({
  id: pbId(r.id),
  created_at: normDate(r.created_at),
  updated_at: normDate(r.updated_at),
  name: r.name,
  slug: r.slug,
  description: r.description ?? "",
  layer: r.layer ?? "pitch",
}));

const shareProfileIdeas = await loadData("share_profile_ideas");
await importRecords("share_profile_ideas", shareProfileIdeas, (r) => ({
  id: pbId(`${r.profile_id}-${r.idea_id}`),
  profile_id: pbId(r.profile_id),
  idea_id: pbId(r.idea_id),
}));

// ---------------------------------------------------------------------------
// Step 3 — summary
// ---------------------------------------------------------------------------

console.log("\n[3/5] Summary:");
for (const name of wanted) {
  const res = await api(`/api/collections/${name}/records?perPage=1`, { token });
  console.log(`  ${name}: ${res.totalItems} records`);
}

console.log("\nMigration complete. Verify in the PocketBase admin:");
console.log(`  ${PB_URL}/_/`);
