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
| 12b | Latest owner refinements | Plant coaching bubble, uncropped offer images, coaching format filters, physical-left prices, swipeable homepage rows, compass package note, code layout, Etho slow autoplay, verify and push feature branch | In progress |
| 12c | Implementation correction pass | Fix Etho continuous motion/search, desktop mindset layout, centered test badges, coaching variant status data, mobile metadata, compass/home media, code-card geometry, docs and verification | In progress |
| 13 | Admin frontend prototype | Deferred; prototype saves must be labeled non-durable before backend integration | Pending |
| 14 | Auth, Firestore, authenticated media uploads | Backend Stage 1 implemented on `backend-stage-1`: trusted-claim login/admin APIs, validated durable offers, restrictive rules/tests, Cloudinary uploads, provisioning and idempotent migration tooling. Live credential checks, claim grant, rules deployment and cloud migration remain pending environment access. | In progress |
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

## Latest refinement notes

- Homepage preview collections return to horizontal swipeable rows for all sections, while the dedicated coaching page keeps a two-card grid.
- Coaching page adds accessible `جماعي` and `فردي` filters that use actual variants or clear group facts; unknown-format offers are not forced into a filter.
- The coaching hero bubble uses a small plant icon. Programs use the green accent and emotional compass uses the purple accent.
- Compass package price is shown once beneath the section heading, not as a standalone card. Individual compass pricing remains a section note.
- Offer/test prices are positioned on the physical left while preserving RTL reading flow.
- Code cards use the requested physical arrangement: A top-left, B bottom-left, C top-right, D bottom-right.
- Etho autoplay is slower, keeps Start/Stop, pauses during interaction/off-screen/reduced motion, and preserves direct dragging/search/view-all.

## 3 October implementation correction notes

- Etho carousel is being corrected from interval-based card jumps to one measured continuous transform, using local animal data and explicit aliases for wolf spellings.
- Coaching data now carries per-variant availability for individual/group options. Public cards must display meaningful variant information and must not use the generic `متعدد` badge.
- Latest owner decisions supersede prior session/course/coaching notes: `جلسة استشارية` is unavailable at 40$, `السؤال الصح في الوقت الصح` is the course title, and `الولوج لميدان العمل` is individual-only with unknown price.
- Public copy flagged by the owner is removed rather than replaced with similar planning language.

## 3 October complete correction pass

- Replaced the competing Etho CSS marquee/JavaScript motion with one JavaScript-managed offset, preserving slow right-to-left autoplay, explicit Stop/Start, temporary pause during drag/search/viewer/hidden/off-screen states, and reduced-motion behavior.
- Etho search now centers the first matching animal while keeping the full collection navigable; wolf aliases remain local and explicit.
- The Etho expanded grid uses actual animal assets with compact uncropped cards. Clicking any visible animal opens the shared full-screen viewer at that item and keeps the grid open on close.
- Added one shared accessible image viewer for Etho carousel/grid and offer artwork collections on the homepage and category pages. It supports close, arrows, Escape, swipe, scroll lock, and focus return.
- Offer artwork on homepage previews and category pages now favors intrinsic aspect ratio, subtle borders, and complete uncropped images. Coaching, courses, and programs use two-card grids on dedicated pages.
- Added inner-page back navigation with in-site history fallback and a compact current-page category menu.
- Dark mode received restrained category-tinted surfaces and ambient backgrounds without dimming text.
- Independent Playwright verification on the production server passed for responsive overflow, code-card flip, Etho autoplay/stop/search/grid/viewer, and coaching image viewer. The existing dev server on port 3000 was found to serve a non-hydrated stale session; production server on port 3001 hydrated correctly.

## 3 October latest owner corrections pass

