-- ============================================
-- ProcureSource: Complete Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- PHASE 1: Project System
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  location TEXT,
  project_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_spec_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  spec_text TEXT,
  match_results JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'shortlisted',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, supplier_id)
);

-- Add project_id to rfqs
DO $$ BEGIN
  ALTER TABLE rfqs ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = creator_id);

-- RLS for project_documents
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Project owners can manage docs" ON project_documents;
CREATE POLICY "Project owners can manage docs" ON project_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_documents.project_id AND projects.creator_id = auth.uid()));

-- RLS for project_spec_matches
ALTER TABLE project_spec_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Project owners can manage matches" ON project_spec_matches;
CREATE POLICY "Project owners can manage matches" ON project_spec_matches FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_spec_matches.project_id AND projects.creator_id = auth.uid()));

-- RLS for project_suppliers
ALTER TABLE project_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Project owners can manage suppliers" ON project_suppliers;
CREATE POLICY "Project owners can manage suppliers" ON project_suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_suppliers.project_id AND projects.creator_id = auth.uid()));

-- ============================================
-- PHASE 2: Supplier Product Management
-- ============================================

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
DROP POLICY IF EXISTS "Suppliers can manage own products" ON supplier_products;
CREATE POLICY "Suppliers can manage own products" ON supplier_products FOR ALL USING (auth.uid() = supplier_id);
DROP POLICY IF EXISTS "Anyone can view approved products" ON supplier_products;
CREATE POLICY "Anyone can view approved products" ON supplier_products FOR SELECT USING (status = 'approved');

-- ============================================
-- PHASE 3: Targeted RFQ Sending
-- ============================================

CREATE TABLE IF NOT EXISTS rfq_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  invited_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  UNIQUE(rfq_id, supplier_id)
);

-- Add visibility to rfqs
DO $$ BEGIN
  ALTER TABLE rfqs ADD COLUMN visibility TEXT DEFAULT 'public';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE rfq_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "PMs can manage invitations for own RFQs" ON rfq_invitations;
CREATE POLICY "PMs can manage invitations for own RFQs" ON rfq_invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_invitations.rfq_id AND rfqs.creator_id = auth.uid()));
DROP POLICY IF EXISTS "Suppliers can view own invitations" ON rfq_invitations;
CREATE POLICY "Suppliers can view own invitations" ON rfq_invitations FOR SELECT
  USING (auth.uid() = supplier_id);
DROP POLICY IF EXISTS "Suppliers can update own invitations" ON rfq_invitations;
CREATE POLICY "Suppliers can update own invitations" ON rfq_invitations FOR UPDATE
  USING (auth.uid() = supplier_id);

-- ============================================
-- PHASE 4: Request Connection
-- ============================================

CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  supplier_id UUID NOT NULL REFERENCES auth.users(id),
  intent TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, supplier_id)
);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Requesters can manage own requests" ON connection_requests;
CREATE POLICY "Requesters can manage own requests" ON connection_requests FOR ALL USING (auth.uid() = requester_id);
DROP POLICY IF EXISTS "Suppliers can view requests to them" ON connection_requests;
CREATE POLICY "Suppliers can view requests to them" ON connection_requests FOR SELECT USING (auth.uid() = supplier_id);
DROP POLICY IF EXISTS "Suppliers can update requests to them" ON connection_requests;
CREATE POLICY "Suppliers can update requests to them" ON connection_requests FOR UPDATE USING (auth.uid() = supplier_id);

-- ============================================
-- PHASE 5: Contract Award Workflow
-- ============================================

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
  status TEXT DEFAULT 'awarded',
  awarded_at TIMESTAMPTZ DEFAULT now(),
  signed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "PMs can manage own contracts" ON contracts;
CREATE POLICY "PMs can manage own contracts" ON contracts FOR ALL USING (auth.uid() = pm_id);
DROP POLICY IF EXISTS "Suppliers can view own contracts" ON contracts;
CREATE POLICY "Suppliers can view own contracts" ON contracts FOR SELECT USING (auth.uid() = supplier_id);
DROP POLICY IF EXISTS "Suppliers can update own contracts" ON contracts;
CREATE POLICY "Suppliers can update own contracts" ON contracts FOR UPDATE USING (auth.uid() = supplier_id);

-- ============================================
-- PHASE 6: Delivery Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  tracking_number TEXT,
  shipping_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contract parties can view delivery" ON deliveries;
CREATE POLICY "Contract parties can view delivery" ON deliveries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = deliveries.contract_id
    AND (contracts.pm_id = auth.uid() OR contracts.supplier_id = auth.uid())
  ));
DROP POLICY IF EXISTS "Suppliers can manage delivery" ON deliveries;
CREATE POLICY "Suppliers can manage delivery" ON deliveries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = deliveries.contract_id
    AND contracts.supplier_id = auth.uid()
  ));

ALTER TABLE delivery_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contract parties can view events" ON delivery_events;
CREATE POLICY "Contract parties can view events" ON delivery_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deliveries
    JOIN contracts ON contracts.id = deliveries.contract_id
    WHERE deliveries.id = delivery_events.delivery_id
    AND (contracts.pm_id = auth.uid() OR contracts.supplier_id = auth.uid())
  ));
DROP POLICY IF EXISTS "Contract parties can create events" ON delivery_events;
CREATE POLICY "Contract parties can create events" ON delivery_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);
