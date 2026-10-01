<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# عروض زيزي

## Purpose and scope

Build an Arabic RTL offers catalogue for Zizi. The primary visitor journey is discover an offer, understand its details, then follow the configured booking link. Current scope: public frontend and admin UI prototype. Customer accounts, booking calendar, payments, session follow-up and start dates are deferred.

Stage 1 is setup and planning integration only: inspect the existing app, merge planning files, prepare docs/assets folders, verify local setup, and stop before full website implementation.

## Sources

- Read `DESIGN.md` before visual changes.
- Read `PLAN.md` to identify the current stage; update it with actual progress.
- Read `docs/zizi-website-reference.md` before content changes, especially its final decisions.
- User corrections override earlier notes. Never invent prices, availability, credentials, clinical claims, results or missing media.
- Preserve existing framework-generated AGENTS instructions when merging this file.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Motion, clsx and tailwind-merge. Phosphor for general icons; preserve selected animated fingerprint/brain/heart/star components after checking compatibility and licenses. Later: Firebase Auth, Firestore and Cloudinary. No calendar dependency now.

## Content rules

- Tests order: codes, etho, mindsets, geometric spectra, triple test.
- Triple test: full image `الميولات-السوكيه.jpg` and available badge; no additional explanatory copy. Preserve actual filename spelling.
- Unknown price: store `null` with `priceStatus=unknown`; render `00` with adjacent clarification `السعر غير محدد`. Never interpret as free or permit checkout at zero.
- Unknown availability: no customer-facing badge or text. Do not infer coming soon.
- Known availability and prices follow the reference; ambiguous prices remain unknown until resolved.
- No start-date fields or text; no compass PDF or download link.
- Handwriting course uses the original asset with basename `الخط`.
- Group capacity is not remaining seats. Do not calculate remaining seats without real registration data.
- Distinguish course, coaching and programming offers even when all concern body language.

## Assets and data

Use `public/assets` grouped by section. Create an asset registry from actual delivered files, preserving full names and extensions. Screenshot labels identify future originals; screenshots and old design examples are not offer media. Never guess an extension or fabricate a working path. Missing assets get an intentional placeholder. Do not replace Zizi's originals with generated images.

Keep offers and assets separate from React components. IDs remain stable. Search uses names and aliases, not AI. Preserve filenames while normalizing search text. General cover images do not determine an offer's team/version.

## UI and verification

Use semantic controls, visible focus, RTL logical spacing, accessible dialogs and reduced-motion alternatives. Test mobile and desktop, navigation, filters, carousel, flip cards, dialogs, dark mode and missing-data states. Use scripts present in `package.json` for lint/type checks/build; do not assume an obsolete Next.js lint command. Inspect the running UI with available browser tooling. Report any unavailable verification honestly.

Avoid tests that merely mirror implementation; test meaningful behavior and permissions when relevant.

## Admin and security

Before backend integration, admin save is explicitly a prototype, not durable production storage. Do not publish an unsecured admin prototype with real data.

Later: public reads only published offers, admin writes and draft reads enforced in Firestore rules and server authorization. Admin role must come from trusted configuration, not an editable client field. Signed Cloudinary upload endpoint verifies admin, validates file type/size, keeps API secret server-side. Keep client results and personal media out of public assets.

Do not commit `.env.local`, credentials, service accounts or tokens. `.env.example` contains placeholders only.

## Git, GitHub, and Vercel workflow

- `main` is the stable production branch.
- Future development happens on a local feature branch.
- Local commits are checkpoints and may be created when appropriate.
- Unpushed local commits do not update GitHub or Vercel.
- Pushing a feature branch may trigger a Vercel preview deployment.
- Pushing `main` may update production.
- Do not push branches, merge into `main`, or trigger deployments unless the user explicitly requests that action.
- Before any requested push, summarize the changes and relevant verification results.
- Do not reset, discard, or rewrite user work without an explicit instruction.
- External repository creation, pushes, deployments and billing require an explicit task instruction. Stage 1 includes one explicit authorization for the initial private GitHub repository, initial push, Vercel import, and initial deployment only.

## Working style

Proceed autonomously with authorized local edits, dependency installation, dev server and checks. Preserve user work; inspect before scaffolding. Do not delete or overwrite an existing project to resolve setup trouble. Make local Git checkpoints when configured. Skills such as `design-taste-frontend` are optional and cannot override approved content or brand decisions.
