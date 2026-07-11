# ProcureSource Backend Architecture

This document maps the production backend surface for the current ProcureSource app. It keeps the active product routes, role flows, and database boundary clear before the full persisted workflow is enabled.

## Runtime Shape

- Frontend: Next.js App Router with server route handlers under `src/app/api`.
- Optional backend: standalone Node service in `backend/server.js` for Azure App Service health checks and RFQ utility APIs.
- Persistence target: Azure Cosmos DB for MongoDB-compatible persistence through `COSMOS_MONGODB_URI`, with `MONGODB_URI` as the local/fallback name.
- Current product state: RFQ records, supplier alerts, and quote submissions have local-safe API surfaces. RFQ records and embedded quotes can use the Cosmos DB-backed repository when `RFQ_STORE_DRIVER=cosmos` and `COSMOS_MONGODB_URI` are configured.
- Removed legacy surface: old inactive route archives and legacy SQL dumps have been removed from the active repository to avoid confusion.

## End-to-End Route And Flow Map

### Purchaser

- Entry: `/register?role=purchase_manager` or `/login`.
- Dashboard: `/pm/dashboard`.
- RFQ creation: `/pm/dashboard/rfqs`.
- Quote review: `/pm/dashboard/review`.
- Award export: `/pm/dashboard/awards`.
- Supplier link handoff: `/rfqs?link=<rfq-id>`.
- Data path: purchaser uploads or pastes a BOQ, `POST /api/rfq/parse-boq` turns it into quoteable line items, the frontend stores the RFQ locally for the active workflow, and the purchaser shares a controlled RFQ link.
- Production persistence target: RFQ, line item, invitation, quote, award, and audit events should persist to Cosmos DB-backed collections before the workflow becomes authoritative for real awards.

### Supplier

- Entry: `/register?role=supplier` or `/login`.
- Dashboard: `/supplier/dashboard`.
- Alerts: `/supplier/dashboard/alerts`.
- Quote management: `/supplier/dashboard/quotes`.
- Document readiness: `/supplier/dashboard/readiness`.
- Quote link: `/rfqs?link=<rfq-id>`.
- Data path: supplier opens the shared RFQ link, enters line pricing, lead time, compliance notes, and proof context, then the canonical `/api/rfqs/[id]/quotes` endpoint stores the submission.
- Production persistence target: quote body, supplier contact, document references, exceptions, and award status should persist to Cosmos DB before buyer-facing production use.

### Supplier Admin

- Entry: `/register?role=supplier_admin` or `/login`.
- Dashboard: `/supplier/admin/dashboard`.
- Shared supplier workspaces: `/supplier/dashboard/alerts`, `/supplier/dashboard/quotes`, and `/supplier/dashboard/readiness`.
- Data path: supplier admin governs supplier seats, RFQ alert routing, quote gates, and proof readiness.
- Production persistence target: organization membership, roles, approval gates, document ownership, and quote approval events should persist with supplier-organization boundaries.

### Purchaser Admin

- Entry: `/register?role=purchaser_admin` or `/login`.
- Dashboard: `/pm/admin/dashboard`.
- Shared purchaser workspaces: `/pm/dashboard/rfqs`, `/pm/dashboard/review`, and `/pm/dashboard/awards`.
- Data path: purchaser admin governs buyer seats, RFQ templates, approval gates, and audit boundaries.
- Production persistence target: purchaser organization membership, RFQ rule templates, approval limits, award gates, and audit events should persist with purchaser-organization boundaries.

### Platform Admin

- Entry: `/admin/dashboard`.
- Document verification: `/admin/dashboard/documents`.
- Access boundaries: `/admin/dashboard/access`.
- Review queue: `/admin/dashboard/review`.
- Data path: platform admins review supplier documents, access controls, flagged RFQs, and supplier evidence before buyer-facing trust states are visible.
- Production persistence target: verification records, document review decisions, role tags, access decisions, disputes, and re-verification events should persist with immutable audit metadata.

## Active API Endpoints

