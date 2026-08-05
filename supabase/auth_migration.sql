-- prodlog auth migration
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- AFTER enabling Google as an auth provider in Authentication -> Providers
-- AND AFTER signing in at least once at /login (that creates your user).

-- Guard: there must be at least one auth user to backfill ownership to.
do $$
declare uid uuid;
begin
  select id into uid from auth.users order by created_at asc limit 1;
  if uid is null then
    raise exception 'No Supabase user found yet. Open /login in your app, sign in with Google once, then run this migration again.';
  end if;
end $$;

-- 1) Add user_id ownership columns
alter table public.ideas add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.entries add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.addons add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.share_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.share_profiles add column if not exists description text not null default '';
alter table public.share_profiles add column if not exists layer text not null default 'pitch';

-- 2) Backfill existing rows to the first user (the current owner)
do $$
declare uid uuid;
begin
  select id into uid from auth.users order by created_at asc limit 1;
  if uid is not null then
    update public.ideas set user_id = uid where user_id is null;
    update public.entries e set user_id = i.user_id from public.ideas i where e.idea_id = i.id and e.user_id is null;
    update public.addons a set user_id = i.user_id from public.ideas i where a.idea_id = i.id and a.user_id is null;
    update public.share_profiles set user_id = uid where user_id is null;
  end if;
end $$;

-- 3) Enforce ownership on all new rows
alter table public.ideas alter column user_id set not null;
alter table public.ideas alter column user_id set default auth.uid();
alter table public.entries alter column user_id set not null;
alter table public.entries alter column user_id set default auth.uid();
alter table public.addons alter column user_id set not null;
alter table public.addons alter column user_id set default auth.uid();
alter table public.share_profiles alter column user_id set not null;
alter table public.share_profiles alter column user_id set default auth.uid();

-- 4) Drop the old preview "allow all" policies
drop policy if exists "preview allow all on ideas" on public.ideas;
drop policy if exists "preview allow all on entries" on public.entries;
drop policy if exists "preview allow all on addons" on public.addons;
drop policy if exists "preview allow all on share_profiles" on public.share_profiles;
drop policy if exists "preview allow all on share_profile_ideas" on public.share_profile_ideas;

-- 5) Ideas: owner full control + public read for ideas included in a share profile
create policy "ideas owner all" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ideas public shared read" on public.ideas
  for select using (
    visibility <> 'private'
    and exists (select 1 from public.share_profile_ideas spi where spi.idea_id = public.ideas.id)
  );

-- 6) Entries: owned via the parent idea; public read for shared ideas
create policy "entries owner all" on public.entries
  for all using (
    exists (select 1 from public.ideas i where i.id = public.entries.idea_id and i.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ideas i where i.id = public.entries.idea_id and i.user_id = auth.uid())
  );

create policy "entries public shared read" on public.entries
  for select using (
    exists (
      select 1 from public.share_profile_ideas spi
      join public.ideas i on i.id = spi.idea_id
      where spi.idea_id = public.entries.idea_id and i.visibility <> 'private'
    )
  );

-- 7) Addons: owned via the parent idea; public read for shared ideas
create policy "addons owner all" on public.addons
  for all using (
    exists (select 1 from public.ideas i where i.id = public.addons.idea_id and i.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ideas i where i.id = public.addons.idea_id and i.user_id = auth.uid())
  );

create policy "addons public shared read" on public.addons
  for select using (
    visible
    and exists (
      select 1 from public.share_profile_ideas spi
      join public.ideas i on i.id = spi.idea_id
      where spi.idea_id = public.addons.idea_id and i.visibility <> 'private'
    )
  );

-- 8) Share profiles: owner full control + public read for slug lookups
create policy "share_profiles owner all" on public.share_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "share_profiles public read" on public.share_profiles
  for select using (true);

-- 9) Share profile <-> idea join: public read + owner management via the profile
create policy "spi public read" on public.share_profile_ideas
  for select using (true);

create policy "spi owner all" on public.share_profile_ideas
  for all using (
    exists (select 1 from public.share_profiles p where p.id = public.share_profile_ideas.profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.share_profiles p where p.id = public.share_profile_ideas.profile_id and p.user_id = auth.uid())
  );
