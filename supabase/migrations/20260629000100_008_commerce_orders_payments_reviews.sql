begin;

do $$
begin
  create type public.commerce_order_status as enum (
    'pending_payment',
    'booked',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'payment_failed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.commerce_payment_status as enum (
    'pending',
    'paid',
    'failed',
    'cod'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.commerce_payment_method as enum ('cod', 'razorpay');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.commerce_review_status as enum (
    'pending',
    'published',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.commerce_customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'IN',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_customer_addresses_phone_check check (length(phone) between 7 and 20),
  constraint commerce_customer_addresses_postal_code_check check (postal_code ~ '^[A-Za-z0-9 -]{3,12}$')
);

alter table public.commerce_customer_addresses enable row level security;

drop trigger if exists commerce_customer_addresses_set_updated_at on public.commerce_customer_addresses;
create trigger commerce_customer_addresses_set_updated_at
before update on public.commerce_customer_addresses
for each row execute function public.set_updated_at();

drop policy if exists commerce_customer_addresses_select_self_or_admin on public.commerce_customer_addresses;
create policy commerce_customer_addresses_select_self_or_admin
on public.commerce_customer_addresses
for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists commerce_customer_addresses_write_self_or_admin on public.commerce_customer_addresses;
create policy commerce_customer_addresses_write_self_or_admin
on public.commerce_customer_addresses
for all
to authenticated
using (customer_id = auth.uid() or public.is_admin())
with check (customer_id = auth.uid() or public.is_admin());

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('UAG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  status public.commerce_order_status not null default 'pending_payment',
  payment_status public.commerce_payment_status not null default 'pending',
  payment_method public.commerce_payment_method not null default 'cod',
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'INR',
  razorpay_order_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_orders_money_nonnegative check (
    subtotal_cents >= 0 and shipping_cents >= 0 and total_cents >= 0
  ),
  constraint commerce_orders_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint commerce_orders_shipping_address_object check (jsonb_typeof(shipping_address) = 'object')
);

alter table public.commerce_orders enable row level security;

create index if not exists commerce_orders_customer_created_idx
on public.commerce_orders(customer_id, created_at desc);

create index if not exists commerce_orders_razorpay_order_idx
on public.commerce_orders(razorpay_order_id);

drop trigger if exists commerce_orders_set_updated_at on public.commerce_orders;
create trigger commerce_orders_set_updated_at
before update on public.commerce_orders
for each row execute function public.set_updated_at();

drop policy if exists commerce_orders_select_self_or_admin on public.commerce_orders;
create policy commerce_orders_select_self_or_admin
on public.commerce_orders
for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists commerce_orders_admin_write on public.commerce_orders;
create policy commerce_orders_admin_write
on public.commerce_orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  product_id uuid references public.catalog_products(id) on delete set null,
  product_name text not null,
  product_slug text,
  sku text,
  image_url text,
  unit_price_cents integer not null,
  quantity integer not null,
  line_total_cents integer not null,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  constraint commerce_order_items_quantity_positive check (quantity > 0),
  constraint commerce_order_items_money_nonnegative check (unit_price_cents >= 0 and line_total_cents >= 0)
);

alter table public.commerce_order_items enable row level security;

create index if not exists commerce_order_items_order_idx
on public.commerce_order_items(order_id);

drop policy if exists commerce_order_items_select_self_or_admin on public.commerce_order_items;
create policy commerce_order_items_select_self_or_admin
on public.commerce_order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.commerce_orders
    where commerce_orders.id = commerce_order_items.order_id
      and (commerce_orders.customer_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists commerce_order_items_admin_write on public.commerce_order_items;
create policy commerce_order_items_admin_write
on public.commerce_order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.commerce_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  provider text not null,
  provider_order_id text,
  provider_payment_id text,
  status public.commerce_payment_status not null default 'pending',
  amount_cents integer not null,
  currency text not null default 'INR',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_payments_provider_check check (provider in ('cod', 'razorpay')),
  constraint commerce_payments_amount_nonnegative check (amount_cents >= 0),
  constraint commerce_payments_raw_payload_object check (jsonb_typeof(raw_payload) = 'object')
);

alter table public.commerce_payments enable row level security;

create index if not exists commerce_payments_provider_order_idx
on public.commerce_payments(provider, provider_order_id);

drop trigger if exists commerce_payments_set_updated_at on public.commerce_payments;
create trigger commerce_payments_set_updated_at
before update on public.commerce_payments
for each row execute function public.set_updated_at();

drop policy if exists commerce_payments_select_self_or_admin on public.commerce_payments;
create policy commerce_payments_select_self_or_admin
on public.commerce_payments
for select
to authenticated
using (
  exists (
    select 1
    from public.commerce_orders
    where commerce_orders.id = commerce_payments.order_id
      and (commerce_orders.customer_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists commerce_payments_admin_write on public.commerce_payments;
create policy commerce_payments_admin_write
on public.commerce_payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.commerce_product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  customer_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.commerce_orders(id) on delete set null,
  rating integer not null,
  title text,
  comment text not null,
  status public.commerce_review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_product_reviews_rating_check check (rating between 1 and 5)
);

alter table public.commerce_product_reviews enable row level security;

create index if not exists commerce_product_reviews_product_status_idx
on public.commerce_product_reviews(product_id, status, created_at desc);

drop trigger if exists commerce_product_reviews_set_updated_at on public.commerce_product_reviews;
create trigger commerce_product_reviews_set_updated_at
before update on public.commerce_product_reviews
for each row execute function public.set_updated_at();

drop policy if exists commerce_product_reviews_public_read_published on public.commerce_product_reviews;
create policy commerce_product_reviews_public_read_published
on public.commerce_product_reviews
for select
to anon, authenticated
using (status = 'published');

drop policy if exists commerce_product_reviews_customer_insert on public.commerce_product_reviews;
create policy commerce_product_reviews_customer_insert
on public.commerce_product_reviews
for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists commerce_product_reviews_admin_write on public.commerce_product_reviews;
create policy commerce_product_reviews_admin_write
on public.commerce_product_reviews
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.decrement_catalog_product_stock(
  product_id uuid,
  quantity integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if quantity <= 0 then
    raise exception 'Quantity must be positive.';
  end if;

  update public.catalog_products
  set stock_quantity = stock_quantity - quantity,
      updated_at = now()
  where id = product_id
    and stock_quantity >= quantity;

  if not found then
    raise exception 'Insufficient stock.';
  end if;
end;
$$;

grant execute on function public.decrement_catalog_product_stock(uuid, integer) to authenticated;

commit;
