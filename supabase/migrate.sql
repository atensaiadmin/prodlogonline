-- prodlog schema for Supabase
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

-- Ideas
create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  one_liner   text not null default '',
  stage       text not null default 'inbox'
              check (stage in ('inbox','validating','building','launched','dead')),
  idea_type   text not null default 'app'
              check (idea_type in ('app','paper','research','writing','other')),
  conviction  integer not null default 5 check (conviction between 1 and 10),
  tags        jsonb not null default '[]'::jsonb,
  links       jsonb not null default '{}'::jsonb,
  visibility  text not null default 'private'
              check (visibility in ('private','links','docs','summary','full')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Entries (progress log)
create table if not exists public.entries (
  id           uuid primary key default gen_random_uuid(),
  idea_id      uuid not null references public.ideas(id) on delete cascade,
  body         text not null default '',
  mood         text
               check (mood in ('excited','hopeful','neutral','unsure','frustrated')),
  action_taken text not null default '',
  created_at   timestamptz not null default now()
);

-- Add-ons / external services
create table if not exists public.addons (
  id            uuid primary key default gen_random_uuid(),
  idea_id       uuid not null references public.ideas(id) on delete cascade,
  name          text not null,
  category      text not null default 'other'
                check (category in ('hosting','database','auth','storage','analytics',
                                    'email','payments','monitoring','ci_cd','domains','ai','other')),
  account_label text not null default '',
  url           text not null default '',
  notes         text not null default '',
  visible       boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Share profiles
create table if not exists public.share_profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Backfill description for existing rows (idempotent)
alter table public.share_profiles add column if not exists description text not null default '';

-- Share profile <-> idea join
create table if not exists public.share_profile_ideas (
  profile_id uuid not null references public.share_profiles(id) on delete cascade,
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  primary key (profile_id, idea_id)
);

-- Auto-update updated_at on ideas
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ideas_touch_updated_at on public.ideas;
create trigger ideas_touch_updated_at
before update on public.ideas
for each row execute function public.touch_updated_at();

drop trigger if exists share_profiles_touch_updated_at on public.share_profiles;
create trigger share_profiles_touch_updated_at
before update on public.share_profiles
for each row execute function public.touch_updated_at();

-- Enable RLS (disabled for now; single-user/preview. Re-enable when auth lands.)
alter table public.ideas enable row level security;
alter table public.entries enable row level security;
alter table public.addons enable row level security;
alter table public.share_profiles enable row level security;
alter table public.share_profile_ideas enable row level security;

drop policy if exists "preview allow all on ideas" on public.ideas;
create policy "preview allow all on ideas" on public.ideas for all using (true) with check (true);
drop policy if exists "preview allow all on entries" on public.entries;
create policy "preview allow all on entries" on public.entries for all using (true) with check (true);
drop policy if exists "preview allow all on addons" on public.addons;
create policy "preview allow all on addons" on public.addons for all using (true) with check (true);
drop policy if exists "preview allow all on share_profiles" on public.share_profiles;
create policy "preview allow all on share_profiles" on public.share_profiles for all using (true) with check (true);
drop policy if exists "preview allow all on share_profile_ideas" on public.share_profile_ideas;
create policy "preview allow all on share_profile_ideas" on public.share_profile_ideas for all using (true) with check (true);



-- Seed data from prodlog.app
TRUNCATE public.addons, public.entries, public.share_profile_ideas, public.share_profiles, public.ideas CASCADE;

-- IDEAS
INSERT INTO public.ideas (id, title, one_liner, stage, idea_type, conviction, tags, links, visibility, created_at, updated_at) VALUES ('6945d58d-189b-435c-80f7-d47e5393a08c', 'Sinnfein-activists', '', 'building', 'app', 5, '[]', '{"repo":"https://github.com/atensaiadmin/sinnfeinmemberbackend","deploy":"https://fein-backend.fly.dev ","docs":null}'::jsonb, 'private', '2026-05-03 17:49:10', '2026-05-03 17:49:10');
INSERT INTO public.ideas (id, title, one_liner, stage, idea_type, conviction, tags, links, visibility, created_at, updated_at) VALUES ('8c418515-c11c-47b6-8dbe-fac1ec703893', 'unalone', '', 'inbox', 'app', 5, '[]', '{"repo":null,"deploy":null,"docs":null}'::jsonb, 'private', '2026-05-03 19:41:21', '2026-05-03 19:41:21');
INSERT INTO public.ideas (id, title, one_liner, stage, idea_type, conviction, tags, links, visibility, created_at, updated_at) VALUES ('a38f151e-25af-4b1e-9f51-d1ea9bac3b2e', 'covenant', '', 'inbox', 'app', 5, '[]', '{"repo":"https://github.com/atensaiadmin/convenantbackend","deploy":"fly.io/apps/covenant-api","docs":null}'::jsonb, 'private', '2026-05-03 20:39:04', '2026-05-03 20:39:04');
INSERT INTO public.ideas (id, title, one_liner, stage, idea_type, conviction, tags, links, visibility, created_at, updated_at) VALUES ('75cd982e-1e9d-4b97-b085-229bbedd91f2', 'studycircle', '', 'inbox', 'app', 5, '[]', '{"repo":"https://github.com/atensaiadmin/biblestudycircle","deploy":null,"docs":null}'::jsonb, 'private', '2026-05-03 20:47:42', '2026-05-03 20:47:42');
INSERT INTO public.ideas (id, title, one_liner, stage, idea_type, conviction, tags, links, visibility, created_at, updated_at) VALUES ('608d11d7-2a1b-45e9-a9fe-9818d04160c7', 'Hearth', '', 'inbox', 'app', 5, '[]', '{"repo":"https://github.com/atensaiadmin/atensaifinancemanager","deploy":null,"docs":null}'::jsonb, 'private', '2026-05-03 20:53:33', '2026-05-03 20:53:33');
INSERT INTO public.ideas (id, title, one_liner, stage, idea_type, conviction, tags, links, visibility, created_at, updated_at) VALUES ('ae35472c-f8e4-4b09-8a95-f26e3b01a2c0', 'churchcircle', '', 'inbox', 'app', 5, '[]', '{"repo":null,"deploy":null,"docs":null}'::jsonb, 'private', '2026-05-03 20:55:12', '2026-05-03 20:55:12');

-- ENTRIES
INSERT INTO public.entries (id, idea_id, body, action_taken, created_at) VALUES ('8c0362b2-6b70-4cf8-861b-a265f2cd35ad', '6945d58d-189b-435c-80f7-d47e5393a08c', 'Product created', '', '2026-05-03 17:49:10');
INSERT INTO public.entries (id, idea_id, body, action_taken, created_at) VALUES ('d71a5e0c-130d-4de4-831b-788b141c1fbe', '8c418515-c11c-47b6-8dbe-fac1ec703893', 'Product created', '', '2026-05-03 19:41:21');
INSERT INTO public.entries (id, idea_id, body, action_taken, created_at) VALUES ('fd887f37-db0c-4e07-bfc6-00a4d588db7b', 'a38f151e-25af-4b1e-9f51-d1ea9bac3b2e', 'Product created', '', '2026-05-03 20:39:04');
INSERT INTO public.entries (id, idea_id, body, action_taken, created_at) VALUES ('0db0e743-8fc5-4032-a909-7cc2382b438f', '75cd982e-1e9d-4b97-b085-229bbedd91f2', 'Product created', '', '2026-05-03 20:47:42');
INSERT INTO public.entries (id, idea_id, body, action_taken, created_at) VALUES ('16d672f3-a230-4348-b9b9-2346c47afa0d', '608d11d7-2a1b-45e9-a9fe-9818d04160c7', 'Product created', '', '2026-05-03 20:53:33');
INSERT INTO public.entries (id, idea_id, body, action_taken, created_at) VALUES ('78f95605-1392-4c2c-b10d-273a2373ad61', 'ae35472c-f8e4-4b09-8a95-f26e3b01a2c0', 'Product created', '', '2026-05-03 20:55:12');

-- ADDONS
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('6945d58d-189b-435c-80f7-d47e5393a08c', 'fly.io', 'hosting', '', '', 'This presently houses sinnfein backend ', true, '2026-05-03 17:52:20');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('6945d58d-189b-435c-80f7-d47e5393a08c', 'neon database', 'database', '', '', 'sinn fein app database - tha actual data will be recieved from adrian for real deployment', true, '2026-05-03 18:18:22');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('8c418515-c11c-47b6-8dbe-fac1ec703893', 'supabase', 'auth', '', 'https://ekkhdihwtpdejzhdbgrk.supabase.co', '', true, '2026-05-03 20:13:54');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('8c418515-c11c-47b6-8dbe-fac1ec703893', 'neon', 'database', '', 'https://console.neon.tech/app/projects/quiet-hill-54250598', '', true, '2026-05-03 20:29:10');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('8c418515-c11c-47b6-8dbe-fac1ec703893', 'firebase', 'auth', '', 'https://console.firebase.google.com/project/unalonelite ', '', true, '2026-05-03 20:34:28');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('8c418515-c11c-47b6-8dbe-fac1ec703893', 'google-cloud-console', 'other', '', 'https://console.cloud.google.com/welcome?project=unalone-14b3a', 'atensai gmail as a reference account ', true, '2026-05-03 20:37:46');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('a38f151e-25af-4b1e-9f51-d1ea9bac3b2e', 'Google-cloud-console', 'other', '', 'https://console.cloud.google.com/welcome?project=convenant-493912', '', true, '2026-05-03 20:40:58');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('a38f151e-25af-4b1e-9f51-d1ea9bac3b2e', 'fly.io', 'hosting', '', 'https://fly.io/apps/covenant-api', '', true, '2026-05-03 20:41:31');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('a38f151e-25af-4b1e-9f51-d1ea9bac3b2e', 'supabase', 'auth', '', 'https://irvmupqoqvrthmbudict.supabase.co', '', true, '2026-05-03 20:44:39');
INSERT INTO public.addons (idea_id, name, category, account_label, url, notes, visible, created_at) VALUES ('a38f151e-25af-4b1e-9f51-d1ea9bac3b2e', 'Neon', 'database', '', 'https://console.neon.tech/app/projects/ancient-butterfly-59237250', '', true, '2026-05-03 20:50:42');
