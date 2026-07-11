# ProcureSource Launch Deployment

Public launch frontend:

- Vercel: `https://procuresource-launch.vercel.app`
- Azure Static Web Apps: `https://purple-forest-0948a4910.7.azurestaticapps.net`

Dormant Azure backend:

- App Service: `https://procuresource-prod-2605.azurewebsites.net`
- Health: `GET /health`
- Dormant API surface: `GET /api/*` returns `404` during launch mode.
- CORS is intentionally not enabled. The public launch site does not call the backend.

Azure production resources live under `rg-procuresource-prod`.
