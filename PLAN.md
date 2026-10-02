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
| 9 | Public category pages and revised visual direction | Redesign branch builds `/`, `/tests`, `/coaching`, `/courses`, `/programs`, `/sessions`, `/fingerprints`, `/compass`, and `/offers/emotional-communication` without booking UI | Completed |
| 10 | Visual refinement from latest review | Local branch refines hero bubbles, category cards, tests interactions, compact media sizing, animated icons, and registers the newly supplied religious-program image | Completed |
| 11 | Latest corrections: overflow, homepage rows, tests data, prices | Local branch applies mobile overflow fixes, homepage offer carousel sections, updated test/coaching/session data, no USD labels, and compass installment removal | In progress |
| 12 | Final copy/layout corrections and GitHub push | Remove unwanted copy and extra tests section, update homepage test cards, mobile two-column cards, image containment, Etho centering, verify and push feature branch | In progress |
| 13 | Admin frontend prototype | Deferred; prototype saves must be labeled non-durable before backend integration | Pending |
| 14 | Auth, Firestore, signed media uploads | Deferred; no secrets committed | Pending |
| 15 | Final content review and deployment when instructed | Deferred | Pending |

Customer accounts, calendar, payments, private feedback, start dates, compass PDF, and AI-generated test results remain deferred.

## Stage 1 notes

- Existing starter page is acceptable for this stage.
- The supplied reference is now the content source; do not invent missing prices, availability, descriptions, qualifications, or media.
- Future implementation should begin with local typed data and a data service boundary that can later be replaced by Firestore.
- Admin UI, when built, starts as a prototype unless and until durable storage and authorization are connected.

## Stage 2 notes

- Local feature branch: `stage-2-assets-content`.
- Actual assets found during Stage 2: coaching 8, codes 4, compass 6, courses 8, etho 51, programs 10, spectra 12, triad 1, zizi 1.
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
- Emotional communication details use the registered original image, approved topics, group format, capacity 10, 100$ per seat, and available status. No duration, start dates, remaining seats, or outcomes were invented.
- No Firebase, Cloudinary, customer accounts, admin pages, payments, calendars, push, merge, or deployment were done in Stage 3.

## Stage 3 redesign notes

- Local feature branch: `stage-3-redesign-public`.
- The earlier visual direction with large header, booking/status panels, and limited page scope is superseded for the public frontend.
- Homepage now centers the one-line title `عروض زيزي`, keeps category bubbles around the title on desktop, uses a mobile category grid, includes approved about text, section cards, and selected offer previews.
- Public category pages added locally: `/coaching`, `/courses`, `/programs`, `/sessions`, `/fingerprints`, and `/compass`.
- Tests page remains in the exact order: الأكواد → الإيثو → العقليات → الأطياف → الثلاثي. It now uses a fan carousel for الإيثو, the supplied `العقليات.jpg` with text tabs, animated tabs for الأطياف, and the triple image with only the `متاح` badge.
- Customer-facing booking controls, booking-unavailable panels, development labels, and placeholder image text were removed.
- No push, merge, GitHub update, Vercel deployment, Firebase, Cloudinary, customer accounts, admin pages, payments, calendars, or start-date fields are authorized in this redesign stage.

## Stage 3 visual refinement notes

- Local feature branch: `stage-3-visual-refine`.
- Latest visual instructions supersede the earlier Stage 3 layout where they conflict.
- Registered the newly supplied `public/assets/programs/الدينيه.jpg` original and mapped it to the religious programming offer.
- Homepage was tightened around a central one-line title with category bubbles visible around it on desktop and mobile, approved about text, and compact section cards.
- Tests page was refined to use compact code cards, a fan-only Etho carousel with search and view-all, text tabs for mindsets, animated tabs for spectra, and a final section titled `الاختبارات النفسية للميولات السلوكية`.
- No push, merge, GitHub update, Vercel deployment, Firebase, Cloudinary, customer accounts, admin pages, payments, calendars, or start-date fields are authorized in this refinement stage.

## Stage 3 latest-corrections notes

- Local feature branch: `stage-3-latest-corrections`.
- Preserved locally modified code-card originals `public/assets/codes/A.jpg` through `D.jpg`.
- Homepage now uses stacked category sections with contained horizontal rows instead of generic category squares.
- Mobile overflow fixes focus on contained carousel rows, min-width controls, centered hero coordinates, and compact page gutters.
- Prices render as `12$`, `95$`, etc.; unknown remains `00` plus `السعر غير محدد`; explicit free renders `مجاني`.
- Tests page now shows requested availability/prices, approved mindset copy with show more/less, extra free tests, and confirmed behavioral-inclination prices.
- Compass installment text was removed; programs accent is green and compass accent is purple.
- Course duplicate/free ambiguity remains unresolved: owner mentioned `دورة تخصص` as free, but the confirmed course remains `دورة اختيار التخصص` at 20$ until clarified.
- No push, merge, GitHub update, Vercel deployment, Firebase, Cloudinary, customer accounts, admin pages, payments, calendars, or start-date fields are authorized in this correction stage.

## Final corrections notes

- Remove homepage supporting copy, mobile hero CTA, section-level repeated `عروض زيزي`, and the public `اختبارات إضافية` section.
- Homepage test overview cards use owner-supplied descriptions and all four main tests show 12$ where requested, including `اختبار الطيف`.
- Coaching, courses, and sessions use two-card mobile grids on homepage collections and category listings.
- Program-category offer labels use singular `برمجة`; named offers such as `برنامج التصالح مع الذات` remain unchanged.
- Offer artwork must use contained images with preserved aspect ratios; photo-free session cards remain compact.
- Final corrections are authorized for commit and push to the feature branch only; no merge to `main` and no manual production deployment.
