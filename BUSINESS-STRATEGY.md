# BZF I/II Online Course — Business & Content Strategy

_This document is the reference input for the future platform build. Read this before making architecture or content-modeling decisions._

## Context

You want to compete with aviationhero.de/bzf, which sells BZF I/II exam prep (the German radiotelephony certificate required for PPL(A) pilots) but hides its price behind a mandatory sales-call funnel, reportedly landing around €1,000–3,000+ once bundled with theory/coaching. Your pitch: a fixed, transparent, no-interview price with immediate access on purchase. Before building anything, you asked for real market research — competitors, pricing, and whether enough free/official material exists to build a genuinely complete course, given you're not an instructor and have no proprietary course content of your own.

Two parallel research passes (competitor/pricing landscape, and regulatory/content feasibility) confirm the business is viable, but correct and sharpen the original premise in three important ways, detailed below.

## What the research found

**Regulatory correction:** BZF I/II is not administered by the LBA or DFS as commonly assumed — it's regulated and examined by the **Bundesnetzagentur (BNetzA)** under the *Verordnung über Flugfunkzeugnisse (FlugfunkV)*. DFS supplies an exam assessor and publishes the binding phraseology notice; the LBA governs pilot licensing generally but not this certificate. Get this right in all marketing/legal copy.

**The core content asset is real and free:** BNetzA publishes an official, current (2024) **Fragenkatalog** (question catalog) — this *is* the actual exam content (100 of ~254–261 questions drawn per exam, 75 needed to pass), the same model as the AZF/driving-theory system. Paired with it: the DFS phraseology "Bekanntmachung" (binding radiotelephony procedures) and the plain ordinance text (FlugfunkV) — both very likely uncopyrightable "amtliche Werke" under §5 UrhG, freely reusable. AIP VFR Germany is free to view but contractually not scrapeable/redistributable in bulk. This confirms: yes, there is enough authoritative free source material to build complete, accurate BZF I+II content — provided all explanatory/pedagogical material is written originally, not copied from competitors' free PDFs, apps, or YouTube videos (those remain ordinary copyrighted work).

**The market is more crowded than it looked, but the "no sales call" wedge is real and specific:** Aviation Hero is not the only price-opaque provider — bzf-kurs.de, AeroCall, and Spectaculair Training also withhold final pricing until a call/checkout step. But several competitors *do* post fixed prices already (fluglehrerteam.com ~€249–299, FlyCademy ~€280–380, G.A.T. €249, Online-Livekurse €249–399), and bzf-kurs.de already runs a similar "free questions + paid self-paced course" model to what you're planning. So the differentiation isn't "nobody does fixed pricing" — it's specifically beating **Aviation Hero's** opacity and 4-figure positioning with better production quality than the cheap end of the market, at an honest, posted, mid-market price. Price benchmarks: budget self-study ~€90–150, mainstream live-instruction ~€250–400 (the dominant cluster), Aviation Hero's premium coaching tier ~€1,000–3,000 (their own founder's public figure, bundled with theory, not BZF alone — the €4k rumor for BZF-alone is unverified).

Market size (how many people take BZF/PPL(A) per year in Germany) could not be pinned down from public search — LBA holds the raw stock data in an unparsed Excel file (`lba.de/.../Lizenbestand_einzeln.xlsx`); treat any TAM number as a placeholder until that file is actually opened, or don't lean on a precise TAM for the initial go/no-go.

## Decisions locked in

- **Price: ~€300–450 for BZF I+II combined**, positioned at the top of the proven mainstream cluster — cheap enough to make "no sales call, no €1000s" an obviously true claim, expensive enough to fund real production quality and signal it's not a bare-bones quiz app.
- **Content QA: solo-built from official sources (BNetzA Fragenkatalog, DFS phraseology Bekanntmachung, FlugfunkV, freely-viewable AIP), with a single paid external review/audit pass before launch** — likely a freelance flight instructor or current BZF I/II holder reviewing scripts, phraseology examples, and quiz content for correctness before anything goes live. This is a launch gate, not an ongoing dependency.
- **Scope of the original strategy pass: business/content strategy only.** The web app platform (stack, architecture, payments, video hosting, auth, quiz engine) was deliberately deferred to its own planning pass — see the Platform Feasibility Q&A below for the first round of that.

