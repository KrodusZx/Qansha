-- Run in Supabase Dashboard > SQL Editor, after creating a project.
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('flight','hotel')),
  offer_key text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id,kind,offer_key)
);
create index if not exists favorites_owner_idx on public.favorites(user_id,created_at desc);
alter table public.favorites enable row level security;
create policy "Read your favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save your favorites" on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Delete your favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);
-- No update policy: favorites can only be added/removed.