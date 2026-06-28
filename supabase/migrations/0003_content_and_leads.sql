-- Editable site content (Home/About/Studio/Contact + brand images) and
-- richer lead capture (name/email/phone/message already partly present).

-- =====================================================================
-- SITE SETTINGS — key/JSON content the admin can edit
-- =====================================================================
create table if not exists public.site_settings (
  key        text primary key,           -- 'artist' | 'about' | 'studio' | 'contact' | 'marquee'
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- LEADS — contact fields for the inquiry forms
-- =====================================================================
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;
-- (name, contact, message already exist from 0001)