## The business idea, stated plainly

A self-paced online course covering BZF I and BZF II, sold at a single fixed price (~€300–450, one payment, buy-now checkout, no calls or interviews), with immediate account access on purchase. Content built entirely from original writing/video/audio grounded in the official BNetzA question catalog and DFS phraseology rules, structured as: theory modules → the full official question bank as practice quizzes → radio-simulation exam practice → a final review/audit pass by an external instructor before launch. Marketing positions directly against Aviation Hero's sales-call funnel ("see the price, buy today, no interview") while matching or beating the production quality of the €250–400 live-instruction competitors, without needing live cohorts to do it.

## Content creation plan

1. **Source material, in priority order** (all free, all safe to build from with original writing):
   - BNetzA Fragenkatalog PDF (the exam question bank itself — backbone of the quiz/exam-sim modules)
   - DFS "Bekanntmachung über die Sprechfunkverfahren" (2024) — binding phraseology, backbone of the radio-procedure lessons
   - FlugfunkV ordinance text — legal/structural backbone for the "why" behind procedures
   - EASA/EGAST "Radiotelephony Guide for VFR Pilots" — free ICAO-aligned reference for framing/examples (non-German-specific, use as background, not verbatim)
   - AIP VFR Germany (ais.dfs.de) — reference/link only for real-world examples; do not scrape or republish

2. **Explicitly do not copy from**: bzf-kurs.de, training-4pilots.de, moritzweinig.com, Aviation Hero, competitor apps (BZF-Fragentrainer, FunkCoach, etc.), YouTube videos, or club/Verein PDFs. These are useful only as competitive/format inspiration, not as source text — everything in the actual course must be written fresh.

3. **Module structure** (derived from confirmed exam structure):
   - Legal/procedural foundations (from FlugfunkV + BNetzA guidance)
   - BZF II track: German-only VFR domestic phraseology and procedures
   - BZF I track: adds English R/T, international VFR, and the English reading/oral-translation exam component
   - Full official question bank as an interactive quiz engine (all ~254–261 questions, filterable/spaced-repetition style)
   - Simulated radio exam practice: realistic multi-step VFR scenarios (departure, transit, arrival) in both German and English, mirroring the real exam's live-traffic-simulation format
   - Final exam simulation mode: timed, randomized 100-question set, 75-correct pass threshold, mimicking the real test

4. **Pre-launch legal/content audit** (the agreed QA gate): commission a lawyer's opinion on reuse of the Fragenkatalog/phraseology notice under §5 UrhG (don't rely on inference), and have a licensed instructor or current BZF I/II holder review all scripts, translations, and quiz content for accuracy before the course goes live. Budget and timeline for both should be built into the launch plan.

## Differentiation & marketing angle

- Headline promise: "See the price. Buy today. Start now." — directly countering Aviation Hero's call-first funnel, which has documented public criticism (a Trustpilot review explicitly calls out withheld pricing and pressure tactics).
- Be careful not to overclaim "zero to hero" guarantees of passing — Aviation Hero already claims a 94% first-attempt pass rate; any pass-rate claim you make must be real and trackable from day one (track it from your first cohort of buyers), not aspirational marketing copy.
- Honest positioning line for the site: fixed price, everything included, no consultation required, refund/guarantee policy stated plainly (decide this before launch — it will be one of your strongest trust signals against the opaque-pricing competitors).

## Open risks to carry forward

