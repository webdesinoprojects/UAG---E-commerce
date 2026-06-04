begin;

/* -------------------------------------------------------------------------- */
/* Catalog categories                                                         */
/* -------------------------------------------------------------------------- */

create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.catalog_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  banner_media_asset_id uuid references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint catalog_categories_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint catalog_categories_parent_not_self check (parent_id is null or parent_id <> id)
);

alter table public.catalog_categories enable row level security;

create index if not exists catalog_categories_parent_sort_idx
on public.catalog_categories(parent_id, sort_order, name);

create index if not exists catalog_categories_active_sort_idx
on public.catalog_categories(is_active, sort_order, name);

drop trigger if exists catalog_categories_set_updated_at on public.catalog_categories;
create trigger catalog_categories_set_updated_at
before update on public.catalog_categories
for each row execute function public.set_updated_at();

drop policy if exists catalog_categories_public_read_active on public.catalog_categories;
create policy catalog_categories_public_read_active
on public.catalog_categories
for select
to anon, authenticated
using (is_active);

drop policy if exists catalog_categories_admin_write on public.catalog_categories;
create policy catalog_categories_admin_write
on public.catalog_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

/* -------------------------------------------------------------------------- */
/* Catalog products                                                           */
/* -------------------------------------------------------------------------- */

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.catalog_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  brand text not null default 'UAG Urbn Armour Gear',
  short_description text,
  description text,
  price_cents integer not null default 0,
  compare_at_price_cents integer,
  cost_price_cents integer,
  currency text not null default 'INR',
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  status text not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_popular boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  feature_bullets jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  compatibility_notes text,
  shipping_policy text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint catalog_products_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint catalog_products_status_check check (status in ('draft', 'active', 'archived')),
  constraint catalog_products_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint catalog_products_price_nonnegative check (price_cents >= 0),
  constraint catalog_products_compare_price_nonnegative check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  constraint catalog_products_cost_price_nonnegative check (cost_price_cents is null or cost_price_cents >= 0),
  constraint catalog_products_stock_nonnegative check (stock_quantity >= 0),
  constraint catalog_products_low_stock_nonnegative check (low_stock_threshold >= 0),
  constraint catalog_products_feature_bullets_array check (jsonb_typeof(feature_bullets) = 'array'),
  constraint catalog_products_specifications_array check (jsonb_typeof(specifications) = 'array')
);

alter table public.catalog_products enable row level security;

create index if not exists catalog_products_category_status_idx
on public.catalog_products(category_id, status, sort_order, created_at desc);

create index if not exists catalog_products_flags_idx
on public.catalog_products(is_new_arrival, is_popular, is_featured, status);

drop trigger if exists catalog_products_set_updated_at on public.catalog_products;
create trigger catalog_products_set_updated_at
before update on public.catalog_products
for each row execute function public.set_updated_at();

drop policy if exists catalog_products_public_read_active on public.catalog_products;
create policy catalog_products_public_read_active
on public.catalog_products
for select
to anon, authenticated
using (
  status = 'active'
  and (published_at is null or published_at <= now())
);

drop policy if exists catalog_products_admin_write on public.catalog_products;
create policy catalog_products_admin_write
on public.catalog_products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

/* -------------------------------------------------------------------------- */
/* Product media                                                              */
/* -------------------------------------------------------------------------- */

create table if not exists public.catalog_product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  placement text not null default 'gallery',
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  is_enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint catalog_product_media_placement_check check (placement in ('gallery', 'hero', 'thumbnail', 'bento', 'detail')),
  constraint catalog_product_media_settings_object check (jsonb_typeof(settings) = 'object')
);

alter table public.catalog_product_media enable row level security;

create index if not exists catalog_product_media_product_sort_idx
on public.catalog_product_media(product_id, placement, sort_order);

drop trigger if exists catalog_product_media_set_updated_at on public.catalog_product_media;
create trigger catalog_product_media_set_updated_at
before update on public.catalog_product_media
for each row execute function public.set_updated_at();

