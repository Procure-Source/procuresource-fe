# ProcureSource Deployment

ProcureSource can run as a full Next.js product surface with route handlers, with an optional Azure App Service backend for health checks and RFQ utility APIs. Static export remains a preview path only; production needs the normal server build for `/api/*`.

## Production Surfaces

### Frontend

- Host: Azure Static Web Apps, Azure App Service, or the currently linked Next.js host.
- Runtime requirement: Next.js server runtime for active `/api/*` route handlers.
- Browser env: only `NEXT_PUBLIC_*` values.
- API bridge: `NEXT_PUBLIC_API_BASE_URL` points to the optional Azure backend when RFQ utility calls should leave the Next host. Leave it empty when the Next app handles `/api/*` directly.

### Optional Azure Backend

- Source: `backend/server.js`.
- Startup command: `npm start` from `backend/`.
- Health probe: `GET /health`.
- Status probe: `GET /status`.
- Product API mode: `PROCURESOURCE_BACKEND_MODE=product`.
- Controlled mode: any value other than `product` is available only for infrastructure checks that intentionally disable product APIs.
- CORS allow-list: `FRONTEND_URLS`.

## Active API Endpoints

| Method | Path | Host | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Next app | Product health probe. |
| `GET` | `/api/status` | Next app | Generic product readiness response. |
| `POST` | `/api/rfq/parse-boq` | Next app | BOQ parsing for purchaser RFQ creation. |
| `POST` | `/api/rfq/quotes` | Next app | Deprecated compatibility route; use `/api/rfqs/[id]/quotes`. |
| `POST` | `/api/parse-boq` | Next app | Provider-neutral BOQ parser route. |
| `POST` | `/api/boq/rfq-template` | Next app | Suggested RFQ draft from parsed BOQ data. |
| `GET` / `POST` | `/api/rfqs` | Next app | RFQ list and creation surface. |
| `GET` / `PATCH` | `/api/rfqs/[id]` | Next app | RFQ detail and update surface. |
| `GET` | `/api/rfqs/by-link/[link]` | Next app | Public supplier RFQ link lookup. |
| `GET` / `POST` | `/api/rfqs/[id]/quotes` | Next app | Quote list and submission. |
| `POST` | `/api/rfqs/[id]/submit-quote` | Next app | Quote submission alias. |
| `PATCH` | `/api/rfqs/[id]/status` | Next app | RFQ status update. |
| `POST` / `PATCH` | `/api/rfqs/[id]/award` | Next app | Award selected quote. |
| `GET` / `POST` | `/api/alerts` | Next app | Supplier RFQ alert list and publish. |
| `GET` | `/api/feed` | Next app | Supplier alert feed. |
| `GET` / `HEAD` | `/health` | Azure backend | App Service health probe. |
| `GET` / `HEAD` | `/status` | Azure backend | Generic backend readiness response. |
| `POST` | `/api/rfq/parse-boq` | Azure backend in product mode | Optional BOQ parsing surface. |
| `POST` | `/api/rfq/quotes` | Azure backend in product mode | Deprecated compatibility route; use the canonical RFQ quote route on the Next app. |

## Environment Variables

Secrets must be stored only in platform secret stores or ignored local env files. Do not place real keys, connection strings, parser deployment names, or model names in docs or user-facing copy.

### Frontend App Settings

| Name | Required | Notes |
| --- | --- | --- |
| `APP_URL` | Yes | Canonical server-side app URL for emails and callbacks. |
| `NEXT_PUBLIC_APP_URL` | Optional | Public browser-safe canonical app URL where needed. |
| `NEXT_PUBLIC_API_BASE_URL` | Optional | Public base URL for the optional backend; omit for same-host Next route handlers. |
| `PROCURESOURCE_ALLOWED_ORIGINS` | Required for cross-origin Next API calls | Comma-separated allowed browser origins for active Next route handlers. |
| `STATIC_EXPORT` | Optional | Preview-only static export switch. Do not use for full production API behavior. |

### Frontend Server-Only Settings

| Name | Required | Notes |
| --- | --- | --- |
| `COSMOS_MONGODB_URI` | Required before persisted workflows | Preferred MongoDB-compatible Cosmos DB connection string. |
| `MONGODB_URI` | Local/fallback | Local or fallback MongoDB connection string. |
| `JWT_SECRET` | Required when JWT auth is enabled | Server-only signing secret. |
| `JWT_EXPIRES_IN` | Optional | Token lifetime, default `7d`. |
| `ADMIN_USERNAME` | Optional | Legacy platform admin bootstrap username. |
| `ADMIN_PASSWORD` | Optional | Legacy platform admin bootstrap password. |
| `RFQ_STORE_DRIVER` | Optional | Use `local` for local-safe testing or `cosmos` for Cosmos DB-backed RFQ persistence. |
| `RFQ_ALLOW_LOCAL_FALLBACK` | Optional | Set `true` for local testing; keep production explicit. |
| `RFQ_REQUIRE_CONFIGURED_STORE` | Optional | Set `true` to fail closed when no persistence driver is configured. |
| `CLOUDINARY_CLOUD_NAME` | Optional | Storage account name for media/document workflows. |
| `CLOUDINARY_API_KEY` | Optional | Server-only storage API key. |
| `CLOUDINARY_API_SECRET` | Optional | Server-only storage API secret. |
| `SMTP_HOST` | Optional | Mail host. |
| `SMTP_PORT` | Optional | Mail port, default `587`. |
| `SMTP_USER` | Optional | Mail user. |
| `SMTP_PASS` | Optional | Mail password. |
| `SMTP_FROM` | Optional | Sender identity. |
| `WHATSAPP_BUSINESS_PHONE_NUMBER_ID` | Optional | Messaging integration identifier. |
| `WHATSAPP_BUSINESS_ACCESS_TOKEN` | Optional | Messaging integration token. |

