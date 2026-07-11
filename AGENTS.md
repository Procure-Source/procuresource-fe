## Project Summary
ProcureSource is a world-class industrial procurement powerhouse, serving as the definitive technical database for MEP and industrial equipment. It bridges the gap between global manufacturers and regional excellence, with a dominant presence across the GCC (UAE, Saudi Arabia, Qatar, etc.) and expanding international roots in Europe and North America.

## Tech Stack
- Frontend: Next.js 15 (App Router), Tailwind CSS
- Hosting: Vercel
- Data capture: Mailto-based launch and newsletter requests only
- Development: Turbopack for rapid iteration

## Architecture
- `src/app`: Next.js App Router for public launch pages only
  - `/`: Coming-soon launch page
  - `/news`: Static public news/watchlist page
  - `/about`, `/faq`, `/access`, `/contact`, `/status`, `/privacy`, `/terms`: Static launch pages
- `src/components/launch`: Launch navigation, footer, page shell, preloader, and mailto signup forms
- `src/components/seo`: Structured data for the public site
- `src/lib`: Static launch content and metadata helpers

## User Preferences
- Branding: Powerful, "Undisputed Leader", "Global Powerhouse" messaging. High-impact dark themes with sharp blue accents (#0066cc, #2997ff).
- Regional Focus: Full GCC coverage (UAE, KSA, Qatar, Kuwait, Oman, Bahrain) with a focus on Dubai and Riyadh as primary hubs.
- Tech Specs: Extreme emphasis on verified engineering truth, certifications (UL, AHRI, SASO), and AI-driven matching.
- Metric Rigor: Strict adherence to specified metric/imperial systems in RFQ submissions.

## Project Guidelines
- Aesthetic: Modern industrial, distinctive typography (Space Grotesk style), and motion-driven reveals.
- Functional: Public launch site only. Do not add backend routes, database clients, auth providers, or server integrations unless explicitly requested.
- Deployment: Vercel auto-deploys pushes to `main`; no GitHub Actions deployment workflow is used.

## Common Patterns
- Launch requests: Forms validate input in the browser and prepare a `mailto:` message.
- Content: Public-facing product detail stays intentionally high level until the private product is ready.
