#!/usr/bin/env node
/**
 * pb-set-oauth.mjs — enable Google OAuth2 on the PocketBase `users` collection.
 *
 * Reads the PocketBase superuser credentials from the environment
 * (PB_URL / PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD — e.g. sourced from .env.migrate)
 * and the Google client id/secret from ../.env.local.
 *
 * It never prints the client secret.
 *
 * Usage:
 *   set -a; . ./.env.migrate; set +a
 *   node pb-set-oauth.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocalPath = path.join(__dirname, "..", ".env.local");

const PB_URL = (process.env.PB_URL || "https://prodlogonline.atensai.com").replace(/\/$/, "");
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
    const res = await api("/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body,
    });
    return res.token;
  } catch {
    const res = await api("/api/admins/auth-with-password", { method: "POST", body });
    return res.token;
  }
}

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

// Look for the Google credentials across the common key names.
function findGoogleCreds(env) {
  const id =
    env.client_id ||
    env.GOOGLE_CLIENT_ID ||
    env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    env.GOOGLE_OAUTH_CLIENT_ID;
  const secret =
    env.clien_secret ||
    env.client_secret ||
    env.GOOGLE_CLIENT_SECRET ||
    env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ||
    env.GOOGLE_OAUTH_CLIENT_SECRET;
  return { id, secret };
}

// ---------------------------------------------------------------------------

console.log(`Reading Google credentials from ${envLocalPath} ...`);
const envLocal = parseEnvFile(await readFile(envLocalPath, "utf8"));
const { id: clientId, secret: clientSecret } = findGoogleCreds(envLocal);

if (!clientId) {
  console.error("Could not find a Google client id in .env.local");
  process.exit(1);
}
if (!clientSecret) {
  console.error("Could not find a Google client secret in .env.local");
  process.exit(1);
}

console.log(`Connecting to ${PB_URL} ...`);
const token = await superuserAuth();
console.log(`Authenticated as superuser: ${ADMIN_EMAIL}`);

const users = await api("/api/collections/users", { token });
if (!users || users.type !== "auth") {
  console.error("No 'users' auth collection found on this instance");
  process.exit(1);
}

const provider = {
  name: "google",
  clientId,
  clientSecret,
  // Optional: restrict which Google apps/domains may log in. Empty = any Google.
  authUrl: "",
  tokenUrl: "",
  userApiUrl: "",
};

await api(`/api/collections/${users.id}`, {
  method: "PATCH",
  token,
  body: {
    oauth2: {
      enabled: true,
      providers: [provider],
    },
  },
});

console.log("Google OAuth2 enabled on the 'users' collection ✓");
console.log(`  clientId: ${clientId.slice(0, 12)}… (secret hidden)`);
console.log("Next: make sure this redirect URI is registered on the Google client:");
console.log("  " + PB_URL + "/api/oauth2-redirect");