### Parser Settings

| Name | Required | Notes |
| --- | --- | --- |
| `AI_PROVIDER` | Optional | Parser preference label, default `primary`. |
| `BOQ_PARSER_ENABLED` | Optional | Set `false` to force deterministic local parsing. |
| `BOQ_PARSER_ENDPOINT` | Optional | Server-only provider-neutral parser endpoint. |
| `BOQ_PARSER_API_KEY` | Optional | Server-only parser key. |
| `BOQ_PARSER_AUTH_HEADER` | Optional | Parser auth header, default `Authorization`. |
| `BOQ_PARSER_AUTH_SCHEME` | Optional | Parser auth scheme, default `Bearer`. |
| `BOQ_PARSER_TIMEOUT_MS` | Optional | Parser timeout for `/api/parse-boq`. |
| `BOQ_API_MAX_BODY_BYTES` | Optional | Max parser body size for provider-neutral parser routes. |
| `BOQ_MAX_TEXT_CHARS` | Optional | Max parsed text size for provider-neutral parser routes. |
| `BOQ_MAX_LINE_ITEMS` | Optional | Max normalized BOQ line items. |
| `PRIMARY_AI_API_ENDPOINT` | Required for remote parsing | Server-only parser endpoint. |
| `PRIMARY_AI_MODEL` | Required for remote parsing | Server-only parser deployment/model setting; never display the value to users. |
| `PRIMARY_AI_API_KEY` | Required for remote parsing | Server-only parser key. |
| `FALLBACK_AI_ENDPOINT` | Optional | Server-only fallback parser endpoint. |
| `FALLBACK_AI_DEPLOYMENT` | Optional | Server-only fallback parser deployment name. |
| `FALLBACK_AI_MODEL` | Optional | Legacy fallback parser deployment/model alias. |
| `FALLBACK_AI_API_KEY` | Optional | Server-only fallback parser key. |
| `AI_API_ENDPOINT` | Optional | Legacy generic parser endpoint alias. |
| `AI_API_KEY` | Optional | Legacy generic parser key alias. |
| `AI_MODEL` | Optional | Legacy generic parser model/deployment alias. |
| `AI_API_VERSION` | Optional | Parser API version only when required by the configured endpoint. |

### RFQ Utility Limits

| Name | Default | Notes |
| --- | --- | --- |
| `MAX_BODY_BYTES` | `6291456` | Max JSON request body for BOQ parsing. |
| `MAX_BOQ_TEXT_CHARS` | `60000` | Max pasted BOQ text. |
| `MAX_DATA_URL_CHARS` | `5242880` | Max bounded document data URL. |
| `PARSER_REQUEST_TIMEOUT_MS` | `45000` | Remote parser timeout. |
| `PARSE_RATE_WINDOW_MS` | `60000` | Parse rate-limit window. |
| `PARSE_RATE_MAX` | `12` | Parse requests per client per window. |

### Azure Backend Settings

| Name | Required | Notes |
| --- | --- | --- |
| `PORT` | App Service provided | Backend listen port; defaults to `8080`. |
| `SERVICE_NAME` | Optional | Status payload service name. |
| `PROCURESOURCE_BACKEND_MODE` | Yes | Use `product` for active APIs; other values disable product routes for controlled checks. |
| `FRONTEND_URLS` | Yes for cross-origin frontend | Comma-separated allowed frontend origins for the standalone backend. |
| `REQUEST_TIMEOUT_MS` | Optional | Node request timeout. |
| `HEADERS_TIMEOUT_MS` | Optional | Node headers timeout. |
| `KEEP_ALIVE_TIMEOUT_MS` | Optional | Node keep-alive timeout. |
| `MAX_HEADERS_COUNT` | Optional | Header count limit. |

### CI/CD Secrets

| Name | Required | Notes |
| --- | --- | --- |
| `AZURE_WEBAPP_PUBLISH_PROFILE_PROCURESOURCE_PROD_2605` | Required for backend workflow | GitHub Actions publish profile secret for the Azure App Service backend. |

## Cosmos DB Persistence

The app reads `COSMOS_MONGODB_URI` first and `MONGODB_URI` second. Production should configure Cosmos DB through Azure App Service app settings, Static Web Apps environment settings, or GitHub environment secrets. Never commit the connection string.

Current readiness:

- `src/lib/db.ts` validates a MongoDB-compatible URI and caches the Mongoose connection.
- Mongoose models exist for the future persisted procurement workflow.
- Active RFQ routes use a local-safe store for development and QA. Set `RFQ_STORE_DRIVER=cosmos` with `COSMOS_MONGODB_URI` to use the Cosmos DB-backed RFQ repository.
- Enable persisted workflows only after RFQ creation, quote submission, document references, award decisions, and admin review decisions are wired to Cosmos DB collections.

## CI/CD

GitHub Actions workflow: `.github/workflows/azure-deploy.yml`.

- Pull requests to `main` should run lint, full Next.js build, and backend syntax checks.
- Pushes to `main` and manual dispatches deploy `backend/` to Azure App Service when the optional backend is used.
- The backend should run with Node 20 or newer; Node 22 LTS is preferred for the current deployment target.
- Health check path: `/health`.

## Release Gates

1. `npm run lint`.
2. `npm run build`.
3. `npm --prefix backend run check`.
4. `GET /api/health` returns `200`.
5. `GET /api/status` returns `200` on the Next host.
6. Optional backend `GET /health` returns `200`.
7. Optional backend `GET /status` returns `200`.
8. No committed docs or templates contain real keys, connection strings, parser deployment values, or model names.
