# ProcureSource Launch Deployment

ProcureSource is currently a frontend-only Next.js launch site.

## Production

- Hosting: Vercel
- Production domain: `https://procuresource.co`
- Preview/deploy behavior: pushes to `main` are auto-deployed by the connected Vercel project.

## Local

```bash
npm install
npm run dev
```

The public site does not require a database, auth, server routes, or backend environment variables.
