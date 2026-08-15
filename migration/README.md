# Supabase → PocketBase migration (prodlogonline)

Moves the prodlogonline data from Supabase (`twyklgelmmsmxwwpeowv`) into a
PocketBase instance (target: `https://prodlogonline.atensai.com`, port 8091).

## What's here

| File | Purpose |
|---|---|
| `data/*.json` | Raw exports from Supabase (read-only source of truth) |
| `pb-migrate.mjs` | Creates collections + imports records (no deps, Node fetch) |
| `.env.migrate` | Superuser credentials for the target PB instance (git-ignored) |

## How the data maps

| Supabase table | PocketBase collection | Notes |
|---|---|---|
| `ideas` | `ideas` | UUID → 15-char PB id (md5 prefix), `tags`/`links` stay JSON |
| `entries` | `entries` | `idea_id` FK remapped, `mood` enum → select |
| `addons` | `addons` | `idea_id` FK remapped, `visible` bool |
| `bugs` | `bugs` | table never existed in Supabase → empty collection, feature still works |
| `share_profiles` | `share_profiles` | `slug` preserved (public URLs keep working) |
| `share_profile_ideas` | `share_profile_ideas` | join remapped |

Supabase UUIDs can't be PocketBase ids (PB uses 15-char `[a-z0-9]`), so each
UUID gets a deterministic PB id via `md5(uuid).slice(0,15)` and every relation
is re-pointed. Share **slugs** are kept as-is because the public `/share/[slug]`
URLs depend on them.

## Access rules (mirrors the Supabase RLS)

Single-user app (owner = `folamob@gmail.com`), so:

- **Authenticated user** (`@request.auth.id != ""`) = full access everywhere.
- **Anonymous** can only read ideas that are `visibility != "private"` AND
  included in a share profile (plus that idea's visible addons + entries, and
  public share-profile slug lookups).

PocketBase enforces `listRule` (list queries) and `viewRule` (fetch by id)
separately — both are set so the public share page works anonymously.

## Running it

1. Create `.env.migrate` (never commit it):
   ```bash
   cat > migration/.env.migrate <<'EOF'
   PB_URL=https://prodlogonline.atensai.com
   PB_ADMIN_EMAIL=you@example.com
   PB_ADMIN_PASSWORD=your-superuser-password
   EOF
   ```
2. Run:
   ```bash
   cd migration
   set -a; . ./.env.migrate; set +a
   node pb-migrate.mjs
   ```
   Safe to re-run: existing collections are skipped, records use deterministic
   ids so duplicates are skipped. Use `FORCE=1` only to wipe + recreate.

3. Verify at `https://prodlogonline.atensai.com/_/`.

## Re-exporting from Supabase (only if the data changed)

```bash
KEY=<service_role key>
BASE=https://twyklgelmmsmxwwpeowv.supabase.co/rest/v1
for t in ideas entries addons bugs share_profiles share_profile_ideas; do
  curl -sS "$BASE/$t?select=*" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -o "data/$t.json"
done
```

## After the data lands

- Enable **Google OAuth2** in the PB admin (Settings → Auth providers) so
  `folamob@gmail.com` can log in with Google (reuse the OAuth client from the
  Google Cloud console).
- Re-wire the Next.js app: `lib/store.ts`, the `lib/supabase-*.ts` files, and
  `middleware.ts` move from `@supabase/ssr` to the `pocketbase` SDK, and
  `.env.local` swaps `NEXT_PUBLIC_SUPABASE_*` for `NEXT_PUBLIC_PB_URL`.
