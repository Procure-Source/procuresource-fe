# ProcureSource Backend

This is the dormant Azure-hosted backend surface for the public ProcureSource launch.

It deliberately exposes only infrastructure-safe endpoints:

- `GET /health`
- `GET /status`
- `GET /api/*` returns a dormant-mode response

The product backend, login, RFQ, supplier, and verification workflows remain preserved in the repository but are not publicly exposed during the coming-soon phase.
