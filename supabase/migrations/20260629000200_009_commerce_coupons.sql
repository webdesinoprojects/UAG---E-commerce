-- Coupons table for UAG E-Commerce
CREATE TABLE IF NOT EXISTS public.commerce_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  percent_off NUMERIC(5,2) NOT NULL CHECK (percent_off >= 0 AND percent_off <= 100),
  min_cents NUMERIC(10,2) DEFAULT 0 CHECK (min_cents >= 0),
  max_discount_cents NUMERIC(10,2) CHECK (max_discount_cents >= 0),
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.commerce_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on active coupons" ON public.commerce_coupons;
CREATE POLICY "Allow public read on active coupons"
ON public.commerce_coupons
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

DROP POLICY IF EXISTS "Allow service role full access on coupons" ON public.commerce_coupons;
CREATE POLICY "Allow service role full access on coupons"
ON public.commerce_coupons
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