drop policy if exists catalog_product_media_public_read_active on public.catalog_product_media;
create policy catalog_product_media_public_read_active
on public.catalog_product_media
for select
to anon, authenticated
using (
  is_enabled
  and exists (
    select 1
    from public.catalog_products
    where public.catalog_products.id = catalog_product_media.product_id
      and public.catalog_products.status = 'active'
      and (
        public.catalog_products.published_at is null
        or public.catalog_products.published_at <= now()
      )
  )
  and exists (
    select 1
    from public.media_assets
    where public.media_assets.id = catalog_product_media.media_asset_id
      and public.media_assets.is_public
  )
);

drop policy if exists catalog_product_media_admin_write on public.catalog_product_media;
create policy catalog_product_media_admin_write
on public.catalog_product_media
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

/* -------------------------------------------------------------------------- */
/* Product variants                                                           */
/* -------------------------------------------------------------------------- */

create table if not exists public.catalog_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  sku text unique,
  title text not null,
  option_values jsonb not null default '{}'::jsonb,
  price_cents integer,
  compare_at_price_cents integer,
  stock_quantity integer not null default 0,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint catalog_product_variants_option_values_object check (jsonb_typeof(option_values) = 'object'),
  constraint catalog_product_variants_price_nonnegative check (price_cents is null or price_cents >= 0),
  constraint catalog_product_variants_compare_price_nonnegative check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  constraint catalog_product_variants_stock_nonnegative check (stock_quantity >= 0)
);

alter table public.catalog_product_variants enable row level security;

create index if not exists catalog_product_variants_product_idx
on public.catalog_product_variants(product_id, is_default desc, title);

drop trigger if exists catalog_product_variants_set_updated_at on public.catalog_product_variants;
create trigger catalog_product_variants_set_updated_at
before update on public.catalog_product_variants
for each row execute function public.set_updated_at();

drop policy if exists catalog_product_variants_public_read_active on public.catalog_product_variants;
create policy catalog_product_variants_public_read_active
on public.catalog_product_variants
for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.catalog_products
    where public.catalog_products.id = catalog_product_variants.product_id
      and public.catalog_products.status = 'active'
      and (
        public.catalog_products.published_at is null
        or public.catalog_products.published_at <= now()
      )
  )
);

drop policy if exists catalog_product_variants_admin_write on public.catalog_product_variants;
create policy catalog_product_variants_admin_write
on public.catalog_product_variants
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

/* -------------------------------------------------------------------------- */
/* Default categories                                                         */
/* -------------------------------------------------------------------------- */

insert into public.catalog_categories (
  name,
  slug,
  description,
  sort_order,
  is_active,
  is_featured,
  seo_title,
  seo_description
)
values
  (
    'Earbuds',
    'earbuds',
    'True wireless earbuds and Airdopes with ENC, ANC, deep bass, and gaming modes.',
    10,
    true,
    true,
    'UAG Earbuds',
    'Shop UAG true wireless earbuds with ENC, ANC, deep bass, and gaming features.'
  ),
  (
    'Neckbands',
    'neckbands',
    'Wireless neckbands with magnetic sensors, long battery life, and water resistance.',
    20,
    true,
    true,
    'UAG Neckbands',
    'Shop UAG wireless neckbands with magnetic controls, long battery life, and rich bass.'
  ),
  (
    'Smart Watch',
    'smart-watch',
    'Smart watches with calling, sports tracking, rugged build, and daily health features.',
    30,
    true,
    true,
    'UAG Smart Watches',
    'Shop UAG smart watches with calling, fitness tracking, and rugged daily utility.'
  ),
  (
    'Power Banks',
    'power-banks',
    'Fast-charge power banks built for travel, outdoor backup, and daily charging.',
    40,
    true,
    true,
    'UAG Power Banks',
    'Shop UAG fast-charge power banks for phones, accessories, travel, and emergency backup.'
  ),
  (
    'Bluetooth Speaker',
    'bluetooth-speaker',
    'Portable and party speakers with clear bass, rugged bodies, and wireless playback.',
    50,
    true,
    true,
    'UAG Bluetooth Speakers',
    'Shop UAG Bluetooth speakers with powerful bass, portable design, and rugged build.'
  ),
  (
    'Data Cable',
    'data-cable',
    'Fast-charge and braided data cables for USB-C, Lightning, and daily charging.',
    60,
    true,
    true,
    'UAG Data Cables',
    'Shop UAG fast-charge braided data cables for reliable charging and transfer.'
  )
on conflict (slug) do nothing;

commit;
