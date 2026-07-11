-- ============================================
-- ProcureSource Platform - Migration V2
-- Complete Workflow Features
-- Run this entire block in Supabase SQL Editor
-- ============================================

BEGIN;

-- 0. Ensure supplier_products exists (required by certifications FK)
CREATE TABLE IF NOT EXISTS supplier_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  model_number TEXT,
  description TEXT,
  technical_specs JSONB,
  price_range_min NUMERIC(12,2),
  price_range_max NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  availability TEXT DEFAULT 'in_stock',
  service_regions TEXT[],
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Suppliers can manage own products" ON supplier_products
    FOR ALL USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view approved products" ON supplier_products
    FOR SELECT USING (status = 'approved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. Flagged Content / Content Moderation
CREATE TABLE IF NOT EXISTS flagged_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(content_type, content_id, flagged_by)
);

ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can flag content" ON flagged_content
    FOR INSERT WITH CHECK (auth.uid() = flagged_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own flags" ON flagged_content
    FOR SELECT USING (auth.uid() = flagged_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Supplier Product Certifications
CREATE TABLE IF NOT EXISTS supplier_product_certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  certificate_number TEXT,
  file_url TEXT,
  file_name TEXT,
  issued_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE supplier_product_certifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Suppliers manage own certs" ON supplier_product_certifications
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM supplier_products
        WHERE supplier_products.id = supplier_product_certifications.supplier_product_id
        AND supplier_products.supplier_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public view approved certs" ON supplier_product_certifications
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM supplier_products
        WHERE supplier_products.id = supplier_product_certifications.supplier_product_id
        AND supplier_products.status = 'approved'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Supplier-level certifications column
DO $$ BEGIN
  ALTER TABLE suppliers ADD COLUMN certifications TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 4. Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
