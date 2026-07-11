-- ============================================
-- ProcureSource Platform - COMPLETE Migration
-- All Tables, RLS Policies, Indexes
-- Run this entire block in Supabase SQL Editor
-- ============================================
--
-- This is an idempotent migration: safe to re-run.
-- Uses CREATE TABLE IF NOT EXISTS and
-- DO $$ BEGIN ... EXCEPTION WHEN ... END $$; blocks.
--
-- Tables (21 total, in dependency order):
--   Level 0: profiles, product_categories
--   Level 1: suppliers, projects, rfqs, user_documents,
--            supplier_products, connection_requests, flagged_content
--   Level 2: rfq_items, quotes, project_documents, project_spec_matches,
--            project_suppliers, rfq_invitations, supplier_product_certifications
--   Level 3: quote_items, rfq_submissions
--   Level 4: contracts
--   Level 5: deliveries
--   Level 6: delivery_events
-- ============================================

BEGIN;

-- ============================================
-- LEVEL 0: No foreign-key dependencies
-- ============================================

-- 0A. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'purchase_manager',        -- 'supplier', 'purchase_manager', 'admin'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 0B. PRODUCT CATEGORIES
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

-- ============================================
-- LEVEL 1: Depends only on auth.users / profiles
-- ============================================

-- 1A. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  country TEXT,
  city TEXT,
  is_verified BOOLEAN DEFAULT false,
  certifications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view verified suppliers" ON suppliers
    FOR SELECT USING (is_verified = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can manage own record" ON suppliers
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can manage all suppliers" ON suppliers
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure certifications column exists (for re-runs)
DO $$ BEGIN
  ALTER TABLE suppliers ADD COLUMN certifications TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 1B. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  location TEXT,
  project_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',                -- 'active', 'completed', 'archived'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1C. RFQS (Request for Quotations)
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  metric_system TEXT DEFAULT 'Metric',         -- 'Metric', 'Imperial', 'Custom Engineering Units'
  unique_link TEXT UNIQUE,
  status TEXT DEFAULT 'open',                  -- 'open', 'awarded', 'closed'
  deadline TIMESTAMPTZ,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'public',            -- 'public', 'targeted'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Creators can manage own RFQs" ON rfqs
    FOR ALL USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view open RFQs" ON rfqs
    FOR SELECT USING (status = 'open' AND visibility = 'public');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTE: "Invited suppliers can view targeted RFQs" policy is created
-- after rfq_invitations table (see section 2F below)

-- Add project_id and visibility columns if they don't exist (for re-runs)
DO $$ BEGIN
  ALTER TABLE rfqs ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE rfqs ADD COLUMN visibility TEXT DEFAULT 'public';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 1D. USER DOCUMENTS (verification uploads)
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,                 -- 'trade_license', 'vat_certificate', 'spec'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  verified_at TIMESTAMPTZ,                     -- NULL = not verified
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own documents" ON user_documents
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can view all documents" ON user_documents
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can update documents" ON user_documents
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1E. SUPPLIER PRODUCTS
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
  availability TEXT DEFAULT 'in_stock',        -- 'in_stock', 'made_to_order', 'out_of_stock'
  service_regions TEXT[],
  status TEXT DEFAULT 'pending',               -- 'pending', 'approved', 'rejected'
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

-- 1F. CONNECTION REQUESTS
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  intent TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',               -- 'pending', 'accepted', 'declined'
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, supplier_id)
);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Requesters can manage own requests" ON connection_requests
    FOR ALL USING (auth.uid() = requester_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can view requests to them" ON connection_requests
    FOR SELECT USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can update requests to them" ON connection_requests
    FOR UPDATE USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1G. FLAGGED CONTENT (moderation)
CREATE TABLE IF NOT EXISTS flagged_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,                  -- 'supplier_product', 'supplier_profile', 'rfq'
  content_id UUID NOT NULL,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,                        -- 'inappropriate','spam','misleading','offensive','other'
  description TEXT,
  status TEXT DEFAULT 'pending',               -- 'pending', 'dismissed', 'action_taken'
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

-- ============================================
-- LEVEL 2: Depends on Level 1 tables
-- ============================================

-- 2A. RFQ ITEMS
CREATE TABLE IF NOT EXISTS rfq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  metric_spec TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "RFQ creators can manage items" ON rfq_items
    FOR ALL USING (
      EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_items.rfq_id AND rfqs.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view items of open RFQs" ON rfq_items
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM rfqs
        WHERE rfqs.id = rfq_items.rfq_id
        AND rfqs.status = 'open'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2B. QUOTES
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  quote_number TEXT,
  total_amount NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  lead_time TEXT,
  valid_until TIMESTAMPTZ,
  notes TEXT,
  status TEXT DEFAULT 'submitted',             -- 'submitted', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Suppliers can manage own quotes" ON quotes
    FOR ALL USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "RFQ creators can view quotes" ON quotes
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = quotes.rfq_id AND rfqs.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2C. PROJECT DOCUMENTS
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Project owners can manage docs" ON project_documents
    FOR ALL USING (
      EXISTS (SELECT 1 FROM projects WHERE projects.id = project_documents.project_id AND projects.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2D. PROJECT SPEC MATCHES
CREATE TABLE IF NOT EXISTS project_spec_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  spec_text TEXT,
  match_results JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_spec_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Project owners can manage matches" ON project_spec_matches
    FOR ALL USING (
      EXISTS (SELECT 1 FROM projects WHERE projects.id = project_spec_matches.project_id AND projects.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2E. PROJECT SUPPLIERS (shortlisted suppliers per project)
CREATE TABLE IF NOT EXISTS project_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  source TEXT DEFAULT 'manual',                -- 'manual', 'ai_matched'
  status TEXT DEFAULT 'shortlisted',           -- 'shortlisted', 'invited', 'removed'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, supplier_id)
);

ALTER TABLE project_suppliers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Project owners can manage suppliers" ON project_suppliers
    FOR ALL USING (
      EXISTS (SELECT 1 FROM projects WHERE projects.id = project_suppliers.project_id AND projects.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2F. RFQ INVITATIONS (targeted RFQ distribution)
CREATE TABLE IF NOT EXISTS rfq_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',               -- 'pending', 'viewed', 'accepted', 'declined'
  invited_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  UNIQUE(rfq_id, supplier_id)
);

ALTER TABLE rfq_invitations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "PMs can manage invitations for own RFQs" ON rfq_invitations
    FOR ALL USING (
      EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_invitations.rfq_id AND rfqs.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can view own invitations" ON rfq_invitations
    FOR SELECT USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can update own invitations" ON rfq_invitations
    FOR UPDATE USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Deferred RFQ policy: now that rfq_invitations exists, create the cross-table policy
DO $$ BEGIN
  CREATE POLICY "Invited suppliers can view targeted RFQs" ON rfqs
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM rfq_invitations
        WHERE rfq_invitations.rfq_id = rfqs.id
        AND rfq_invitations.supplier_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2G. SUPPLIER PRODUCT CERTIFICATIONS
CREATE TABLE IF NOT EXISTS supplier_product_certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,            -- 'AHRI', 'UL', 'FM', 'ISO_9001', 'ISO_14001', 'OHSAS_18001'
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

-- ============================================
-- LEVEL 3: Depends on Level 2 tables
-- ============================================

-- 3A. QUOTE ITEMS
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC(14,2),
  total_price NUMERIC(14,2),
  metric_spec TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Quote owners can manage items" ON quote_items
    FOR ALL USING (
      EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.supplier_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "RFQ creators can view quote items" ON quote_items
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM quotes
        JOIN rfqs ON rfqs.id = quotes.rfq_id
        WHERE quotes.id = quote_items.quote_id
        AND rfqs.creator_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3B. RFQ SUBMISSIONS
CREATE TABLE IF NOT EXISTS rfq_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  quote_data JSONB,                            -- cached quote data snapshot
  status TEXT DEFAULT 'pending',               -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rfq_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Suppliers can manage own submissions" ON rfq_submissions
    FOR ALL USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "RFQ creators can view submissions" ON rfq_submissions
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_submissions.rfq_id AND rfqs.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "RFQ creators can update submissions" ON rfq_submissions
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_submissions.rfq_id AND rfqs.creator_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- LEVEL 4: Depends on Level 3 tables
-- ============================================

-- 4A. CONTRACTS
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id),
  rfq_submission_id UUID NOT NULL REFERENCES rfq_submissions(id),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  pm_id UUID NOT NULL REFERENCES auth.users(id),
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  total_value NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  terms TEXT,
  payment_terms TEXT,
  delivery_deadline DATE,
  status TEXT DEFAULT 'awarded',               -- 'awarded', 'signed', 'in_progress', 'completed', 'cancelled'
  awarded_at TIMESTAMPTZ DEFAULT now(),
  signed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "PMs can manage own contracts" ON contracts
    FOR ALL USING (auth.uid() = pm_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can view own contracts" ON contracts
    FOR SELECT USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can update own contracts" ON contracts
    FOR UPDATE USING (auth.uid() = supplier_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- LEVEL 5: Depends on Level 4 tables
-- ============================================

-- 5A. DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',               -- 'pending', 'shipped', 'in_transit', 'delivered', 'confirmed'
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  tracking_number TEXT,
  shipping_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Contract parties can view delivery" ON deliveries
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM contracts
        WHERE contracts.id = deliveries.contract_id
        AND (contracts.pm_id = auth.uid() OR contracts.supplier_id = auth.uid())
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Suppliers can manage delivery" ON deliveries
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM contracts
        WHERE contracts.id = deliveries.contract_id
        AND contracts.supplier_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- LEVEL 6: Depends on Level 5 tables
-- ============================================

-- 6A. DELIVERY EVENTS (timeline/history)
CREATE TABLE IF NOT EXISTS delivery_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                    -- 'status_change', 'note', 'document'
  title TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE delivery_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Contract parties can view events" ON delivery_events
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM deliveries
        JOIN contracts ON contracts.id = deliveries.contract_id
        WHERE deliveries.id = delivery_events.delivery_id
        AND (contracts.pm_id = auth.uid() OR contracts.supplier_id = auth.uid())
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Contract parties can create events" ON delivery_events
    FOR INSERT WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_verified ON suppliers(is_verified);
CREATE INDEX IF NOT EXISTS idx_rfqs_creator_id ON rfqs(creator_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_unique_link ON rfqs(unique_link);
CREATE INDEX IF NOT EXISTS idx_rfqs_project_id ON rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_rfq_id ON quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_id ON quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_rfq_submissions_rfq_id ON rfq_submissions(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_submissions_supplier_id ON rfq_submissions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfq_invitations_rfq_id ON rfq_invitations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_invitations_supplier_id ON rfq_invitations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_pm_id ON contracts(pm_id);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier_id ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_rfq_id ON contracts(rfq_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_contract_id ON deliveries(contract_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_delivery_id ON delivery_events(delivery_id);
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_suppliers_project_id ON project_suppliers(project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_status ON supplier_products(status);
CREATE INDEX IF NOT EXISTS idx_supplier_product_certs_product_id ON supplier_product_certifications(supplier_product_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_supplier_id ON connection_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_status ON flagged_content(status);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'purchase_manager')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS (idempotent)
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('certifications', 'certifications', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload docs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read docs" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Storage policies for certifications bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload certs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'certifications' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read certs" ON storage.objects
    FOR SELECT USING (bucket_id = 'certifications');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Storage policies for project-files bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload project files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read project files" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-files');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;

-- ============================================
-- DONE! All 21 tables created with RLS policies,
-- indexes, storage buckets, and signup trigger.
-- ============================================
