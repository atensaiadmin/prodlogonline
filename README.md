# prodlog

A progress log for solo founders. Track ideas from inception to execution.

## Why

Founders document ideas constantly — notebooks, markdown files, voice memos. But ideas stall at the same point: moving from *notion* to *execution*. There's no lightweight tool that tracks this journey.

Existing tools (Linear, Aha!, Productboard) assume you have a team, a shipped product, and a roadmap. prodlog is for the phase *before* that — the solo, pre-product-market-fit stage where most ideas live and die.

## Quick links

- [Concept](docs/CONCEPT.md) — problem, persona, vision
- [Data model](docs/DATA_MODEL.md) — entities, fields, relationships
- [Architecture](docs/ARCHITECTURE.md) — routes, components, tech stack
- [Phases](docs/PHASES.md) — v0 → v1 → v2 scope

## Local development

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. The app talks to the hosted PocketBase
backend, so there's no local database or Google OAuth setup needed to try
login:

- `NEXT_PUBLIC_PB_URL` defaults to `https://prodlogonline.atensai.com`
  (set it in `.env.local` to override).
- **Google OAuth**: only the PocketBase redirect URI
  `https://prodlogonline.atensai.com/api/oauth2-redirect` is registered on
  the Google client. `localhost` is **not** registered anywhere — it doesn't
  need to be. The login popup bounces: localhost → PocketBase → Google →
  PocketBase → localhost.
- **Cookie note**: the auth cookie is only marked `Secure` on `https:` (see
  `app/login/login-form.tsx`). Browsers silently drop `Secure` cookies on
  plain http, so if login seems to complete but loops back to `/login`, you
  were almost certainly not on `http://localhost:3000`. Prefer localhost over
  the `http://172.20.x.x` network address Next also prints — it's stable, and
  accessing via a LAN IP triggers a harmless `allowedDevOrigins` warning.

## Status

Pre-build. Design and architecture phase.
