# ProcureSource

Landing page for ProcureSource — RFQ software for UAE MEP procurement managers.
Next.js (App Router) + TypeScript.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production build
npm run typecheck            # tsc --noEmit
```

## Layout

```
app/
  layout.tsx      metadata, next/font, header + footer shell
  page.tsx        composes the four page sections
  globals.css     all styling — design tokens in :root
components/
  SiteHeader.tsx  client — hairline border on scroll (IntersectionObserver)
  Hero.tsx
  HowItWorks.tsx
  RequestAccess.tsx / AccessForm.tsx   client — validation + submit
  Faq.tsx         client — accordion
  SiteFooter.tsx
lib/
  content.ts      step and FAQ copy
  validation.ts   field definitions + one validator per field
legacy/           the original static build this was converted from
```

Styling is one plain stylesheet, not CSS Modules or Tailwind. Tokens live in
`:root` in `app/globals.css`; class names are unscoped and shared with the JSX.

## The request-access form

Validation runs client-side, and submission posts JSON to
`NEXT_PUBLIC_FORM_ENDPOINT`:

```bash
# .env.local
NEXT_PUBLIC_FORM_ENDPOINT=https://…
```

While that variable is unset the form still validates and shows its success
state, but only logs the payload to the console — nothing is sent anywhere. Wire
up an endpoint (or a Route Handler at `app/api/request-access/route.ts`) before
launch.

## Still to do

Carried over from the static build:

- Point the two "Live Demo" links at the real demo URL.
- Add an OG image (`app/opengraph-image.png`, 1200×630) and confirm
  `metadataBase` in `app/layout.tsx`.
- Confirm the contact address and LinkedIn URL in `SiteFooter.tsx`.
- Four FAQ answers in `lib/content.ts` are marked `GUESS` — check them against
  how the product actually works, especially the accepted BOQ file formats.
