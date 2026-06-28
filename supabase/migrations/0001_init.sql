-- Ram Barkhane portfolio — dynamic backend schema
-- Tables: collections, artworks, visits (analytics), leads (inquiries)
-- Safe to run multiple times (idempotent).

create extension if not exists "pgcrypto";

-- =====================================================================
-- COLLECTIONS
-- =====================================================================
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_featured boolean not null default false,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- ARTWORKS
-- =====================================================================
create table if not exists public.artworks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text,
  medium        text,
  dimensions    text,
  price         text,
  year          text,
  statement     text,
  image_url     text,
  collection_id uuid references public.collections(id) on delete set null,
  is_featured   boolean not null default false,
  is_available  boolean not null default true,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists artworks_collection_idx on public.artworks(collection_id);
create index if not exists artworks_featured_idx   on public.artworks(is_featured);
create index if not exists artworks_sort_idx       on public.artworks(sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

-- =====================================================================
-- VISITS (analytics)
-- =====================================================================
create table if not exists public.visits (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  path         text,
  referrer     text,
  source       text,        -- derived channel: whatsapp / instagram / google / direct / ...
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  device       text,        -- mobile / tablet / desktop
  session_id   text
);
create index if not exists visits_created_idx on public.visits(created_at);
create index if not exists visits_source_idx  on public.visits(source);

-- =====================================================================
-- LEADS (inquiries / interest events)
-- =====================================================================
create table if not exists public.leads (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text,
  contact       text,        -- email / phone if captured
  message       text,
  type          text not null default 'whatsapp_inquiry', -- whatsapp_inquiry / commission / email / general
  artwork_id    uuid references public.artworks(id) on delete set null,
  artwork_title text,
  price         text,
  source        text,        -- where on the site: lightbox / hero / contact / navbar / gallery
  referrer      text,
  utm_source    text,
  session_id    text,
  status        text not null default 'new',  -- new / contacted / closed
  handled       boolean not null default false
);
create index if not exists leads_created_idx on public.leads(created_at);
create index if not exists leads_status_idx  on public.leads(status);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.collections enable row level security;
alter table public.artworks    enable row level security;
alter table public.visits      enable row level security;
alter table public.leads       enable row level security;

-- Catalog: public read, admin (authenticated) write
drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read" on public.collections for select using (true);
drop policy if exists "collections_admin_write" on public.collections;
create policy "collections_admin_write" on public.collections for all to authenticated using (true) with check (true);

drop policy if exists "artworks_public_read" on public.artworks;
create policy "artworks_public_read" on public.artworks for select using (true);
drop policy if exists "artworks_admin_write" on public.artworks;
create policy "artworks_admin_write" on public.artworks for all to authenticated using (true) with check (true);

-- Visits: anyone can insert (log a view), only admin can read. No public update/delete.
drop policy if exists "visits_public_insert" on public.visits;
create policy "visits_public_insert" on public.visits for insert to anon, authenticated with check (true);
drop policy if exists "visits_admin_read" on public.visits;
create policy "visits_admin_read" on public.visits for select to authenticated using (true);

-- Leads: anyone can insert (an inquiry), only admin can read / update.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads for insert to anon, authenticated with check (true);
drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads for select to authenticated using (true);
drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads for update to authenticated using (true) with check (true);

-- =====================================================================
-- STORAGE — public bucket for artwork images
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

drop policy if exists "artwork_images_public_read" on storage.objects;
create policy "artwork_images_public_read" on storage.objects
  for select using (bucket_id = 'artworks');
drop policy if exists "artwork_images_admin_insert" on storage.objects;
create policy "artwork_images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'artworks');
drop policy if exists "artwork_images_admin_update" on storage.objects;
create policy "artwork_images_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'artworks');
drop policy if exists "artwork_images_admin_delete" on storage.objects;
create policy "artwork_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'artworks');

-- =====================================================================
-- SEED — collections (idempotent by slug)
-- =====================================================================
insert into public.collections (slug, label, description, sort_order, is_featured) values
  ('masterpiece', 'The Masterpiece Collection', 'Signature large-scale works — the pinnacle of the studio.', 1, true),
  ('limited',     'Limited Edition Luxe',       'Limited, highly collectible pieces.',                       2, false),
  ('modern',      'Modern Elegance',            'Accessible contemporary works.',                            3, false)
on conflict (slug) do update
  set label = excluded.label,
      description = excluded.description,
      sort_order = excluded.sort_order;
