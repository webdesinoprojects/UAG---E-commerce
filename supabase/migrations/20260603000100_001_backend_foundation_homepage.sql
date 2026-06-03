begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('customer', 'admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'imagekit',
  storage_key text not null,
  url text not null,
  alt_text text,
  mime_type text,
  width integer,
  height integer,
  size_bytes bigint,
  folder text,
  is_public boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_provider_check check (provider in ('imagekit', 'local', 'external')),
  constraint media_assets_url_check check (
    url ~ '^https?://'
    or (url like '/%' and url not like '//%')
  )
);

alter table public.media_assets enable row level security;

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop policy if exists media_assets_public_read on public.media_assets;
create policy media_assets_public_read
on public.media_assets
for select
to anon, authenticated
using (is_public);

drop policy if exists media_assets_admin_write on public.media_assets;
create policy media_assets_admin_write
on public.media_assets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  section_type text not null,
  name text not null,
  is_enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint cms_sections_section_key_format check (section_key ~ '^[a-z0-9][a-z0-9._-]*$'),
  constraint cms_sections_section_type_format check (section_type ~ '^[a-z0-9][a-z0-9_-]*$')
);

alter table public.cms_sections enable row level security;

drop trigger if exists cms_sections_set_updated_at on public.cms_sections;
create trigger cms_sections_set_updated_at
before update on public.cms_sections
for each row execute function public.set_updated_at();

drop policy if exists cms_sections_public_read_enabled on public.cms_sections;
create policy cms_sections_public_read_enabled
on public.cms_sections
for select
to anon, authenticated
using (is_enabled);

drop policy if exists cms_sections_admin_write on public.cms_sections;
create policy cms_sections_admin_write
on public.cms_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.cms_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections(id) on delete cascade,
  item_key text,
  title text not null,
  subtitle text,
  body text,
  href text,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint cms_section_items_item_key_format check (item_key is null or item_key ~ '^[a-z0-9][a-z0-9._-]*$'),
  constraint cms_section_items_href_safe check (
    href is null
    or href ~ '^https?://'
    or (href like '/%' and href not like '//%')
  ),
  constraint cms_section_items_time_window_check check (starts_at is null or ends_at is null or starts_at < ends_at),
  constraint cms_section_items_section_item_key_unique unique (section_id, item_key)
);

alter table public.cms_section_items enable row level security;

create index if not exists cms_section_items_section_sort_idx
on public.cms_section_items(section_id, sort_order, created_at);

drop trigger if exists cms_section_items_set_updated_at on public.cms_section_items;
create trigger cms_section_items_set_updated_at
before update on public.cms_section_items
for each row execute function public.set_updated_at();

drop policy if exists cms_section_items_public_read_enabled on public.cms_section_items;
create policy cms_section_items_public_read_enabled
on public.cms_section_items
for select
to anon, authenticated
using (
  is_enabled
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
  and exists (
    select 1
    from public.cms_sections
    where public.cms_sections.id = cms_section_items.section_id
      and public.cms_sections.is_enabled
  )
);

drop policy if exists cms_section_items_admin_write on public.cms_section_items;
create policy cms_section_items_admin_write
on public.cms_section_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.cms_sections (section_key, section_type, name, is_enabled, settings)
values (
  'homepage.top_marquee',
  'announcement_marquee',
  'Homepage Top Marquee',
  true,
  '{
    "backgroundColor": "#09090b",
    "textColor": "#ffffff",
    "accentColor": "#f59e0b",
    "speedSeconds": 35
  }'::jsonb
)
on conflict (section_key) do nothing;

with section as (
  select id
  from public.cms_sections
  where section_key = 'homepage.top_marquee'
)
insert into public.cms_section_items (
  section_id,
  item_key,
  title,
  settings,
  sort_order,
  is_enabled
)
select
  section.id,
  seed.item_key,
  seed.title,
  seed.settings,
  seed.sort_order,
  true
from section
cross join (
  values
    (
      'fast-free-delivery',
      'FAST & FREE DELIVERY ON EVERY ORDER',
      '{"icon": "truck"}'::jsonb,
      10
    ),
    (
      'prepaid-discount',
      'GET 5% EXTRA DISCOUNT ON PREPAID ORDERS',
      '{"icon": "sparkles"}'::jsonb,
      20
    )
) as seed(item_key, title, settings, sort_order)
on conflict (section_id, item_key) do nothing;

commit;