- **Legal**: the §5 UrhG "amtliches Werk" status of the Fragenkatalog is a reasonable inference, not a confirmed precedent — get real legal sign-off before launch, not after.
- **Market size**: no verified annual PPL(A)/BZF candidate count in Germany — open the LBA Excel file or request data directly from BNetzA/LBA before betting the business plan on a specific TAM number.
- **Crowded field**: several competitors already do "free questions + paid structured course" (bzf-kurs.de is the closest analog) — differentiation must stay sharply focused on transparent pricing + production quality, not on being the only online BZF course.
- **Content accuracy liability**: BZF content is safety-relevant (real radio phraseology used in real cockpits) — the single external audit pass is the agreed minimum bar; don't skip it under launch-date pressure.

## Next steps

1. Get the lawyer's opinion on Fragenkatalog/phraseology reuse rights (can start immediately, independent of everything else).
2. Draft full content outline module-by-module from the official sources above.
3. Write/produce the actual lessons, quizzes, and radio-sim scenarios.
4. Commission the external instructor/BZF-holder review pass.
5. Once content + legal + audit are done, proceed to the platform build (course delivery site, payments, video hosting, quiz engine, user accounts) using the feasibility answers below as a starting point.

---

## Platform Feasibility Q&A (pre-build decisions)

These answer the practical questions raised before committing to building: can this be built and run cheaply, can content be managed without touching code, and what does storage actually cost. Figures below were checked against current (September 2026) vendor pricing pages and third-party pricing trackers — treat exact numbers as directional, since providers change pricing without much notice, and re-verify before finalizing a budget.

### 1. Can this be built with just Claude Code + GitHub + a domain?

**Claude Code and GitHub get you the code and version control — they don't get you a running, paying platform on their own.** You will need a small number of paid or freemium hosted services regardless of how the code is written, because "accepting payments" and "serving video to strangers on the internet" both require infrastructure that isn't a code repository:

| Need | Typical choice | Cost reality |
|---|---|---|
| App hosting (the Next.js/web app itself) | Vercel, Railway, Render, or a VPS | Vercel's Hobby tier is free but **contractually forbids commercial use** — a paid course site needs Vercel Pro (~$20/user/month), or a commercial-friendly alternative like Railway/Render (small paid tier, often $5–20/month at low traffic) |
| Database | Supabase, Neon | Free tier is real and usable at launch scale (Supabase: 500MB DB, 5GB egress, 50k monthly active users free); Pro tier ~$25/month once you outgrow it or want backups/no pausing |
| Payments | Stripe | No monthly fee, but an unavoidable per-transaction cut: **~1.5% + €0.25 per domestic EU card payment**, higher for non-EU cards or currency conversion. This scales with revenue, not a fixed cost |
| Video hosting/streaming | Bunny Stream, Mux, or Cloudflare Stream | Not free at any real scale — see storage section below, this is usually the largest recurring line item |
| Transactional email (receipts, password reset) | Resend, Postmark | Free tiers (typically 100–3,000 emails/month) comfortably cover early-stage volume |
| Domain | Any registrar | ~€10–20/year for a .de or .com |
| SSL | Included free by virtually every host above | €0 |

**Bottom line:** it's realistic to launch on **mostly free tiers plus two unavoidable paid pieces** — a commercial-tier app host (~€20/month) and Stripe's per-transaction cut (no fixed fee, just a percentage of what you sell) — plus modest video hosting costs once real course videos are live. A defensible early estimate is **roughly €30–80/month in fixed infrastructure** before video volume grows, with Stripe's ~1.5–2% coming out of revenue on top. "Only Claude Code + GitHub + a domain" is not sufficient on its own; those two extra recurring costs are the real minimum to be a functioning, payment-accepting platform.

### 2. Can we build a CMS so you can edit content without touching code?

Yes, and this is a normal, well-supported thing to build. Two viable paths:

