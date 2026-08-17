#!/usr/bin/env node
/**
 * pb-add-feature-fields.mjs — add the new `ideas` fields to an EXISTING
 * PocketBase instance WITHOUT wiping data.
 *
 * Adds to the `ideas` collection:
 *   - share_links (json)          per-link share toggles
 *   - mobile (bool)               mobile-friendly badge
 *   - paper (file, pdf, 20MB)     uploaded paper draft
 *
 * Reads PB_URL / PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD from the environment
 * (e.g. sourced from .env.migrate). Idempotent: only adds missing fields
 * and preserves the collection's existing rules.
 *
 * Usage:
 *   set -a; . ./.env.migrate; set +a
 *   node pb-add-feature-fields.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocalPath = path.join(__dirname, "..", ".env.local");

// Parse a simple KEY=VALUE env file into an object.
function parseEnvFile(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

// Merge .env.local so the admin creds work even if only defined there.
try {
  const local = parseEnvFile(await readFile(envLocalPath, "utf8"));
  for (const [k, v] of Object.entries(local)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
} catch {
  // no .env.local — rely on the environment
}

const PB_URL = (
  process.env.PB_URL ||
  process.env.NEXT_PUBLIC_PB_URL ||
  "https://prodlogonline.atensai.com"
).replace(/\/$/, "");
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD");
  process.exit(1);
}

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
    throw new Error(`${method} ${pathname} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function superuserAuth() {
  const body = { identity: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  try {
    return (await api("/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body,
    })).token;
  } catch {
    return (await api("/api/admins/auth-with-password", { method: "POST", body })).token;
  }
}

const NEW_FIELDS = [
  { name: "share_links", type: "json" },
  { name: "mobile", type: "bool" },
  {
    name: "paper",
    type: "file",
    maxSelect: 1,
    maxSize: 20971520,
    mimeTypes: ["application/pdf"],
  },
];

async function patchCollection(name) {
  const token = await superuserAuth();
  const col = await api(`/api/collections/${name}`, { token });
  const existing = new Set((col.fields || []).map((f) => f.name));
  const toAdd = NEW_FIELDS.filter((f) => !existing.has(f.name));

  if (toAdd.length === 0) {
    console.log(`  = "${name}": all new fields already present, nothing to do`);
    return;
  }

  const fields = [...(col.fields || []), ...toAdd];
  await api(`/api/collections/${col.id}`, {
    method: "PATCH",
    body: {
      fields,
      listRule: col.listRule ?? null,
      viewRule: col.viewRule ?? null,
      createRule: col.createRule ?? null,
      updateRule: col.updateRule ?? null,
      deleteRule: col.deleteRule ?? null,
    },
    token,
  });
  console.log(`  + "${name}" added: ${toAdd.map((f) => f.name).join(", ")}`);
}

console.log(`Connecting to ${PB_URL} ...`);
await patchCollection("ideas");
console.log("Done.");
