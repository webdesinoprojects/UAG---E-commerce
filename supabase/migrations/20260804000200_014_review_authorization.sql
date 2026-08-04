begin;

drop policy if exists commerce_product_reviews_customer_insert on public.commerce_product_reviews;
create policy commerce_product_reviews_customer_insert
on public.commerce_product_reviews
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1
    from public.commerce_orders orders
    join public.commerce_order_items items on items.order_id = orders.id
    where orders.id = order_id
      and orders.customer_id = auth.uid()
      and orders.status = 'delivered'
      and items.product_id = product_id
  )
);

commit;
