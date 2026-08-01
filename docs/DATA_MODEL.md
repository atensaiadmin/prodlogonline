# Data model

## Idea

The central entity. Represents a single idea a founder is tracking.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / cuid | Primary key |
| `title` | string | Required, short (under 120 chars) |
| `one_liner` | string | Optional, 2–3 sentences |
| `stage` | enum | `inbox` → `validating` → `building` → `launched` → `dead` |
| `conviction` | integer (1–10) | How convinced the founder is right now |
| `tags` | string[] | Freeform labels (e.g. ["saas", "b2b", "ai"]) |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Auto |

## Entry

A timestamped note attached to an idea. This is the core of the "progress log."

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / cuid | Primary key |
| `idea_id` | UUID / cuid | FK → Idea |
| `body` | text | Markdown? Or plain text? TBD |
| `mood` | enum | `excited`, `unsure`, `frustrated`, `neutral`, `hopeful` — optional |
| `action_taken` | text | Short note on what was done (e.g. "sent 5 outreach emails") |
| `created_at` | timestamp | Auto |

## Stage enum

```
inbox → validating → building → launched → dead
        ↑___________|_______________|         |
        |         recycling back             |
        |____________________________________|
```

Ideas can move backward (validating → inbox) or skip stages.
