-- ============================================
-- ProcureSource - Seed: Product Certification Data
-- Run after supabase-migration-complete.sql
-- ============================================

BEGIN;

-- ============================================
-- 1. Extend supplier_product_certifications
--    with additional columns for this dataset
-- ============================================

DO $$ BEGIN
  ALTER TABLE supplier_product_certifications ADD COLUMN standard_code TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE supplier_product_certifications ADD COLUMN issuing_authority TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE supplier_product_certifications ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE supplier_product_certifications ADD COLUMN applies_in TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE supplier_product_certifications ADD COLUMN notes TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- 2. Insert product categories
-- ============================================

INSERT INTO product_categories (id, name, slug, description, parent_id, display_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'HVAC', 'hvac', 'Heating, Ventilation & Air Conditioning', NULL, 1),
  ('a0000000-0000-0000-0000-000000000002', 'Insulation', 'insulation', 'HVAC Insulation Products', 'a0000000-0000-0000-0000-000000000001', 1)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. Insert supplier products
--    NOTE: Replace the supplier_id below with
--    your actual supplier user UUID from auth.users
-- ============================================

DO $$
DECLARE
  -- Gulf-O-Flex products owned by Century Mechanical (from supabase-seed-suppliers.sql)
  v_gof_supplier UUID := 'c0000000-0000-0000-0001-000000000001';
  -- World-Flex products owned by Kaffaa Al Taqa (from supabase-seed-suppliers.sql)
  v_wf_supplier  UUID := 'c0000000-0000-0000-0002-000000000001';
  v_prod1 UUID := 'b0000000-0000-0000-0000-000000000001';
  v_prod2 UUID := 'b0000000-0000-0000-0000-000000000002';
  v_prod3 UUID := 'b0000000-0000-0000-0000-000000000003';
  v_prod4 UUID := 'b0000000-0000-0000-0000-000000000004';
BEGIN

  -- Product 1: Gulf-O-Flex — Pipe Insulation (NBR Elastomeric)
  INSERT INTO supplier_products (id, supplier_id, name, slug, brand, category, description, status)
  VALUES (
    v_prod1, v_gof_supplier,
    'Pipe Insulation (NBR Elastomeric)', 'pipe-insulation-nbr-elastomeric',
    'Gulf-O-Flex', 'Insulation',
    'NBR Elastomeric pipe insulation for HVAC systems. FSI ≤25 & SDI ≤50 compliant.',
    'approved'
  ) ON CONFLICT (id) DO NOTHING;

  -- Product 2: Gulf-O-Flex Ultra — Pipe & Duct Insulation (NBR)
  INSERT INTO supplier_products (id, supplier_id, name, slug, brand, category, description, status)
  VALUES (
    v_prod2, v_gof_supplier,
    'Pipe & Duct Insulation (NBR)', 'pipe-duct-insulation-nbr',
    'Gulf-O-Flex Ultra', 'Insulation',
    'NBR pipe and duct insulation covering tubes & sheets for HVAC applications.',
    'approved'
  ) ON CONFLICT (id) DO NOTHING;

  -- Product 3: Gulf-O-Flex XLPE — XLPE Pipe & Duct Insulation
  INSERT INTO supplier_products (id, supplier_id, name, slug, brand, category, description, status)
  VALUES (
    v_prod3, v_gof_supplier,
    'XLPE Pipe & Duct Insulation', 'xlpe-pipe-duct-insulation',
    'Gulf-O-Flex XLPE', 'Insulation',
    'Cross-linked polyethylene pipe and duct insulation. FSI ≤25 & SDI ≤50 compliant.',
    'approved'
  ) ON CONFLICT (id) DO NOTHING;

  -- Product 4: World-Flex — Plain Tube Insulation (NBR)
  INSERT INTO supplier_products (id, supplier_id, name, slug, brand, category, description, status)
  VALUES (
    v_prod4, v_wf_supplier,
    'Plain Tube Insulation (NBR)', 'plain-tube-insulation-nbr',
    'World-Flex', 'Insulation',
    'NBR plain tube insulation for HVAC systems.',
    'approved'
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 4. Insert certifications
  -- ============================================

  -- === Gulf-O-Flex — Pipe Insulation (NBR Elastomeric) ===

  INSERT INTO supplier_product_certifications
    (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
  VALUES
    (v_prod1, 'Fire Test Report', 'ASTM E84 / UL 723 / BS 476', 'Civil Defence Approved Lab', true, 'UAE', 'FSI ≤25 & SDI ≤50'),
    (v_prod1, 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'Certificate CL23020867'),
    (v_prod1, 'Civil Defence Approval', 'UAE Fire & Life Safety Code 2018', 'Dubai Civil Defence', true, 'Dubai', 'SATNA0000213672-2021'),
    (v_prod1, 'FM Approval', 'FM 4924', 'FM Approvals', false, 'UAE / GCC', 'Insurance / client driven'),
    (v_prod1, 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'CL18020532');

  -- === Gulf-O-Flex Ultra — Pipe & Duct Insulation (NBR) ===

  INSERT INTO supplier_product_certifications
    (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
  VALUES
    (v_prod2, 'Fire Test Report', 'ASTM E84 / UL 723', 'Civil Defence Approved Lab', true, 'UAE', 'Same limits as Gulf-O-Flex'),
    (v_prod2, 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'Covers tubes & sheets'),
    (v_prod2, 'Civil Defence Approval', 'UAE Fire & Life Safety Code 2018', 'Dubai Civil Defence', true, 'Dubai', 'Listed under same DCD license'),
    (v_prod2, 'FM Approval', 'FM 4924', 'FM Approvals', false, 'UAE / GCC', 'Airports & large developers'),
    (v_prod2, 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'Eco-conscious projects');

  -- === Gulf-O-Flex XLPE — XLPE Pipe & Duct Insulation ===

  INSERT INTO supplier_product_certifications
    (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
  VALUES
    (v_prod3, 'Fire Performance Compliance', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'FSI ≤25 & SDI ≤50'),
    (v_prod3, 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'CL23020867'),
    (v_prod3, 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'CL18020532'),
    (v_prod3, 'Manufacturing Declaration', 'DM-DCLD Rules', 'Manufacturer Declaration', true, 'UAE', 'Outsourced facility CF-540');

  -- === World-Flex — Plain Tube Insulation (NBR) ===

  INSERT INTO supplier_product_certifications
    (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
  VALUES
    (v_prod4, 'Fire Test Report', 'ASTM E84 / BS 476', 'Civil Defence Approved Lab', true, 'UAE', 'Mandatory fire approval'),
    (v_prod4, 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'Within conformity scope'),
    (v_prod4, 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'CL18020532');

END $$;

COMMIT;

-- ============================================
-- DONE! Inserted:
--   2 product categories (HVAC, Insulation)
--   4 supplier products
--   17 certifications total
--   5 new columns on supplier_product_certifications
-- ============================================