- Code cards now preserve the delivered 578 by 1280 artwork ratio with no top/bottom padding on the revealed image face.
- Category titles, compass pricing, offer cards, and responsive grids were tightened so content drives height and mobile uses compact two-column collections where requested.
- Header navigation now keeps `الرئيسية` as a Home control and uses a separate Back control plus a mobile category dropdown.
- Mindsets uses a larger physical-left image on desktop with top-aligned text. Spectra, triple, compass, and offer images stay uncropped and zoomable.
- The shared image viewer now supports zoom in, zoom out, reset, pinch, pan while zoomed, keyboard arrows, Escape, and mobile swipe when fitted.
- Compass cards are image-only on the homepage and compass page; captions remain available through accessible labels and the full-screen viewer.
- All program-category offers are marked `غير متاح` per the latest owner correction.
- Browser verification covered desktop/mobile `/tests`, `/compass`, `/programs`, and `/`; typecheck, lint, and production build passed before committing.

## 4 October remaining layout correction pass

- Diagnosed live computed styles before editing. Root causes were stale code image dimensions in the registry, obsolete coaching desktop split-card CSS, mobile hero bubbles expanding the RTL root scroll canvas, fixed homepage carousel item widths, and compass grid/image rules inherited from earlier large-card passes.
- Corrected code image registry dimensions from actual delivered files: `A.jpg` 578x815, `B.jpg` 578x816, `C.jpg` 578x816, and `D.jpg` 578x817. Code card faces now use the actual image ratio, and an icon-only `فتح الصورة` control opens the shared full-screen viewer without flipping the card back.
- Dedicated compass page now uses right-aligned pricing under the heading and a centered modest image gallery: one centered image per mobile row, four emotion cards at desktop width, and five on wide screens.
- Coaching and programs category pages now keep normal card flow with two mobile columns, three medium columns, and four wide columns. Metadata remains inside each card.
- Homepage rows remain horizontal and swipeable; row/item containment prevents card widths from expanding the page. Mobile hero category links now use an in-flow grid to avoid RTL horizontal scroll.
- Browser verification covered 360, 390, 768, 1024, and 1440px for `/`, `/compass`, `/coaching`, `/programs`, and `/tests`; typecheck, lint, and production build passed before committing.

## 4 October booking contact and focused UI correction pass

- Latest owner decision supersedes the earlier "omit booking" note only for contact-based booking: homepage CTA now reads `احجزي الآن` and scrolls to `#booking-contact`; no checkout, calendar, payment SDK, or auto-message flow is added.
- Header arrangement is now physical-right Home icon, centered selected-page dropdown, and physical-left theme toggle plus lean Back chevron. Back uses in-site history with scroll restoration and falls back to home on direct visits.
- Offer artwork and shared zoomable images show a visible corner expand icon, keep original artwork uncropped, and remove CSS-created padded bands above homepage/card images.
- Added the booking-contact section near the bottom of the homepage with country-only Telegram buttons for السعودية، الكويت، المغرب، الإمارات and informational Visa/PayPal text labels.
- Page-title frames and homepage fingerprint cards were tightened to avoid oversized decoration, overlap, and document-level horizontal overflow.
- This pass is authorized for commit and push to the working feature branch only; it does not authorize merge to `main`, production deployment, Firebase, Cloudinary, accounts, calendars, or payment processing.

## 5 October focused owner update pass

- Mindset data now uses the exact owner-provided copy with the order المرتاح، الصواب، الفوز، المحبوب and المرتاح selected first. The UI renders one heading and one verbatim body per mindset.
- Header remains sticky and keeps the approved physical layout. The centered page dropdown now closes on selection, outside click, and Escape while preserving Back scroll restoration.
- Hero now shows two buttons on mobile and desktop: `استكشفي العروض` to the offer sections and `احجزي الآن` to booking contact. The compass bubble is moved into the upper available hero space without redesigning the hero.
- Homepage offer images continue to use original artwork with natural proportions, no crop, no stretch, and no forced shared height.
- This pass is authorized for commit and push to the working feature branch only; it does not authorize merge to `main` or production deployment.

## 9 October admin offer editor

