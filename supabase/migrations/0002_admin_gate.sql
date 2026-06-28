-- Harden admin access: gate all privileged policies behind an explicit
-- allowlist, so merely being "authenticated" (e.g. via public signup) is NOT
-- enough — the user's email must be in public.app_admins.

create table if not exists public.app_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- Seed the initial admin(s). Add more rows to grant access.
-- Login is by username (part before @) or full email.
insert into public.app_admins (email) values
  ('admin-ram@rambarkhane.app'),
  ('rambarkhane9371@gmail.com')
on conflict (email) do nothing;

alter table public.app_admins enable row level security;
drop policy if exists "app_admins_admin_read" on public.app_admins;
create policy "app_admins_admin_read" on public.app_admins
  for select to authenticated using (true);

-- Helper: is the current user an approved admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins where email = auth.jwt() ->> 'email'
  );
$$;

-- Re-create privileged policies to require is_admin() ----------------------

drop policy if exists "collections_admin_write" on public.collections;
create policy "collections_admin_write" on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "artworks_admin_write" on public.artworks;
create policy "artworks_admin_write" on public.artworks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "visits_admin_read" on public.visits;
create policy "visits_admin_read" on public.visits
  for select to authenticated using (public.is_admin());

drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage writes also gated to admins (public read stays open)
drop policy if exists "artwork_images_admin_insert" on storage.objects;
create policy "artwork_images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'artworks' and public.is_admin());
drop policy if exists "artwork_images_admin_update" on storage.objects;
create policy "artwork_images_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'artworks' and public.is_admin());
drop policy if exists "artwork_images_admin_delete" on storage.objects;
create policy "artwork_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'artworks' and public.is_admin());
