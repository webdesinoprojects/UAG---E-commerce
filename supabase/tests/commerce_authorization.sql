begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(7);

select extensions.ok(
  not has_function_privilege('authenticated', 'public.mark_commerce_razorpay_paid(uuid,text,text,jsonb)', 'EXECUTE'),
  'customers cannot mark payment state'
);
select extensions.ok(
  not has_function_privilege('authenticated', 'public.update_commerce_order_status(uuid,public.commerce_order_status,uuid,text,text)', 'EXECUTE'),
  'customers cannot change arbitrary order state'
);
select extensions.ok(
  not has_function_privilege('authenticated', 'public.cancel_commerce_order(uuid,uuid,uuid,text,text)', 'EXECUTE'),
  'customers cannot invoke privileged cancellation'
);
select extensions.ok(
  has_function_privilege('authenticated', 'public.cancel_own_commerce_order(uuid,text)', 'EXECUTE'),
  'customers can invoke the ownership-checked cancellation entry point'
);
select extensions.ok(
  position('auth.uid()' in pg_get_functiondef('public.cancel_own_commerce_order(uuid,text)'::regprocedure)) > 0,
  'customer identity is derived from the authenticated database session'
);
select extensions.ok(
  position('customer_id = auth.uid()' in pg_get_functiondef('public.cancel_own_commerce_order(uuid,text)'::regprocedure)) > 0,
  'customer cancellation enforces order ownership in the database'
);
select extensions.ok(
  position('orders.customer_id = auth.uid()' in pg_get_expr((select polwithcheck from pg_policy where polname = 'commerce_product_reviews_customer_insert'), (select oid from pg_class where relname = 'commerce_product_reviews'))) > 0,
  'review insertion enforces delivered-order ownership in the database'
);

select * from extensions.finish();
rollback;
