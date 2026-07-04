begin;

do $$
begin
  create type public.commerce_service_request_type as enum ('return', 'replacement');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.commerce_service_request_status as enum (
    'requested',
    'approved',
    'pickup_scheduled',
    'received',
    'replacement_shipped',
    'refunded',
    'rejected',
    'cancelled',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.commerce_orders
  add column if not exists status_note text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists cancelled_at timestamptz;

create table if not exists public.commerce_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  event_type text not null,
  old_status public.commerce_order_status,
  new_status public.commerce_order_status,
  message text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint commerce_order_events_actor_role_check check (actor_role in ('customer', 'admin', 'system')),
  constraint commerce_order_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

alter table public.commerce_order_events enable row level security;

create index if not exists commerce_order_events_order_created_idx
on public.commerce_order_events(order_id, created_at desc);

drop policy if exists commerce_order_events_select_self_or_admin on public.commerce_order_events;
create policy commerce_order_events_select_self_or_admin
on public.commerce_order_events
for select
to authenticated
using (
  exists (
    select 1
    from public.commerce_orders
    where commerce_orders.id = commerce_order_events.order_id
      and (commerce_orders.customer_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists commerce_order_events_admin_write on public.commerce_order_events;
create policy commerce_order_events_admin_write
on public.commerce_order_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.commerce_service_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default ('UAGR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  order_item_id uuid references public.commerce_order_items(id) on delete set null,
  customer_id uuid references auth.users(id) on delete set null,
  request_type public.commerce_service_request_type not null,
  status public.commerce_service_request_status not null default 'requested',
  quantity integer not null default 1,
  reason text not null,
  details text,
  customer_note text,
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_service_requests_quantity_positive check (quantity > 0),
  constraint commerce_service_requests_reason_length check (length(trim(reason)) >= 3)
);

alter table public.commerce_service_requests enable row level security;

drop trigger if exists commerce_service_requests_set_updated_at on public.commerce_service_requests;
create trigger commerce_service_requests_set_updated_at
before update on public.commerce_service_requests
for each row execute function public.set_updated_at();

create index if not exists commerce_service_requests_order_created_idx
on public.commerce_service_requests(order_id, created_at desc);

create index if not exists commerce_service_requests_customer_created_idx
on public.commerce_service_requests(customer_id, created_at desc);

drop policy if exists commerce_service_requests_select_self_or_admin on public.commerce_service_requests;
create policy commerce_service_requests_select_self_or_admin
on public.commerce_service_requests
for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists commerce_service_requests_customer_insert on public.commerce_service_requests;
create policy commerce_service_requests_customer_insert
on public.commerce_service_requests
for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists commerce_service_requests_admin_write on public.commerce_service_requests;
create policy commerce_service_requests_admin_write
on public.commerce_service_requests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.create_commerce_checkout_order(
  p_customer_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_payment_method public.commerce_payment_method,
  p_items jsonb,
  p_coupon_code text default null,
  p_notes text default null,
  p_currency text default 'INR',
  p_save_address boolean default false
)
returns table (
  order_id uuid,
  order_number text,
  subtotal_cents integer,
  shipping_cents integer,
  discount_cents integer,
  total_cents integer,
  currency text,
  payment_method text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_coupon_code text := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
  v_discount_cents integer := 0;
  v_expected_count integer := 0;
  v_found_count integer := 0;
  v_item record;
  v_order_id uuid;
  v_order_number text;
  v_order_status public.commerce_order_status;
  v_payment_status public.commerce_payment_status;
  v_shipping_cents integer := 0;
  v_subtotal_cents integer := 0;
  v_total_cents integer := 0;
  v_image_url text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  if p_shipping_address is null or jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'Shipping address is required.';
  end if;

  if p_customer_email is null or trim(p_customer_email) = '' then
    raise exception 'Customer email is required.';
  end if;

  select count(*)
  into v_expected_count
  from (
    select distinct product_id
    from jsonb_to_recordset(p_items) as requested(product_id uuid, quantity integer)
    where product_id is not null and quantity > 0
  ) expected;

  if v_expected_count = 0 then
    raise exception 'Your cart is empty.';
  end if;

  for v_item in
    with requested as (
      select product_id, sum(quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as requested(product_id uuid, quantity integer)
      where product_id is not null and quantity > 0
      group by product_id
    )
    select
      product.id,
      product.name,
      product.slug,
      product.sku,
      product.price_cents,
      product.currency,
      product.stock_quantity,
      requested.quantity
    from requested
    join public.catalog_products product on product.id = requested.product_id
    where product.status = 'active'
  loop
    v_found_count := v_found_count + 1;

    if v_item.stock_quantity < v_item.quantity then
      raise exception 'Insufficient stock for %.', v_item.name;
    end if;

    v_subtotal_cents := v_subtotal_cents + (v_item.price_cents * v_item.quantity);
  end loop;

  if v_found_count <> v_expected_count then
    raise exception 'One or more cart products are no longer available.';
  end if;

  if v_coupon_code is not null then
    select *
    into v_coupon
    from public.commerce_coupons
    where code = v_coupon_code
      and is_active = true
      and starts_at <= now()
      and (expires_at is null or expires_at > now())
    limit 1;

    if not found then
      raise exception 'Coupon is not valid.';
    end if;

    if v_subtotal_cents < v_coupon.min_cents then
      raise exception 'Coupon minimum order amount is not met.';
    end if;

    v_discount_cents := round((v_coupon.percent_off::numeric / 100) * v_subtotal_cents)::integer;

    if v_coupon.max_discount_cents is not null then
      v_discount_cents := least(v_discount_cents, v_coupon.max_discount_cents);
    end if;
  end if;

  v_total_cents := greatest(v_subtotal_cents + v_shipping_cents - v_discount_cents, 0);
  v_order_status := case when p_payment_method = 'cod' then 'booked'::public.commerce_order_status else 'pending_payment'::public.commerce_order_status end;
  v_payment_status := case when p_payment_method = 'cod' then 'cod'::public.commerce_payment_status else 'pending'::public.commerce_payment_status end;

  insert into public.commerce_orders (
    customer_id,
    customer_email,
    customer_name,
    customer_phone,
    shipping_address,
    status,
    payment_status,
    payment_method,
    subtotal_cents,
    shipping_cents,
    discount_cents,
    total_cents,
    currency,
    coupon_code,
    notes
  )
  values (
    p_customer_id,
    trim(p_customer_email),
    trim(p_customer_name),
    trim(p_customer_phone),
    p_shipping_address,
    v_order_status,
    v_payment_status,
    p_payment_method,
    v_subtotal_cents,
    v_shipping_cents,
    v_discount_cents,
    v_total_cents,
    p_currency,
    v_coupon_code,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id, commerce_orders.order_number
  into v_order_id, v_order_number;

  for v_item in
    with requested as (
      select product_id, sum(quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as requested(product_id uuid, quantity integer)
      where product_id is not null and quantity > 0
      group by product_id
    )
    select
      product.id,
      product.name,
      product.slug,
      product.sku,
      product.price_cents,
      product.currency,
      requested.quantity
    from requested
    join public.catalog_products product on product.id = requested.product_id
    where product.status = 'active'
  loop
    select asset.url
    into v_image_url
    from public.catalog_product_media media
    join public.media_assets asset on asset.id = media.media_asset_id
    where media.product_id = v_item.id
      and media.placement = 'thumbnail'
      and media.is_enabled = true
      and media.is_primary = true
      and asset.is_public = true
    order by media.sort_order asc, media.created_at asc
    limit 1;

    insert into public.commerce_order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      sku,
      image_url,
      unit_price_cents,
      quantity,
      line_total_cents,
      currency
    )
    values (
      v_order_id,
      v_item.id,
      v_item.name,
      v_item.slug,
      v_item.sku,
      v_image_url,
      v_item.price_cents,
      v_item.quantity,
      v_item.price_cents * v_item.quantity,
      v_item.currency
    );

    if p_payment_method = 'cod' then
      update public.catalog_products
      set stock_quantity = stock_quantity - v_item.quantity,
          updated_at = now()
      where id = v_item.id
        and stock_quantity >= v_item.quantity;

      if not found then
        raise exception 'Insufficient stock for %.', v_item.name;
      end if;
    end if;
  end loop;

  insert into public.commerce_payments (
    order_id,
    provider,
    status,
    amount_cents,
    currency
  )
  values (
    v_order_id,
    p_payment_method::text,
    v_payment_status,
    v_total_cents,
    p_currency
  );

  insert into public.commerce_order_events (
    order_id,
    event_type,
    new_status,
    message,
    actor_id,
    actor_role
  )
  values (
    v_order_id,
    'created',
    v_order_status,
    case when p_payment_method = 'cod' then 'COD order booked.' else 'Online payment order created.' end,
    p_customer_id,
    case when p_customer_id is null then 'system' else 'customer' end
  );

  if p_save_address and p_customer_id is not null then
    update public.commerce_customer_addresses
    set is_default = false,
        updated_at = now()
    where customer_id = p_customer_id
      and is_default = true;

    insert into public.commerce_customer_addresses (
      customer_id,
      full_name,
      phone,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      is_default
    )
    values (
      p_customer_id,
      coalesce(p_shipping_address ->> 'fullName', p_customer_name),
      coalesce(p_shipping_address ->> 'phone', p_customer_phone),
      coalesce(p_shipping_address ->> 'line1', ''),
      nullif(p_shipping_address ->> 'line2', ''),
      coalesce(p_shipping_address ->> 'city', ''),
      coalesce(p_shipping_address ->> 'state', ''),
      coalesce(p_shipping_address ->> 'postalCode', ''),
      coalesce(p_shipping_address ->> 'country', 'IN'),
      true
    );
  end if;

  order_id := v_order_id;
  order_number := v_order_number;
  subtotal_cents := v_subtotal_cents;
  shipping_cents := v_shipping_cents;
  discount_cents := v_discount_cents;
  total_cents := v_total_cents;
  currency := p_currency;
  payment_method := p_payment_method::text;
  return next;
end;
$$;

create or replace function public.mark_commerce_razorpay_paid(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_raw_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
begin
  select *
  into v_order
  from public.commerce_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if v_order.payment_method <> 'razorpay' then
    raise exception 'Order is not a Razorpay order.';
  end if;

  if v_order.razorpay_order_id is distinct from p_razorpay_order_id then
    raise exception 'Payment order mismatch.';
  end if;

  if v_order.payment_status = 'paid' then
    return;
  end if;

  for v_item in
    select *
    from public.commerce_order_items
    where order_id = p_order_id
  loop
    if v_item.product_id is not null then
      update public.catalog_products
      set stock_quantity = stock_quantity - v_item.quantity,
          updated_at = now()
      where id = v_item.product_id
        and stock_quantity >= v_item.quantity;

      if not found then
        raise exception 'Insufficient stock for %.', v_item.product_name;
      end if;
    end if;
  end loop;

  update public.commerce_orders
  set status = 'booked',
      payment_status = 'paid',
      updated_at = now()
  where id = p_order_id;

  update public.commerce_payments
  set provider_payment_id = p_razorpay_payment_id,
      status = 'paid',
      raw_payload = coalesce(p_raw_payload, '{}'::jsonb),
      updated_at = now()
  where order_id = p_order_id
    and provider = 'razorpay';

  if not found then
    insert into public.commerce_payments (
      order_id,
      provider,
      provider_order_id,
      provider_payment_id,
      status,
      amount_cents,
      currency,
      raw_payload
    )
    values (
      p_order_id,
      'razorpay',
      p_razorpay_order_id,
      p_razorpay_payment_id,
      'paid',
      v_order.total_cents,
      v_order.currency,
      coalesce(p_raw_payload, '{}'::jsonb)
    );
  end if;

  insert into public.commerce_order_events (
    order_id,
    event_type,
    old_status,
    new_status,
    message,
    actor_role,
    metadata
  )
  values (
    p_order_id,
    'paid',
    v_order.status,
    'booked',
    'Razorpay payment verified.',
    'system',
    jsonb_build_object('razorpayPaymentId', p_razorpay_payment_id)
  );
end;
$$;

create or replace function public.cancel_commerce_order(
  p_order_id uuid,
  p_customer_id uuid default null,
  p_actor_id uuid default null,
  p_actor_role text default 'system',
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
begin
  select *
  into v_order
  from public.commerce_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if p_customer_id is not null and v_order.customer_id is distinct from p_customer_id then
    raise exception 'Order not found.';
  end if;

  if v_order.status = 'cancelled' then
    return;
  end if;

  if v_order.status in ('shipped', 'delivered') and p_actor_role <> 'admin' then
    raise exception 'This order can no longer be cancelled online.';
  end if;

  if v_order.status = 'delivered' then
    raise exception 'Delivered orders cannot be cancelled.';
  end if;

  if v_order.status in ('booked', 'processing') and v_order.payment_status in ('cod', 'paid') then
    for v_item in
      select *
      from public.commerce_order_items
      where order_id = p_order_id
    loop
      if v_item.product_id is not null then
        update public.catalog_products
        set stock_quantity = stock_quantity + v_item.quantity,
            updated_at = now()
        where id = v_item.product_id;
      end if;
    end loop;
  end if;

  update public.commerce_orders
  set status = 'cancelled',
      status_note = nullif(trim(coalesce(p_reason, '')), ''),
      cancelled_at = now(),
      updated_at = now()
  where id = p_order_id;

  insert into public.commerce_order_events (
    order_id,
    event_type,
    old_status,
    new_status,
    message,
    actor_id,
    actor_role
  )
  values (
    p_order_id,
    'cancelled',
    v_order.status,
    'cancelled',
    coalesce(nullif(trim(coalesce(p_reason, '')), ''), 'Order cancelled.'),
    p_actor_id,
    case when p_actor_role in ('customer', 'admin', 'system') then p_actor_role else 'system' end
  );
end;
$$;

create or replace function public.update_commerce_order_status(
  p_order_id uuid,
  p_status public.commerce_order_status,
  p_actor_id uuid default null,
  p_note text default null,
  p_tracking_number text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
begin
  if p_status = 'cancelled' then
    perform public.cancel_commerce_order(
      p_order_id,
      null,
      p_actor_id,
      'admin',
      p_note
    );
    return;
  end if;

  select *
  into v_order
  from public.commerce_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Cancelled orders cannot be moved to another status.';
  end if;

  update public.commerce_orders
  set status = p_status,
      status_note = nullif(trim(coalesce(p_note, '')), ''),
      tracking_number = coalesce(nullif(trim(coalesce(p_tracking_number, '')), ''), tracking_number),
      shipped_at = case when p_status = 'shipped' and shipped_at is null then now() else shipped_at end,
      delivered_at = case when p_status = 'delivered' and delivered_at is null then now() else delivered_at end,
      updated_at = now()
  where id = p_order_id;

  insert into public.commerce_order_events (
    order_id,
    event_type,
    old_status,
    new_status,
    message,
    actor_id,
    actor_role,
    metadata
  )
  values (
    p_order_id,
    'status_changed',
    v_order.status,
    p_status,
    coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Order status updated.'),
    p_actor_id,
    'admin',
    jsonb_build_object('trackingNumber', nullif(trim(coalesce(p_tracking_number, '')), ''))
  );
end;
$$;

grant execute on function public.create_commerce_checkout_order(
  uuid,
  text,
  text,
  text,
  jsonb,
  public.commerce_payment_method,
  jsonb,
  text,
  text,
  text,
  boolean
) to authenticated, service_role;

grant execute on function public.mark_commerce_razorpay_paid(uuid, text, text, jsonb) to authenticated, service_role;
grant execute on function public.cancel_commerce_order(uuid, uuid, uuid, text, text) to authenticated, service_role;
grant execute on function public.update_commerce_order_status(uuid, public.commerce_order_status, uuid, text, text) to authenticated, service_role;

commit;
