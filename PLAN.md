# Zizi Offers - delivery plan

Status reflects work actually completed in `C:\ziziwebsite\zizi-offers`. User decisions override older planning notes.

| Phase | Work | Completion evidence | Status |
|---|---|---|---|
| 1 | Inspect folder, Node/npm/Git, preserve existing files | Existing Next app found; Git clean before archive merge; Node/npm/Git checked | Completed |
| 2 | Scaffold or repair Next.js setup in existing folder; install UI dependencies | Existing app uses Next.js App Router, TypeScript, Tailwind CSS, ESLint, `src/`, `@/*`; required UI dependencies installed | Completed |
| 3 | Merge supplied AGENTS/DESIGN/reference; write actual README and env example | Archive extracted; `AGENTS.md`, `DESIGN.md`, `PLAN.md`, `START-HERE.md`, and `docs/zizi-website-reference.md` integrated; `.env.example` placeholders only | Completed |
| 4 | Prepare asset directories and registry from actual delivered files | Stage 2 inventoried actual files in `public/assets`, recorded dimensions/public paths, created typed asset registry, and listed missing/ambiguous mappings | Completed |
| 5 | GitHub private repository and initial push when instructed | Explicitly authorized for Stage 1; pending available repo creation/push path | Pending |
| 6 | Vercel linked deployment when instructed | Explicitly authorized for Stage 1; pending GitHub repo or available Vercel import path | Pending |
| 7 | Prepare Firebase project/web app and Cloudinary when instructed | Deferred; do not integrate in Stage 1 | Pending |
| 8 | Home, tests and one offer details page | Stage 3 first pass built `/`, `/tests`, and `/offers/emotional-communication`; later superseded visually by the public redesign branch | Completed |
| 9 | Public category pages and revised visual direction | Redesign branch builds `/`, `/tests`, `/coaching`, `/courses`, `/programs`, `/sessions`, `/fingerprints`, `/compass`, and `/offers/emotional-communication` without booking UI | In progress |
| 10 | Admin frontend prototype | Deferred; prototype saves must be labeled non-durable before backend integration | Pending |
| 11 | Auth, Firestore, signed media uploads | Deferred; no secrets committed | Pending |
| 12 | Final content review and deployment when instructed | Deferred | Pending |

Customer accounts, calendar, payments, private feedback, start dates, compass PDF, and AI-generated test results remain deferred.

## Stage 1 notes

- Existing starter page is acceptable for this stage.
- The supplied reference is now the content source; do not invent missing prices, availability, descriptions, qualifications, or media.
- Future implementation should begin with local typed data and a data service boundary that can later be replaced by Firestore.
- Admin UI, when built, starts as a prototype unless and until durable storage and authorization are connected.

## Stage 2 notes

- Local feature branch: `stage-2-assets-content`.
- Actual assets found: coaching 8, codes 4, compass 6, courses 8, etho 51, programs 10, spectra 12, triad 1, zizi 1.
- Empty sections: fingerprints, mindsets, sessions, tests.
- `src/data/assets.ts` is generated from actual filenames, extensions, dimensions, and public paths.
- `src/data/offers.ts` keeps offer/content data separate from React components and preserves unknown price/availability behavior.
- Sessions/consultations were updated from the Stage 2 supplied price list. The previous legacy session paragraph is superseded.
- Stage 2 remained local until the user later explicitly authorized push and Vercel deployment.

## Stage 3 notes

- Local feature branch: `stage-3-design`.
- Completed first visual implementation only: homepage, tests page, and emotional communication offer details page.
- Homepage uses RTL layout, light/dark theme toggle, approved hero text, desktop category spread animation, mobile category grid, approved about text, original artwork previews, and an honest booking-unavailable state.
- Tests page follows the approved order: codes, etho, mindsets, spectra, triple test.
- Codes include accessible reveal/back flip cards, original A/B/C/D images, and image zoom.
- Etho includes carousel controls, search by names and aliases, and a grid using the 51 actual animal assets while preserving delivered filenames including `ذيب.jpg`.
- Mindsets use text tabs only. Spectra uses the 12 registered geometric images. Triple displays the full `الميولات-السوكيه.jpg` image and a `متاح` badge without added explanatory text.
- Emotional communication details use the registered original image, approved topics, group format, capacity 10, USD 100 per seat, and available status. No duration, start dates, remaining seats, or outcomes were invented.
- No Firebase, Cloudinary, customer accounts, admin pages, payments, calendars, push, merge, or deployment were done in Stage 3.

## Stage 3 redesign notes

- Local feature branch: `stage-3-redesign-public`.
- The earlier visual direction with large header, booking/status panels, and limited page scope is superseded for the public frontend.
- Homepage now centers the one-line title `عروض زيزي`, keeps category bubbles around the title on desktop, uses a mobile category grid, includes approved about text, section cards, and selected offer previews.
- Public category pages added locally: `/coaching`, `/courses`, `/programs`, `/sessions`, `/fingerprints`, and `/compass`.
- Tests page remains in the exact order: الأكواد → الإيثو → العقليات → الأطياف → الثلاثي. It now uses a fan carousel for الإيثو, the supplied `العقليات.jpg` with text tabs, animated tabs for الأطياف, and the triple image with only the `متاح` badge.
- Customer-facing booking controls, booking-unavailable panels, development labels, and placeholder image text were removed.
- No push, merge, GitHub update, Vercel deployment, Firebase, Cloudinary, customer accounts, admin pages, payments, calendars, or start-date fields are authorized in this redesign stage.
