# ProcureSource

ProcureSource is a UAE-first MEP RFQ platform moving from private launch into a production-ready public product surface. The site includes the product homepage, RFQ utility, purchaser workspace, supplier workspace, quote-link flow, news, and legal/trust pages for local end-to-end testing before live release.

Live site targets:

- https://procuresource.co
- https://procuresource-by-lycoris.vercel.app

Repository:

- GitHub: https://github.com/thelycorisdesignstudio/procuresource
- Vercel team: `lycoris-projects`

## Public Pages

- `/` - Product homepage
- `/product` - RFQ utility
- `/login` - Split-layout sign in
- `/register` - Split-layout role registration
- `/pm/dashboard` - Purchaser dashboard
- `/supplier/dashboard` - Supplier dashboard
- `/rfqs` - Supplier RFQ quote link
- `/news` - Curated MEP, construction, infrastructure, and GCC news
- `/about` - About ProcureSource
- `/faq` - FAQ
- `/access` - Early access request
- `/advertise` - Advertising and partnership request
- `/security` - Security posture
- `/contact` - Contact page
- `/status` - Product status
- `/privacy` - Privacy policy
- `/terms` - Terms and conditions

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Framer Motion and Lucide React
- Next.js route handlers and optional Node backend for product-mode RFQ APIs
- Vercel full-stack deployment target for the product frontend and API routes
- Azure App Service deployment target for the optional standalone backend
- Azure Cosmos DB compatible database target for production persistence

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real secrets. Keep all real credentials in ignored local env files, CI/CD secrets, Azure App Settings, or approved secret stores.

| Variable | Purpose |
|----------|---------|
| `PRIMARY_AI_API_ENDPOINT` | Server-side primary parsing endpoint |
| `PRIMARY_AI_MODEL` | Server-side primary parsing model |
| `PRIMARY_AI_API_KEY` | Server-side primary parsing key |
| `FALLBACK_AI_ENDPOINT` | Optional fallback parsing endpoint |
| `FALLBACK_AI_DEPLOYMENT` | Optional fallback parsing deployment |
| `FALLBACK_AI_API_KEY` | Optional fallback parsing key |
| `PARSER_REQUEST_TIMEOUT_MS` | Server-side parser request timeout |
| `MAX_BODY_BYTES` | Maximum backend JSON payload size |
| `MAX_BOQ_TEXT_CHARS` | Maximum BOQ text sent for parsing |
| `MAX_DATA_URL_CHARS` | Maximum image/PDF document payload sent for reading |
| `COSMOS_MONGODB_URI` | Production database connection string |
| `NEXT_PUBLIC_API_BASE_URL` | Public-safe frontend API base URL |
| `APP_URL` | Public URL, e.g. `https://procuresource.co` |

Do not commit `.env`, `.env.local`, API keys, database URLs, publish profiles, or credentials.

## Scripts

```bash
npm run dev
npm run news:update
npm run build
npm run start
npm run lint
npm --prefix backend start
npm --prefix backend run check
```

## Local Product Mode

Frontend static preview normally runs on `http://localhost:4174`.

Backend product mode normally runs on `http://localhost:4180`:

```bash
PORT=4180 PROCURESOURCE_BACKEND_MODE=product AI_PROVIDER=primary npm --prefix backend start
```

Product mode exposes:

- `GET /health`
- `GET /status`
- `POST /api/rfq/parse-boq`
- `POST /api/rfq/quotes`

The BOQ parser accepts pasted text, TXT/CSV uploads, and bounded image/PDF document payloads. Document reading and parsing stay server-side, use configured environment credentials only, and fall back to deterministic local parsing when the configured parser is unavailable.

The API should not expose provider names, keys, or internal parser details in public responses.

## Deployment

GitHub Actions workflow: `.github/workflows/azure-deploy.yml`

- Pull requests to `main` run frontend lint, the full Next.js build, and backend syntax checks.
- Vercel Git integration deploys the full-stack Next.js product surface, including `/api/*` route handlers.
- Pushes to `main` and manual `workflow_dispatch` runs deploy `backend/` to Azure App Service when the Azure backend is used.
- Backend deployment uses an Azure App Service publish profile stored as a GitHub Actions secret.

No commit or push should be made until the local product, backend, and browser QA pass.

## Brand

- Product font target: `DM Sans` and `Manrope` only.
- Theme: light only.
- Primary accent: `#0066cc`.
- Email: `hello@procuresource.co` / `support@procuresource.co`.

## Search And AI Indexing

- `/llms.txt` - LLM-readable facts and citation phrasing
- `/ai-index.json` - structured AI index with answers and page references
- `/sitemap.xml` - sitemap for search crawlers
- `/robots.txt` - crawler directives
- Schema.org JSON-LD in `src/components/seo/structured-data.tsx`
