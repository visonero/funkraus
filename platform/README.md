# funkraus — platform

Next.js (App Router) + TypeScript app for the funkraus BZF I/II course platform.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- Hand-written CSS (`src/app/globals.css`) — no Tailwind, ported directly from the approved landing page design
- Auth, database, and payments (Supabase + Stripe) are not wired up yet — see repo root `BUSINESS-STRATEGY.md` and the project chat history for the planned build order

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/page.tsx` — the landing page
- `src/components/` — interactive pieces (nav, accordions, tabs) as client components; the landing page itself is a server component
- `src/app/login`, `src/app/dashboard`, `src/app/admin` — placeholder routes for auth, the user dashboard, and the content-management admin panel, to be built once Supabase/Stripe are connected

## Environment variables

None yet. Once Supabase/Stripe are connected, secrets go in `.env.local` (already gitignored) — never commit real keys.