- **A custom-built admin panel**, tailored exactly to your content model (modules → chapters → lessons → quiz questions → video blocks), built directly into the app behind an admin login. This is likely the better fit here because your content structure is specific (theory modules, the official question bank, radio-sim scenarios, exam-simulation mode) rather than generic blog-style content — a purpose-built admin UI (forms to add/edit/reorder modules and questions, upload video, publish/unpublish) can be built as part of the platform work itself, no extra vendor.
- **A headless CMS** (Payload CMS or Strapi, both free/open-source, self-hosted for the cost of hosting only — roughly €10–25/month on top of what you're already paying; Sanity is the managed alternative but charges per-seat, ~$15/editor/month, once you outgrow its free tier) integrated with the app. This buys a more polished editing UI out of the box at the cost of an extra system to maintain.

**Recommendation to carry into the platform build:** start with a custom admin panel scoped tightly to your content model — it avoids adding a whole extra platform dependency for something a handful of CRUD screens can do, and keeps costs at €0 beyond hosting you already need. Revisit a headless CMS only if content editing needs (multiple non-technical editors, rich media workflows) outgrow a custom panel later.

### 3. Where does content and the database live, and does it cost money?

Two different things, stored in two different places:

- **Structured data** (user accounts, course progress, quiz scores, purchase records, the question bank text itself) goes in a **relational database** — e.g., Supabase (managed Postgres). Free tier covers early-stage volume (500MB storage, 50k monthly active users); this is very unlikely to be your cost driver.
- **Video and other large media** does **not** belong in the database — it goes in **object storage / a video-streaming service**, separate from the database, because video is large and needs to be streamed efficiently (adaptive bitrate, CDN delivery) rather than served as a raw file. Realistic options and current pricing:
  - **Bunny Stream**: storage ~$0.005/GB/month, delivery from ~$0.01/GB, transcoding included — currently the cheapest purpose-built option for a video-heavy course site.
  - **Mux**: storage $0.015/GB/month + $0.009/minute streamed — polished developer experience, costs more at scale than Bunny.
  - **Cloudflare R2** (for non-video files, or DIY video): storage $0.015/GB/month with **no egress/bandwidth fees**, which is unusual and valuable since bandwidth is normally where costs balloon — but you'd need to pair it with your own video player/transcoding rather than getting that built-in like Bunny/Mux provide.

**Yes, storage costs money**, but it scales with how many video-hours you produce and how many students stream them, not with a flat "platform" fee — a small early-stage course library (a few hours of video, a few hundred students) plausibly runs **€20–60/month** on a service like Bunny Stream, growing as the video library and student base grow. This is very likely to become your largest infrastructure line item over time, well ahead of database or app-hosting costs, so it's worth deciding on a video-hosting provider early rather than improvising with generic file storage.

Sources: [Stripe fee guide for Germany](https://www.feecalcpro.com/blog/stripe-fees-germany-guide/), [Supabase pricing 2026](https://uibakery.io/blog/supabase-pricing), [Vercel pricing and commercial-use terms](https://zplatform.ai/guides/is-vercel-free/), [Cloudflare R2 pricing](https://egresscost.com/cloudflare/), [Bunny Stream pricing](https://dev.to/nayankyada/bunny-stream-pricing-2026-free-trial-limits-storage-costs-when-to-upgrade-2j56), [Mux pricing comparison](https://dev.to/nayankyada/sanity-video-hosting-in-2026-mux-vs-cloudinary-vs-bunny-stream-5bh), [Payload/Strapi/Sanity pricing comparison](https://dev.to/nayankyada/sanity-vs-payload-cms-vs-strapi-pricing-comparison-2026-1e71).

**Update after the content structure was designed** (see [COURSE-STRUCTURE-DETAILED.md](COURSE-STRUCTURE-DETAILED.md)): the course was deliberately designed to be video-light and audio/text/quiz-heavy — total video across all 11 modules comes out to roughly **55 minutes**, not multiple hours, because most phraseology/dialogue content is genuinely better taught as audio-only (it mirrors the real exam, which is 100% audio) than as video. At ~8–12MB/min of compressed video, that's only ~500–650MB of video for the entire course — the €20–60/month video-hosting estimate above should be read as a conservative ceiling, not the likely actual cost; real early-stage video storage/bandwidth cost is likely closer to single-digit euros per month until the student base is large.

### 4. Shopify (~$27–36/month all-in-one) vs. a custom build — is it cheaper?

**No — the $27–36/month headline is not the real cost, and Shopify is a weaker fit than either a custom build or a dedicated course platform.** Shopify has **zero native course/LMS functionality**; every course seller on Shopify runs a paid third-party app on top, and none of them are included in the base plan fee:

- **Real total cost stacks up fast**: Shopify Basic (€27–36/mo) + a course app (Tevello ~$29/mo flat, or Chapters LMS's 5%-of-sales-capped-at-$29/mo, or Uplinkly $19–49/mo) realistically lands at **~€55–65/month**, not €27. Scaling to the Grow plan (needed once you want staff accounts) pushes this to **~€100–180/month**.
- **Payment processing is worse than the custom-build plan, not better**: Shopify's own processor ("Shopify Payments") runs ~2.1–2.9%+€0.30 on the Basic plan. If you want to use Stripe directly instead, Shopify charges you an *extra* 2.0% surcharge on top of Stripe's own fee for not using their processor — there is no way to get "Shopify hosting + plain Stripe rates" the way the custom-build plan gets.
- **Video hosting cost doesn't go away.** Shopify's native file storage caps at 1GB/~10min per video and has no chaptering, adaptive streaming, or resume support — every course app either requires you to bring your own external video host (Vimeo/Bunny, same as the custom-build plan) or bundles its own metered CDN that's typically *more expensive per GB* than Bunny Stream directly. Shopify does not solve the video-cost question; it just adds a vendor in front of it.
- **UI/UX control is the biggest sacrifice.** Shopify is fundamentally a product/cart/checkout storefront with courses bolted on via an app's own embedded interface — the actual learning experience (what students are paying €300–450 for) ends up capped by whatever that third-party app's roadmap allows, not by your own design. Several of the named course apps (Chapters LMS, Uplinkly) are new or thinly reviewed, which is a real risk to build a paid product's core delivery mechanism on.
- **If the actual goal is "all-in-one, minimal engineering," a dedicated course platform is a more honest comparison than Shopify**, since course delivery, quizzes, drip content, certificates, and video bandwidth are native there rather than bolted on: **Thinkific Start (~€79/mo)** or **Podia Shaker (~$84/mo)** both include everything needed at 0% platform transaction fee, with no second app-vendor relationship. Teachable's Builder tier ($69/mo) is comparable and reportedly acts as merchant of record for EU VAT (verify directly with Teachable before relying on this).

**Recommendation: stick with the custom build already planned** (Next.js/Supabase/Stripe/Bunny Stream + a purpose-built admin panel). Given the content structure just designed is genuinely lightweight on video (~55 minutes total, per the update above), the custom build's cost advantage over both Shopify+app and a dedicated course platform grows rather than shrinks — none of the all-in-one options save meaningful money here, and all of them cap the product experience more than building it directly.

Sources: [Shopify pricing 2026](https://www.shopify.com/pricing), [Shopify Payments fees](https://what.digital/shopify-payments-fees/), [Tevello Courses app](https://apps.shopify.com/courses-app), [Chapters LMS](https://apps.shopify.com/chapters), [Shopify video upload limits](https://community.shopify.com/t/how-can-i-upload-a-90mb-video-file-exceeding-the-20mb-limit-on-my-store/186211), [Thinkific pricing](https://www.thinkific.com/pricing/), [Teachable pricing](https://teachable.com/pricing), [Podia pricing](https://www.podia.com/pricing).
