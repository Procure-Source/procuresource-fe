-- ============================================
-- ProcureSource - Complete Seed Data
-- Suppliers + Products + Certifications
-- Run ONCE after supabase-migration-complete.sql
-- ============================================

BEGIN;

-- ============================================
-- 1. Extend supplier_product_certifications
--    with additional columns for certification data
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
-- 2. Product Categories
-- ============================================

INSERT INTO product_categories (id, name, slug, description, parent_id, display_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'HVAC', 'hvac', 'Heating, Ventilation & Air Conditioning', NULL, 1),
  ('a0000000-0000-0000-0000-000000000002', 'Insulation', 'insulation', 'HVAC Insulation Products', 'a0000000-0000-0000-0000-000000000001', 1)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. Auth Users (13 suppliers)
--    Default password: Supplier@2026
-- ============================================

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, raw_user_meta_data)
VALUES
  -- Gulf-O-Flex Suppliers
  ('c0000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000000',
   'century.factory@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Century Mechanical Systems Factory", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000000',
   'century.llc@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Century Mechanical Systems LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000000',
   'aldanube@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Aldanube Building Materials LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000000',
   'fjcare@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "FJCare Air Condition Trading LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000000',
   'kepco@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "KEPCO Building Materials Trading LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000000',
   'salvo@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Salvo Corporation Trading LLC", "role": "supplier"}'::jsonb),

  -- World-Flex Suppliers
  ('c0000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000000',
   'kaffaa@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Kaffaa Al Taqa A/C Devices Spare Parts TR.", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000000',
   'tecnalco@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Tecnalco Technical Refrigeration & Airconditioning", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000000',
   'alemadi@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Al Emadi Air Conditioning & Refrigeration Equipment", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000000',
   'airmax@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Airmax AC Industry LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000000',
   'algergawi@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Al Gergawi Metal Industries LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000000',
   'fakhri@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Fakhri and Brothers Air Conditioning Trading LLC", "role": "supplier"}'::jsonb),

  ('c0000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000000',
   'intercool@procuresource.co', crypt('Supplier@2026', gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"full_name": "Inter Cool Aircondtioning LLC", "role": "supplier"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. Profiles
-- ============================================

INSERT INTO profiles (id, full_name, company_name, role)
VALUES
  ('c0000000-0000-0000-0001-000000000001', 'Century Mechanical Systems Factory', 'CENTURY MECHANICAL SYSTEMS FACTORY L L C', 'supplier'),
  ('c0000000-0000-0000-0001-000000000002', 'Century Mechanical Systems LLC', 'CENTURY MECHANICAL SYSTEMS LLC', 'supplier'),
  ('c0000000-0000-0000-0001-000000000003', 'Aldanube Building Materials', 'ALDANUBE BUILDING MATERIALS LLC', 'supplier'),
  ('c0000000-0000-0000-0001-000000000004', 'FJCare Air Condition Trading', 'FJCARE AIR CONDITION TRADING L.L.C', 'supplier'),
  ('c0000000-0000-0000-0001-000000000005', 'KEPCO Building Materials', 'K E P C O BUILDING MATERIALS TRADING LLC', 'supplier'),
  ('c0000000-0000-0000-0001-000000000006', 'Salvo Corporation Trading', 'SALVO CORPORATION TRADING LLC', 'supplier'),
  ('c0000000-0000-0000-0002-000000000001', 'Kaffaa Al Taqa', 'KAFFAA AL TAQA A/C DEVICES SPARE PARTS TR.', 'supplier'),
  ('c0000000-0000-0000-0002-000000000002', 'Tecnalco Technical Refrigeration', 'TECNALCO TECHNICAL REFRIGERATION & AIRCONDITIONING C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000003', 'Al Emadi Air Conditioning', 'AL EMADI AIR CONDITIONING & REFRIGERATION EQUIPMENT C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000004', 'Airmax AC Industry', 'AIRMAX AC INDUSTRY L.L.C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000005', 'Al Gergawi Metal Industries', 'AL GERGAWI METAL INDUSTRIES L.L.C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000006', 'Fakhri and Brothers', 'FAKHRI AND BROTHERS AIR CONDITIONING TRADING LLC', 'supplier'),
  ('c0000000-0000-0000-0002-000000000007', 'Inter Cool Aircondtioning', 'INTER COOL AIRCONDTIONING (L.L.C.)', 'supplier')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. Supplier Records
-- ============================================

INSERT INTO suppliers (id, user_id, name, slug, country, city, is_verified, certifications)
VALUES
  -- Gulf-O-Flex Suppliers
  ('d0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0001-000000000001',
   'CENTURY MECHANICAL SYSTEMS FACTORY L L C', 'century-mechanical-systems-factory',
   'UAE', 'Dubai', true, ARRAY['FM', 'UL']),

  ('d0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0001-000000000002',
   'CENTURY MECHANICAL SYSTEMS LLC', 'century-mechanical-systems-llc',
   'UAE', 'Dubai', true, ARRAY['ISO 9001']),

  ('d0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0001-000000000003',
   'ALDANUBE BUILDING MATERIALS LLC', 'aldanube-building-materials',
   'UAE', 'Dubai', true, ARRAY['ISO 9001', 'ISO 14001']),

  ('d0000000-0000-0000-0001-000000000004', 'c0000000-0000-0000-0001-000000000004',
   'FJCARE AIR CONDITION TRADING L.L.C', 'fjcare-air-condition-trading',
   'UAE', 'Abu Dhabi', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0001-000000000005', 'c0000000-0000-0000-0001-000000000005',
   'K E P C O BUILDING MATERIALS TRADING LLC', 'kepco-building-materials-trading',
   'UAE', 'Sharjah', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0001-000000000006', 'c0000000-0000-0000-0001-000000000006',
   'SALVO CORPORATION TRADING LLC', 'salvo-corporation-trading',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[]),

  -- World-Flex Suppliers
  ('d0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0002-000000000001',
   'KAFFAA AL TAQA A/C DEVICES SPARE PARTS TR.', 'kaffaa-al-taqa-ac-devices',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0002-000000000002',
   'TECNALCO TECHNICAL REFRIGERATION & AIRCONDITIONING C', 'tecnalco-technical-refrigeration',
   'UAE', 'Dubai', true, ARRAY['ISO 9001']),

  ('d0000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0002-000000000003',
   'AL EMADI AIR CONDITIONING & REFRIGERATION EQUIPMENT C', 'al-emadi-air-conditioning',
   'UAE', 'Abu Dhabi', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000004', 'c0000000-0000-0000-0002-000000000004',
   'AIRMAX AC INDUSTRY L.L.C', 'airmax-ac-industry',
   'UAE', 'Dubai', true, ARRAY['AHRI']),

  ('d0000000-0000-0000-0002-000000000005', 'c0000000-0000-0000-0002-000000000005',
   'AL GERGAWI METAL INDUSTRIES L.L.C', 'al-gergawi-metal-industries',
   'UAE', 'Sharjah', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000006', 'c0000000-0000-0000-0002-000000000006',
   'FAKHRI AND BROTHERS AIR CONDITIONING TRADING LLC', 'fakhri-and-brothers-ac-trading',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000007', 'c0000000-0000-0000-0002-000000000007',
   'INTER COOL AIRCONDTIONING (L.L.C.)', 'inter-cool-aircondtioning',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. Supplier Products (4 products)
--    Gulf-O-Flex products → Century Mechanical
--    World-Flex products  → Kaffaa Al Taqa
-- ============================================

INSERT INTO supplier_products (id, supplier_id, name, slug, brand, category, description, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0001-000000000001',
   'Pipe Insulation (NBR Elastomeric)', 'pipe-insulation-nbr-elastomeric',
   'Gulf-O-Flex', 'Insulation',
   'NBR Elastomeric pipe insulation for HVAC systems. FSI ≤25 & SDI ≤50 compliant.',
   'approved'),

  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0001-000000000001',
   'Pipe & Duct Insulation (NBR)', 'pipe-duct-insulation-nbr',
   'Gulf-O-Flex Ultra', 'Insulation',
   'NBR pipe and duct insulation covering tubes & sheets for HVAC applications.',
   'approved'),

  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0001-000000000001',
   'XLPE Pipe & Duct Insulation', 'xlpe-pipe-duct-insulation',
   'Gulf-O-Flex XLPE', 'Insulation',
   'Cross-linked polyethylene pipe and duct insulation. FSI ≤25 & SDI ≤50 compliant.',
   'approved'),

  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0002-000000000001',
   'Plain Tube Insulation (NBR)', 'plain-tube-insulation-nbr',
   'World-Flex', 'Insulation',
   'NBR plain tube insulation for HVAC systems.',
   'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. Product Certifications (17 total)
-- ============================================

-- Gulf-O-Flex — Pipe Insulation (NBR Elastomeric)
INSERT INTO supplier_product_certifications
  (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Fire Test Report', 'ASTM E84 / UL 723 / BS 476', 'Civil Defence Approved Lab', true, 'UAE', 'FSI ≤25 & SDI ≤50'),
  ('b0000000-0000-0000-0000-000000000001', 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'Certificate CL23020867'),
  ('b0000000-0000-0000-0000-000000000001', 'Civil Defence Approval', 'UAE Fire & Life Safety Code 2018', 'Dubai Civil Defence', true, 'Dubai', 'SATNA0000213672-2021'),
  ('b0000000-0000-0000-0000-000000000001', 'FM Approval', 'FM 4924', 'FM Approvals', false, 'UAE / GCC', 'Insurance / client driven'),
  ('b0000000-0000-0000-0000-000000000001', 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'CL18020532');

-- Gulf-O-Flex Ultra — Pipe & Duct Insulation (NBR)
INSERT INTO supplier_product_certifications
  (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Fire Test Report', 'ASTM E84 / UL 723', 'Civil Defence Approved Lab', true, 'UAE', 'Same limits as Gulf-O-Flex'),
  ('b0000000-0000-0000-0000-000000000002', 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'Covers tubes & sheets'),
  ('b0000000-0000-0000-0000-000000000002', 'Civil Defence Approval', 'UAE Fire & Life Safety Code 2018', 'Dubai Civil Defence', true, 'Dubai', 'Listed under same DCD license'),
  ('b0000000-0000-0000-0000-000000000002', 'FM Approval', 'FM 4924', 'FM Approvals', false, 'UAE / GCC', 'Airports & large developers'),
  ('b0000000-0000-0000-0000-000000000002', 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'Eco-conscious projects');

-- Gulf-O-Flex XLPE — XLPE Pipe & Duct Insulation
INSERT INTO supplier_product_certifications
  (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
VALUES
  ('b0000000-0000-0000-0000-000000000003', 'Fire Performance Compliance', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'FSI ≤25 & SDI ≤50'),
  ('b0000000-0000-0000-0000-000000000003', 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'CL23020867'),
  ('b0000000-0000-0000-0000-000000000003', 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'CL18020532'),
  ('b0000000-0000-0000-0000-000000000003', 'Manufacturing Declaration', 'DM-DCLD Rules', 'Manufacturer Declaration', true, 'UAE', 'Outsourced facility CF-540');

-- World-Flex — Plain Tube Insulation (NBR)
INSERT INTO supplier_product_certifications
  (supplier_product_id, certification_type, standard_code, issuing_authority, is_mandatory, applies_in, notes)
VALUES
  ('b0000000-0000-0000-0000-000000000004', 'Fire Test Report', 'ASTM E84 / BS 476', 'Civil Defence Approved Lab', true, 'UAE', 'Mandatory fire approval'),
  ('b0000000-0000-0000-0000-000000000004', 'Product Conformity Certificate', 'UAE Fire & Life Safety Code 2018', 'Dubai Municipality (DCLD)', true, 'UAE', 'Within conformity scope'),
  ('b0000000-0000-0000-0000-000000000004', 'Green Building Compliance', 'Al Sa''fat Dubai Green Building System', 'Dubai Municipality', false, 'Dubai', 'CL18020532');

COMMIT;

-- ============================================
-- DONE! Single file inserts everything:
--   2 product categories (HVAC → Insulation)
--   13 auth users (password: Supplier@2026)
--   13 profiles
--   13 suppliers (6 Gulf-O-Flex + 7 World-Flex)
--   4 supplier products
--   17 product certifications
--   5 new columns on certifications table
--
-- Run order:
--   1. supabase-migration-complete.sql
--   2. supabase-seed-data.sql (this file)
--
-- Login credentials:
--   century.factory@procuresource.co / Supplier@2026
--   century.llc@procuresource.co     / Supplier@2026
--   aldanube@procuresource.co        / Supplier@2026
--   fjcare@procuresource.co          / Supplier@2026
--   kepco@procuresource.co           / Supplier@2026
--   salvo@procuresource.co           / Supplier@2026
--   kaffaa@procuresource.co          / Supplier@2026
--   tecnalco@procuresource.co        / Supplier@2026
--   alemadi@procuresource.co         / Supplier@2026
--   airmax@procuresource.co          / Supplier@2026
--   algergawi@procuresource.co       / Supplier@2026
--   fakhri@procuresource.co          / Supplier@2026
--   intercool@procuresource.co       / Supplier@2026
-- ============================================
