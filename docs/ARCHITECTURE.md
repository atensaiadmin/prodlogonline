# Architecture

## Routes (v0)

| Route | Page | Purpose |
|---|---|---|
| `/` | Dashboard | All ideas grouped by stage. Quick-add bar at top. |
| `/ideas/new` | New idea form | Title, one-liner, stage (defaults to inbox), conviction, tags |
| `/ideas/[id]` | Idea detail | Timeline of entries. Stage changer. Add entry form. |
| `/ideas/[id]/edit` | Edit idea | Edit fields |
| `/settings` | Settings | (v1) Preferences, export |

## Component tree (frontend)

```
App
├── Layout (header + nav)
├── Dashboard
│   ├── StageColumn (inbox / validating / building / launched / dead)
│   │   └── IdeaCard (title, conviction, entry count, last updated)
│   └── QuickAdd (inline form, creates idea in inbox)
├── IdeaDetail
│   ├── IdeaHeader (title, stage badge, conviction, tags)
│   ├── EntryTimeline
│   │   └── Entry (body, mood, action_taken, timestamp)
│   └── NewEntryForm (textarea, optional mood picker, optional action field)
└── NewIdea (full-page form)
```

## Tech stack (recommended — decisions left to builder)

| Layer | Options | Notes |
|---|---|---|
| Frontend | React / Svelte / plain HTML+HTMX | Pick what ships fastest |
| Styling | Tailwind | Consistent, fast iteration |
| Database | SQLite (Turso/LibSQL) or Postgres | Single user = SQLite is fine |
| Auth | None for v0, or magic-link (Clerk/Auth.js) | v0 might not need auth at all |
| Hosting | Vercel / Railway / Fly.io | Pick one |
| ORM | Drizzle / Prisma | Prefer Drizzle for SQLite |

## Data flow

```
User action → API route → Database → Response → Re-render
```

v0 can be a simple server-rendered app (Next.js or SvelteKit) with API routes. No WebSockets, no realtime, no complex state management.
