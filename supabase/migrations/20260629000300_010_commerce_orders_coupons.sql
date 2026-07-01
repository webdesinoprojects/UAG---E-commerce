-- Add coupon tracking to orders table
ALTER TABLE public.commerce_orders
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_commerce_orders_coupon_code
ON public.commerce_orders(coupon_code);
