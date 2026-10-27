-- Run in Supabase Dashboard > SQL Editor.
-- This schema intentionally grants write access only to authenticated users
-- whose auth.uid() is listed in public.admin_users. Do NOT expose service_role keys.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 500),
  category text not null default 'PROJECT' check (char_length(category) <= 60),
  project_url text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects" on public.projects
  for select to anon, authenticated using (true);

drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects" on public.projects
  for insert to authenticated with check (
    exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects" on public.projects
  for update to authenticated using (
    exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects" on public.projects
  for delete to authenticated using (
    exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant select on public.admin_users to authenticated;

-- AFTER creating the admin user in Supabase Authentication > Users,
-- copy that user's UUID and run the following separately:
-- insert into public.admin_users (user_id) values ('PASTE-ADMIN-USER-UUID-HERE');
