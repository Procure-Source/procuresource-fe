-- ============================================
-- ProcureSource - Seed: Suppliers Data
-- Gulf-O-Flex distributors (6) + World-Flex distributors (7)
-- Run after supabase-migration-complete.sql
-- ============================================

BEGIN;

-- ============================================
-- 1. Create auth users for each supplier
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
-- 2. Create profiles
-- ============================================

INSERT INTO profiles (id, full_name, company_name, role)
VALUES
  -- Gulf-O-Flex Suppliers
  ('c0000000-0000-0000-0001-000000000001', 'Century Mechanical Systems Factory', 'CENTURY MECHANICAL SYSTEMS FACTORY L L C', 'supplier'),
  ('c0000000-0000-0000-0001-000000000002', 'Century Mechanical Systems LLC', 'CENTURY MECHANICAL SYSTEMS LLC', 'supplier'),
  ('c0000000-0000-0000-0001-000000000003', 'Aldanube Building Materials', 'ALDANUBE BUILDING MATERIALS LLC', 'supplier'),
  ('c0000000-0000-0000-0001-000000000004', 'FJCare Air Condition Trading', 'FJCARE AIR CONDITION TRADING L.L.C', 'supplier'),
  ('c0000000-0000-0000-0001-000000000005', 'KEPCO Building Materials', 'K E P C O BUILDING MATERIALS TRADING LLC', 'supplier'),
  ('c0000000-0000-0000-0001-000000000006', 'Salvo Corporation Trading', 'SALVO CORPORATION TRADING LLC', 'supplier'),
  -- World-Flex Suppliers
  ('c0000000-0000-0000-0002-000000000001', 'Kaffaa Al Taqa', 'KAFFAA AL TAQA A/C DEVICES SPARE PARTS TR.', 'supplier'),
  ('c0000000-0000-0000-0002-000000000002', 'Tecnalco Technical Refrigeration', 'TECNALCO TECHNICAL REFRIGERATION & AIRCONDITIONING C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000003', 'Al Emadi Air Conditioning', 'AL EMADI AIR CONDITIONING & REFRIGERATION EQUIPMENT C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000004', 'Airmax AC Industry', 'AIRMAX AC INDUSTRY L.L.C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000005', 'Al Gergawi Metal Industries', 'AL GERGAWI METAL INDUSTRIES L.L.C', 'supplier'),
  ('c0000000-0000-0000-0002-000000000006', 'Fakhri and Brothers', 'FAKHRI AND BROTHERS AIR CONDITIONING TRADING LLC', 'supplier'),
  ('c0000000-0000-0000-0002-000000000007', 'Inter Cool Aircondtioning', 'INTER COOL AIRCONDTIONING (L.L.C.)', 'supplier')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. Create supplier records
-- ============================================

INSERT INTO suppliers (id, user_id, name, slug, country, city, is_verified, certifications)
VALUES
  -- Gulf-O-Flex Suppliers
  ('d0000000-0000-0000-0001-000000000001',
   'c0000000-0000-0000-0001-000000000001',
   'CENTURY MECHANICAL SYSTEMS FACTORY L L C',
   'century-mechanical-systems-factory',
   'UAE', 'Dubai', true, ARRAY['FM', 'UL']),

  ('d0000000-0000-0000-0001-000000000002',
   'c0000000-0000-0000-0001-000000000002',
   'CENTURY MECHANICAL SYSTEMS LLC',
   'century-mechanical-systems-llc',
   'UAE', 'Dubai', true, ARRAY['ISO 9001']),

  ('d0000000-0000-0000-0001-000000000003',
   'c0000000-0000-0000-0001-000000000003',
   'ALDANUBE BUILDING MATERIALS LLC',
   'aldanube-building-materials',
   'UAE', 'Dubai', true, ARRAY['ISO 9001', 'ISO 14001']),

  ('d0000000-0000-0000-0001-000000000004',
   'c0000000-0000-0000-0001-000000000004',
   'FJCARE AIR CONDITION TRADING L.L.C',
   'fjcare-air-condition-trading',
   'UAE', 'Abu Dhabi', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0001-000000000005',
   'c0000000-0000-0000-0001-000000000005',
   'K E P C O BUILDING MATERIALS TRADING LLC',
   'kepco-building-materials-trading',
   'UAE', 'Sharjah', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0001-000000000006',
   'c0000000-0000-0000-0001-000000000006',
   'SALVO CORPORATION TRADING LLC',
   'salvo-corporation-trading',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[]),

  -- World-Flex Suppliers
  ('d0000000-0000-0000-0002-000000000001',
   'c0000000-0000-0000-0002-000000000001',
   'KAFFAA AL TAQA A/C DEVICES SPARE PARTS TR.',
   'kaffaa-al-taqa-ac-devices',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000002',
   'c0000000-0000-0000-0002-000000000002',
   'TECNALCO TECHNICAL REFRIGERATION & AIRCONDITIONING C',
   'tecnalco-technical-refrigeration',
   'UAE', 'Dubai', true, ARRAY['ISO 9001']),

  ('d0000000-0000-0000-0002-000000000003',
   'c0000000-0000-0000-0002-000000000003',
   'AL EMADI AIR CONDITIONING & REFRIGERATION EQUIPMENT C',
   'al-emadi-air-conditioning',
   'UAE', 'Abu Dhabi', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000004',
   'c0000000-0000-0000-0002-000000000004',
   'AIRMAX AC INDUSTRY L.L.C',
   'airmax-ac-industry',
   'UAE', 'Dubai', true, ARRAY['AHRI']),

  ('d0000000-0000-0000-0002-000000000005',
   'c0000000-0000-0000-0002-000000000005',
   'AL GERGAWI METAL INDUSTRIES L.L.C',
   'al-gergawi-metal-industries',
   'UAE', 'Sharjah', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000006',
   'c0000000-0000-0000-0002-000000000006',
   'FAKHRI AND BROTHERS AIR CONDITIONING TRADING LLC',
   'fakhri-and-brothers-ac-trading',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[]),

  ('d0000000-0000-0000-0002-000000000007',
   'c0000000-0000-0000-0002-000000000007',
   'INTER COOL AIRCONDTIONING (L.L.C.)',
   'inter-cool-aircondtioning',
   'UAE', 'Dubai', true, ARRAY[]::TEXT[])

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. Now update the certification seed to use
--    the first Gulf-O-Flex supplier as owner
-- ============================================

-- Update the 4 seeded products to belong to Century Mechanical (Gulf-O-Flex main distributor)
UPDATE supplier_products
SET supplier_id = 'c0000000-0000-0000-0001-000000000001'
WHERE id IN (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003'
);

-- World-Flex product belongs to Kaffaa Al Taqa (World-Flex main distributor)
UPDATE supplier_products
SET supplier_id = 'c0000000-0000-0000-0002-000000000001'
WHERE id = 'b0000000-0000-0000-0000-000000000004';

COMMIT;

-- ============================================
-- DONE! Inserted:
--   13 auth users (password: Supplier@2026)
--   13 profiles
--   13 suppliers (6 Gulf-O-Flex + 7 World-Flex)
--   Updated product ownership
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
