# funkraus

BZF I & II online course platform — business, content, and engineering.

## Repo layout

- [`BUSINESS-STRATEGY.md`](BUSINESS-STRATEGY.md) — market research, pricing, content-sourcing strategy, platform cost analysis (Shopify vs. custom build)
- [`COURSE-STRUCTURE-PUBLIC.md`](COURSE-STRUCTURE-PUBLIC.md) — landing-page-ready course structure
- [`COURSE-STRUCTURE-DETAILED.md`](COURSE-STRUCTURE-DETAILED.md) — internal chapter-by-chapter content spec
- [`platform/`](platform/) — the Next.js application (landing page now; auth, dashboard, admin, and payments follow)

## Build order

1. ✅ Landing page design approved
2. ✅ Platform scaffolded, landing page ported to Next.js (this commit)
3. Supabase (auth + database) wired in
4. User auth + protected dashboard
5. Stripe checkout (test mode) gating dashboard access
6. Admin CMS for course content (modules/lessons/quiz questions)
7. Deploy (Vercel) + connect funkraus.de
8. Course content added last

See `platform/README.md` for how to run the app locally.
