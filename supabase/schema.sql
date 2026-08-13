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

-- Bugs / issues to fix (one-line Jira-style issue per idea)
create table if not exists public.bugs (
  id         uuid primary key default gen_random_uuid(),
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  title      text not null,
  status     text not null default 'open'
             check (status in ('open','in_progress','fixed','wontfix')),
  severity   text not null default 'medium'
             check (severity in ('low','medium','high','critical')),
  created_at timestamptz not null default now()
);

-- Share profiles
create table if not exists public.share_profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  layer       text not null default 'pitch',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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
alter table public.bugs enable row level security;
alter table public.share_profiles enable row level security;
alter table public.share_profile_ideas enable row level security;

create policy "preview allow all on ideas" on public.ideas for all using (true) with check (true);
create policy "preview allow all on entries" on public.entries for all using (true) with check (true);
create policy "preview allow all on addons" on public.addons for all using (true) with check (true);
create policy "preview allow all on bugs" on public.bugs for all using (true) with check (true);
create policy "preview allow all on share_profiles" on public.share_profiles for all using (true) with check (true);
create policy "preview allow all on share_profile_ideas" on public.share_profile_ideas for all using (true) with check (true);