- Reorganized the existing dashboard into offer details, a unified optional image upload, conditional format/pricing, optional metadata, and explicit draft/publish actions. The public header is hidden on admin routes; public catalogue pages retain their current design and local content source.
- New drafts get stable UUID-based IDs and an order after existing records. Existing IDs, local images, descriptive durations, per-variant availability, and custom package IDs are retained. Format switching retains temporarily hidden standard slots and warns about removals at save time.
- Live preview reuses OfferCard and its formatting helpers. Image upload has preview, removal, replacement, pending feedback and retry; failed or pending uploads block saving until resolved. The signed admin upload endpoint remains the upload path and old Cloudinary assets are not deleted.
- Admin list reads the same server collection as writes and sorts after fetching so records missing displayOrder are included. Failed list loads show an error and unknown counters rather than a successful zero. Saves retain selection and update the list and counters.
- Server schema accepts package variants and an optional delivery field without a destructive migration. The dry-run migration mapper now retains all existing packages and uses general pricing where a format does not apply. No migration was applied. Larger package writes use the existing authenticated server API; the existing two-variant limit on direct Firestore client writes is retained, with nested price validation added.
- Verification: lint, typecheck and production build passed; 23 editor/API/upload fixture tests and 9 Firestore emulator rules tests passed. Browser fixtures checked desktop/mobile layout, format switching, free/general pricing, group capacities, failed saves, duplicate submissions/uploads, image failure/retry/removal, existing local images, package retention, reload and list/counter errors. Screenshots are in ignored .verification/admin-desktop.png and admin-mobile.png.
- No Firebase/Cloudinary credentials were provided. Live admin login, live durable save/reload and real signed uploads were not tested. No live offer data, admin claims, deployed rules or public content source were changed. Cloud install/start instructions and missing variable requirements were saved as a configuration draft for review and publication.

## 10 October published catalogue and legacy review

- Implemented a single request-scoped published Firestore reader used by homepage/category/filter/detail surfaces, plus saved cards inside specialized test/compass pages. Public source activation remains gated behind a reviewed complete legacy inventory and the explicit PUBLIC_OFFERS_SOURCE setting; production remains local pending owner review.
- Added immutable first-publication ordering, explicit route invalidation, saved delivery-mode filtering, optional card badges and wider dashboard list wrapping. Removed the numeric ordering input while retaining legacy order internally.
- Prepared a read-only dry-run and private export/missing-only importer with conflict reporting, per-run recovery manifests and guarded activation. Inventory contains 48 local offers (8 tests, 10 coaching, 14 programs, 8 courses, 6 sessions, 2 compass pricing records); supporting illustrations/fingerprints are not paid products. Database counts/conflicts remain unknown because server credentials are absent. No bulk import ran.
- Verification: 35 local fixture tests and 11 actual Firestore emulator tests passed; lint/typecheck/build and desktop/mobile published-fixture RTL checks passed. Live backend and two-tab persistence checks remain pending credentials and reviewed activation. See docs/published-catalog.md for commands and limitations.

## 10 October Cloudinary catalog migration preparation

- Verified that the earlier catalog work is already merged at checkout HEAD e6e9f72; preserved the existing application and public design.
- Added a read-only comparison and guarded original-image upload/draft-only importer, reusing the current mapper and schema. Added stable hash asset IDs, path mapping, full editable-field/different-ID match checks, private backups and atomic create-only import manifests.
- Local inventory verified: 48 candidate records, 58 price options, 103 original images, 51 supporting Etho animals, no missing/unregistered files. Live counts and remote asset reuse remain unknown because no Firebase Admin/Cloudinary credentials are available.
- Documented supporting-content editors, metadata preservation and empty-catalog handling needed before activation. No live writes, uploads, source switch, push or deployment occurred.
- Lint, typecheck, build, 39 local tests and production HTTP content checks passed. Rules suite did not execute: emulator artifact download was rejected with network HTTP 403. Saved reusable cloud setup/start instructions and configuration requirements for review; live setup and publication remain pending.
- See docs/catalog-migration-review.md and docs/catalog-migration-inventory.json for the concrete review and later commands.
