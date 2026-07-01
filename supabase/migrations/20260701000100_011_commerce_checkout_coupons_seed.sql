begin;

create table if not exists public.commerce_coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  percent_off numeric(5,2) not null check (percent_off >= 0 and percent_off <= 100),
  min_cents integer not null default 0 check (min_cents >= 0),
  max_discount_cents integer check (max_discount_cents >= 0),
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commerce_coupons
  alter column min_cents type integer using min_cents::integer,
  alter column min_cents set default 0,
  alter column min_cents set not null,
  alter column max_discount_cents type integer using max_discount_cents::integer,
  alter column is_active set default true,
  alter column is_active set not null,
  alter column starts_at set default now(),
  alter column starts_at set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.commerce_coupons enable row level security;

drop trigger if exists commerce_coupons_set_updated_at on public.commerce_coupons;
create trigger commerce_coupons_set_updated_at
before update on public.commerce_coupons
for each row execute function public.set_updated_at();

create index if not exists commerce_coupons_active_created_idx
on public.commerce_coupons(is_active, created_at desc);

drop policy if exists commerce_coupons_public_read_active on public.commerce_coupons;
create policy commerce_coupons_public_read_active
on public.commerce_coupons
for select
to anon, authenticated
using (
  is_active = true
  and starts_at <= now()
  and (expires_at is null or expires_at > now())
);

drop policy if exists commerce_coupons_admin_write on public.commerce_coupons;
create policy commerce_coupons_admin_write
on public.commerce_coupons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

alter table public.commerce_orders
  add column if not exists coupon_code text,
  add column if not exists discount_cents integer not null default 0;

create index if not exists commerce_orders_coupon_code_idx
on public.commerce_orders(coupon_code);

insert into public.commerce_coupons (
  code,
  description,
  percent_off,
  min_cents,
  max_discount_cents,
  is_active
)
values
  ('UAG10', '10% off on every checkout order.', 10, 0, null, true),
  ('SAVE15', '15% off on orders above Rs. 1,499, capped at Rs. 500.', 15, 149900, 50000, true),
  ('WELCOME20', '20% off on first upgrade orders above Rs. 2,499, capped at Rs. 800.', 20, 249900, 80000, true)
on conflict (code) do update set
  description = excluded.description,
  percent_off = excluded.percent_off,
  min_cents = excluded.min_cents,
  max_discount_cents = excluded.max_discount_cents,
  is_active = excluded.is_active,
  updated_at = now();

commit;
