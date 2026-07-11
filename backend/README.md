# ProcureSource Backend

This is the optional Azure-hosted backend surface for ProcureSource health checks and RFQ utility APIs.

It exposes infrastructure-safe endpoints in every mode:

- `GET /health`
- `GET /status`

Product API routes are enabled when `PROCURESOURCE_BACKEND_MODE=product`. Other values disable product APIs for controlled infrastructure checks.

For local product testing, run with:

```bash
PORT=4180 PROCURESOURCE_BACKEND_MODE=product AI_PROVIDER=primary npm --prefix backend start
```

Product mode exposes:

- `POST /api/rfq/parse-boq` - server-side BOQ line-item parsing for pasted text, TXT/CSV uploads, and bounded image/PDF document payloads.
- `POST /api/rfq/quotes` - deprecated compatibility route. Use the canonical RFQ quote route on the Next app.

Keep parser keys, fallback parser keys, and database connection strings in ignored env files or deployment app settings only. The browser receives only the public API base URL.