| Surface | Method | Path | Runtime | Purpose | Persistence |
| --- | --- | --- | --- | --- | --- |
| Next app | `GET` | `/api/health` | Node.js route handler | Public health probe for the Next app. | None |
| Next app | `GET` | `/api/status` | Node.js route handler | Returns a generic product readiness response. | None |
| Next app | `POST` | `/api/rfq/parse-boq` | Node.js route handler | Backward-compatible BOQ parsing route for the product UI. | None today; Cosmos DB target for persisted RFQs |
| Next app | `POST` | `/api/rfq/quotes` | Node.js route handler | Deprecated compatibility route that rejects non-canonical quote submissions. | None |
| Next app | `POST` | `/api/parse-boq` | Node.js route handler | Provider-neutral BOQ parsing route for text, CSV, JSON, and manual rows. | None |
| Next app | `POST` | `/api/boq/rfq-template` | Node.js route handler | Returns normalized line items and suggested RFQ draft fields. | None |
| Next app | `GET` / `POST` | `/api/rfqs` | Node.js route handler | Lists RFQs and creates local-safe RFQ records. | Local store today; Cosmos DB target |
| Next app | `GET` / `PATCH` | `/api/rfqs/[id]` | Node.js route handler | Reads or updates an RFQ. | Local store today; Cosmos DB target |
| Next app | `GET` | `/api/rfqs/by-link/[link]` | Node.js route handler | Reads a public supplier RFQ link. | Local store today; Cosmos DB target |
| Next app | `GET` / `POST` | `/api/rfqs/[id]/quotes` | Node.js route handler | Lists or submits supplier quotes. | Local store today; Cosmos DB target |
| Next app | `POST` | `/api/rfqs/[id]/submit-quote` | Node.js route handler | Supplier quote submission alias. | Local store today; Cosmos DB target |
| Next app | `PATCH` | `/api/rfqs/[id]/status` | Node.js route handler | Updates RFQ status. | Local store today; Cosmos DB target |
| Next app | `POST` / `PATCH` | `/api/rfqs/[id]/award` | Node.js route handler | Awards a quote and marks other quotes. | Local store today; Cosmos DB target |
| Next app | `GET` / `POST` | `/api/alerts` | Node.js route handler | Lists and publishes supplier RFQ alerts. | Local store today; Cosmos DB target |
| Next app | `GET` | `/api/feed` | Node.js route handler | Supplier feed for RFQ raised alerts. | Local store today; Cosmos DB target |
| Azure backend | `GET` / `HEAD` | `/health` | `backend/server.js` | App Service health check. | None |
| Azure backend | `GET` / `HEAD` | `/status` | `backend/server.js` | Returns a generic backend readiness response. | None |
| Azure backend | `POST` | `/api/rfq/parse-boq` | `backend/server.js` in product mode | Optional Azure-hosted BOQ parser surface. | None today; Cosmos DB target for persisted RFQs |
| Azure backend | `POST` | `/api/rfq/quotes` | `backend/server.js` in product mode | Deprecated compatibility route that rejects non-canonical quote submissions. | None |

## Security And Trust Boundaries

- Browser-safe values are limited to `NEXT_PUBLIC_*` variables.
- Parser credentials, database connection strings, SMTP credentials, storage credentials, admin bootstrap credentials, and deployment publish profiles stay in secret stores.
- User-facing copy must not expose secret values, parser provider names, parser deployment names, or model names.
- State-changing RFQ utility requests require a trusted origin and `X-ProcureSource-Client`.
- BOQ parsing is bounded by request body, text, data URL, timeout, and rate-limit environment values.
- Platform admin, purchaser admin, supplier admin, purchaser, supplier, and quote-link actions remain separate lanes in route structure and should remain separate in persisted authorization.

## Persistence Model Readiness

The repository is Cosmos DB-ready through `src/lib/db.ts`, which prefers `COSMOS_MONGODB_URI` and falls back to `MONGODB_URI`. Active RFQ routes use `src/lib/db/rfq-record-model.ts` and `src/lib/repositories/mongodb-rfq-repository.ts` when `RFQ_STORE_DRIVER=cosmos` is configured. Mongoose models also exist for users, documents, suppliers, products, projects, RFQs, RFQ invitations, RFQ submissions, quotes, contracts, conversations, deliveries, notifications, verification records, flagged content, and related procurement entities.

Before all production data is authoritative, finish the remaining persistence edges around the RFQ core:

1. Route the product UI from compatibility endpoints to `/api/rfqs` and `/api/rfqs/[id]/quotes` where persistence is required.
2. Attach document references and proof status to supplier quotes.
3. Write losing-supplier notifications and supplier feed events to durable storage.
4. Store admin verification decisions as immutable review events.
5. Keep organization membership and approval gates in tenant-scoped collections.

## Deployment Readiness Checklist

- Azure frontend has public-safe `NEXT_PUBLIC_*` values only.
- Azure backend has `PROCURESOURCE_BACKEND_MODE` explicitly set to `product` for active APIs.
- `COSMOS_MONGODB_URI` is configured before persisted workflows are enabled.
- Parser env names are configured only in backend/server settings.
- CORS allow-lists include the production frontend origin and local QA origins only when needed.
- Health and status probes return `200` before traffic cutover.
- Old route archives and legacy SQL dumps stay out of the active tree. Reintroduce functionality only through reviewed `src/app` routes with validation, auth, and Cosmos DB persistence.
