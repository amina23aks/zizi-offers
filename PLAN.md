# Zizi Offers - delivery plan

Status reflects work actually completed in `C:\ziziwebsite\zizi-offers`. User decisions override older planning notes.

| Phase | Work | Completion evidence | Status |
|---|---|---|---|
| 1 | Inspect folder, Node/npm/Git, preserve existing files | Existing Next app found; Git clean before archive merge; Node/npm/Git checked | Completed |
| 2 | Scaffold or repair Next.js setup in existing folder; install UI dependencies | Existing app uses Next.js App Router, TypeScript, Tailwind CSS, ESLint, `src/`, `@/*`; required UI dependencies installed | Completed |
| 3 | Merge supplied AGENTS/DESIGN/reference; write actual README and env example | Archive extracted; `AGENTS.md`, `DESIGN.md`, `PLAN.md`, `START-HERE.md`, and `docs/zizi-website-reference.md` integrated; `.env.example` placeholders only | Completed |
| 4 | Prepare asset directories and registry from actual delivered files | Section folders prepared; no originals supplied in the archive; registry records missing originals as pending without fake paths | Completed for setup; pending actual media |
| 5 | GitHub private repository and initial push when instructed | Explicitly authorized for Stage 1; pending available repo creation/push path | Pending |
| 6 | Vercel linked deployment when instructed | Explicitly authorized for Stage 1; pending GitHub repo or available Vercel import path | Pending |
| 7 | Prepare Firebase project/web app and Cloudinary when instructed | Deferred; do not integrate in Stage 1 | Pending |
| 8 | Home, tests and one offer details page | Deferred until next stage | Pending |
| 9 | Remaining public pages | Deferred | Pending |
| 10 | Admin frontend prototype | Deferred; prototype saves must be labeled non-durable before backend integration | Pending |
| 11 | Auth, Firestore, signed media uploads | Deferred; no secrets committed | Pending |
| 12 | Final content review and deployment when instructed | Deferred | Pending |

Customer accounts, calendar, payments, private feedback, start dates, compass PDF, and AI-generated test results remain deferred.

## Stage 1 notes

- Existing starter page is acceptable for this stage.
- The supplied reference is now the content source; do not invent missing prices, availability, descriptions, qualifications, or media.
- Future implementation should begin with local typed data and a data service boundary that can later be replaced by Firestore.
- Admin UI, when built, starts as a prototype unless and until durable storage and authorization are connected.
