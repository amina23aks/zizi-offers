# Catalog migration review — 10 October 2026

Phase 1 only. No Cloudinary uploads, Firestore writes, public-source switch, rule deployment, push or production deployment occurred.

## Verified repository state and diagnosis

The checkout is on `work`, with HEAD `e6e9f72` (merge of PR #14). Reported commit `c561ef4` is already in its history; no branch integration is needed. The tree was clean before this work. Existing shared public reader, delivery filters, badges, ordering, invalidation, editor and authenticated upload endpoint were reused.

The dashboard GET reads the actual `offers` collection through authenticated Firebase Admin; it does not enumerate `src/data/offers.ts`. The public reader defaults to local data unless `PUBLIC_OFFERS_SOURCE=firestore`. The earlier missing-only migration was prepared but no live import is established by repository history. A dashboard screenshot or the presence of migration code does not establish imported records. The live collection cannot be inspected here because credentials are missing.

## Actual read-only result

Command, from `/workspace/zizi-offers`:

```sh
npx tsx scripts/catalog-migration.ts
```

| Category | Candidate records |
| --- | ---: |
| Tests | 8 |
| Coaching | 10 |
| Programs | 14 |
| Courses | 8 |
| Sessions | 6 |
| Compass pricing | 2 |
| Total | 48 |

There are 43 primary offers, 3 additional free-test records and 2 compass price options, with 58 total price options. Compass pricing is represented as two existing options; this does not assert two unrelated products. Duration and individual/group packages remain variants, not new offers. All proposed imports are drafts, including the additional tests; visibility must be reviewed before publication.

- Firestore current count, creates, skips and reconciliations: **unknown**, not zero. `databaseCompared=false`.
- 103 registered original images, all present, no unregistered image files under `public/assets`, no registry entries marked ambiguous; 103 distinct byte hashes.
- Upload versus remote reuse: **unknown**, because Cloudinary could not be queried. Worst case is 103 uploads; it is not a claim that 103 uploads are required.
- Supporting media: 51 Etho, 4 code cards, 12 spectra, 1 mindset cover, 6 compass, 1 triple-test, plus 8 coaching, 8 course, 11 program and 1 group-logo files. The group logo is not an offer or Zizi portrait. There are no delivered fingerprint files in the registry; missing portrait/fingerprint originals are intentional existing omissions, not fabricated paths.
- Four shared offer-image associations reuse one uploaded asset each: communication levels, SPA/spy, inner-child teams, body-language-program teams. Hash-based IDs also deduplicate identical bytes across different paths.
- `A.jpg` through `D.jpg` registry URLs have cache queries; those queries are retained in the path mapping and stripped only when opening the original file.
- Registry total size is 49,740,962 bytes (about 47.4 MiB); no file exceeds the dashboard's 10 MiB limit. No account quota was available to verify. Budget up to 103 upload/API lookups and that original storage volume, plus delivery bandwidth. This script requests no transformations. Compare remaining Cloudinary storage/API quotas and Firestore read/write allowances before live execution. Each comparison reads the entire existing offers collection; each newly created document costs one write. Backups here are local files.

The complete, reviewable approved-source inventory and supporting copy are in `docs/catalog-migration-inventory.json`. The private detailed report is `.verification/catalog-migration/dry-run.json` (ignored, mode 0600), with source records, proposed dashboard records, variants, assets, notes and service-comparison state. Do not commit future private reports containing Firestore records.

## Configuration still required

No relevant injected variables or `.env.local` were found. Scripts now use Next's existing environment loader, including `.env.local`, rather than assuming deployment-provider variables exist here. Never paste values into chat or Git.

Required for the read-only service comparison:

- `FIREBASE_ADMIN_PROJECT_ID` = `zizi-offers`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Use securely supplied server credentials with permission to list offers and Cloudinary resources for Phase 1. Future privileged import requires the trusted service account, not a client credential. Signing keys must be actual runtime secrets suitable for local signing, not proxy placeholder tokens. Configure client Firebase fields from `.env.example` separately for interactive admin login. No administrator claims were changed. Keep `PUBLIC_OFFERS_SOURCE=local`.

Required network destinations include `firestore.googleapis.com`, `oauth2.googleapis.com`, `api.cloudinary.com`, `res.cloudinary.com`; interactive authentication also needs `identitytoolkit.googleapis.com` and `securetoken.googleapis.com`. Emulator downloads need `storage.googleapis.com`. Environment settings contain the reusable setup draft; saved settings do not prove services are reachable or credentials valid.

## Prepared migration safety

The new script reuses `legacyInventory()` and the current dashboard Zod schema. It preserves null unknown prices, explicit free zero, variant IDs/prices/statuses, durations, capacities, saved ordering and original Arabic source data. It adds no historical publication timestamps or promotional badges. Original source fields unsupported by the dashboard are retained in the inventory and per-run source manifest rather than guessed from old reference notes.

Comparison checks full editable fields, plus potential different-ID title or slug matches. Such candidates are reconciliations and excluded from creates. Existing records, drafts, badges and ordering are never updated. A migrated Cloudinary image can be compared through its verified manifest mapping on subsequent runs. Any unresolved reconciliation blocks live actions; resolve it through a separately reviewed mapping/edit plan, then rerun the comparison. Do not re-enter the catalog manually.

Asset IDs use `zizi-offers/legacy-v1/<full SHA-256>`. Remote reuse requires matching original-byte hash context and byte count. Unknown service errors fail the comparison rather than being classified as missing assets. Uploads use original files, no crop/transformation, no overwrite, and write the secure URL/public ID/dimensions plus original paths, asset IDs, bytes, format and Cloudinary version to an incremental private manifest. Original files and prior remote assets are retained. New dashboard uploads already return the same camel-case `AdminOffer.image` model after server-side admin authorization, file-type and size checks; they do not delete old assets.

Imports only connect verified successful uploads. Validation precedes an atomic create-only batch; a concurrent document creation aborts that batch. Before live actions, all current records are privately exported, and the source/inventory is saved. The run manifest is written before commit and again afterward, so a lost response has a recoverable planned ID set. No existing record is overwritten, no publication flag is set, and no activation marker is written by this script.

## Editor and activation gaps that remain

All six offer categories exist in the dashboard. Supporting content does not: code-card Arabic copy and images, Etho names/aliases/gallery, verbatim mindset bodies/cover, spectra, compass gallery and fingerprint names/illustrations need a separate versioned content collection/editor with admin-only writes and published reads. Suggested grouping is one document per family, with stable item IDs/order and the same Cloudinary image references. Uploading these assets alone does not make their content editable or switch their rendered image references.

The current offer schema also lacks independent top-level availability, aggregate variant-price metadata, custom unknown-price clarification, slug/source and internal notes. The exact originals remain in the source manifest, but those fields are not independently editable. `editorPreview()` derives some values from variants; notably the triple test's top-level available badge and some mixed-mode availability need a compatible schema/rendering change before activation. `work-field-entry` has the specific clarification `السعر غير محدد بعد`. Do not silently lose it. Several internal notes retain uncertainty about values/coaching-level-2 pricing and SPA/SPi naming; current code values are the migration source, not older contradictory reference tables.

After activation, the existing public reader throws on fetch/validation failures and an absent migration marker, but a successful zero-document query still returns an empty list. Add explicit empty-catalog handling before activation. Existing activation checking uses a local inventory hash and does not prove supporting content has migrated. No public-design changes were made here. These are explicit prerequisites for the final target behavior, not claims of completion.

## Phase 2 proposal — commands for later review only

1. Configure credentials securely, rerun the read-only command and review actual counts, conflicts, media reuse and quota. Retain the local catalog. The script refuses a mismatched Firebase project.
2. After approving that report, use its `inventoryHash` as `<REVIEWED_HASH>` below. The hash changes when approved source content or original bytes change. The current local hash is `284b79887d117ed12446ed062722d900434d315ca11b69939762557f75a11c4a`.

```sh
cd /workspace/zizi-offers
# Only after review; creates private backup before uploads:
npx tsx scripts/catalog-migration.ts --upload --approve <REVIEWED_HASH>
# Recheck remote resources and database before importing drafts:
npx tsx scripts/catalog-migration.ts
npx tsx scripts/catalog-migration.ts --import --approve <REVIEWED_HASH>
```

3. Check imported IDs/counts and image URLs/dimensions, reload the dashboard, test editing, variant prices/statuses and shared images. Re-run the comparison: unchanged imported records should skip; later edits should reconcile, never overwrite. Existing local-image records need a separately reviewed image-only update with a fresh backup; this missing-only importer intentionally will not mutate them.
4. Complete the editor/schema and empty-catalog gaps above, migrate supporting content through its reviewed schema, then review publication of every intended original. Never auto-publish demos or free-test records merely because they are inventoried.
5. Preview first: after publication review and schema checks, the existing activation-marker command is `npm run migrate:offers -- --finalize-public` (conflicts must be individually reviewed before any acknowledgement). **Do not run it now.** Do not use the old `--apply --publish-legacy` shortcut for this migration. Only after Preview validation set `PUBLIC_OFFERS_SOURCE=firestore` there. Provider environment changes may require a restart/deploy once; subsequent saved offer edits use the dynamic reader and do not require a Git push/deployment.
6. In Preview check homepage/category membership, both delivery filters, private drafts, visible unavailable published offers, preserved relative order, card/viewer image consistency, errors and empty results, edits across a new public tab, then approve production separately. Keep the current layout and local transition fallback intact until this succeeds.

## Recovery

Keep `.verification/catalog-migration/backup-<run>.json`, its `.bin` companion, `source-<run>.json`, `import-<run>.json`, and `cloudinary-manifest.json` securely outside Git. JSON contains Firestore timestamp seconds/nanoseconds; explicitly reconstruct `Timestamp` values if restoring. The binary export is a forensic copy, not a promise of automatic SDK-prototype restoration.

If a commit response is lost, inspect each planned ID and compare against that run's planned record before deciding whether it committed. Resume with a dry run, which finds existing IDs and verified assets. To roll back, export the current records first and review only IDs actually created by that run. Delete only when all fields still match the created record and no later user edit occurred; use transaction update-time preconditions. Preserve any edited record for manual reconciliation. Never delete skipped/matched records. No rollback runs automatically. Retain uploaded Cloudinary assets and all originals; do not destroy a shared image. If a later public switch needs recovery, restore `PUBLIC_OFFERS_SOURCE=local` and restart through the provider's normal process without altering Firestore.

## Checks

Frozen-lockfile dependency installation succeeded with a fresh private cache after the initial cache/tarball retry failed; checksum verification remained enabled. Lint, TypeScript, production build, 39 focused local tests and production HTTP content checks for homepage/coaching passed. These fixtures exercise handlers, visibility, variant behavior, Cloudinary image rendering, permission rejection and migration planning; they are not live service verification. Live Firestore/Cloudinary reads, backup, uploads, import and authenticated browser persistence remain unverified because credentials are absent. Emulator outcome is recorded separately below.

The Firestore rules emulator suite did not execute: after correcting its local cache paths, the emulator artifact download returned HTTP 403 `Domain forbidden` for `storage.googleapis.com`. No verification was bypassed. Retry after the saved network setting is applied, using:

```sh
mkdir -p /tmp/zizi-config /tmp/zizi-cache/emulators
FIREBASE_EMULATORS_PATH=/tmp/zizi-cache/emulators XDG_CONFIG_HOME=/tmp/zizi-config CI=1 npx firebase-tools emulators:exec --only firestore --project demo-zizi-offers 'npm run test:rules'
```

Saved environment draft fields: `install_script`, `start_skill`, the seven server/source variable requirements and seven additive network destinations listed above. Preset network domains were preserved. The save was confirmed, but does not apply runtime configuration or publish the environment. Review and save in environment settings, then publish the cloud environment when appropriate; that is separate from application deployment or migration approval.
