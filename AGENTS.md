## Project Summary
ProcureSource is a world-class industrial procurement powerhouse, serving as the definitive technical database for MEP and industrial equipment. It bridges the gap between global manufacturers and regional excellence, with a dominant presence across the GCC (UAE, Saudi Arabia, Qatar, etc.) and expanding international roots in Europe and North America.

## Tech Stack
- Frontend: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Lucide React
- Backend/API: Next.js route handlers plus optional Azure App Service backend
- Database target: Azure Cosmos DB for MongoDB-compatible persistence
- Development: Turbopack for rapid iteration

## Architecture
- `src/app`: Next.js App Router for all pages and API routes
  - `/register`: Multi-role registration with document upload (Trade License, VAT)
  - `/dashboard`: Role-based redirector
  - `/pm/dashboard`: Purchase Manager RFQ generation and management
  - `/supplier/dashboard`: Supplier RFQ submission and tracking
  - `/admin/dashboard`: Document verification and platform oversight
  - `/rfqs`: Public RFQ market and unique link submission flow
- `src/components/sections`: Reusable high-impact homepage and landing page sections
- `src/components/ui`: Atomic UI components following a modern, "Apple-esque" aesthetic
- `src/lib`: Shared utilities, hooks, parser helpers, RFQ repositories, and auth helpers

## User Preferences
- Branding: Clear, calm, high-quality product messaging. Light theme only with ProcureSource blue accents (#0066cc, #2997ff).
- Typography: Use DM Sans and Manrope only across the product.
- Copy: Keep visible UI copy short, sentence case, and layman-friendly. Avoid provider/model names and avoid AI-heavy wording.
- Regional Focus: Full GCC coverage (UAE, KSA, Qatar, Kuwait, Oman, Bahrain) with a focus on Dubai and Riyadh as primary hubs.
- Tech Specs: Extreme emphasis on verified engineering truth, certifications (UL, AHRI, SASO), and AI-driven matching.
- Metric Rigor: Strict adherence to specified metric/imperial systems in RFQ submissions.

## Project Guidelines
- Aesthetic: Modern industrial, distinctive typography (Space Grotesk style), and motion-driven reveals.
- Functional: 24/7 global support availability, multi-regional stock tracking, and instant RFQ/Submittal generation.
- Role-Based Access: Strict segregation of Supplier, Purchase Manager, and Admin dashboards.

## Common Patterns
- Registration: Multi-step information gathering with Trade License and VAT Certificate requirements.
- RFQ Flow: Creator specifies metric system -> Unique link generation -> Supplier submits based on metric system.
- Verification: Admin-only verification of documents before public listing for suppliers.
