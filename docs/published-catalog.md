# Published dashboard catalogue and reviewed legacy import

## Diagnosis and current activation state

The old public site read `src/data/offers.ts` and additional display/pricing constants in `src/data/catalog.ts`. The dashboard read the server Firestore `offers` collection in project `zizi-offers`. Default admin search/category filters do not explain that difference. No trusted server credential values are present in this cloud instance, so the live record count, live migration history, creates/skips/conflicts and a live backup could not be verified. The screenshot's two documents are not treated as a database inventory.

The shared `getPublicOffers()` reader now supplies the homepage, dedicated category pages, delivery filters, test-family cards, compass prices and the existing individual detail route. In Firestore mode it explicitly queries `status == published`, uses saved card data, and never falls back to hardcoded offers or merges in local drafts. React cache deduplicates reads only within a render. `connection()` makes pages dynamic; there is no persistent content cache. Successful admin writes invalidate all affected public routes, so later requests/new tabs load current content without a new code deployment. Public listings do not automatically update an already-open idle tab.

Production activation is deliberately pending, as requested. `PUBLIC_OFFERS_SOURCE=local` (or absent) keeps the original site intact. Firestore mode requires a server-only `catalogState/legacy-v1` marker matching the reviewed complete inventory hash. Missing/incomplete migration produces a visible route error rather than silently publishing a partial collection. The marker can be created only after all 48 original public records are present, valid and reviewed as published. After the initial activation, individual records may be drafted/unpublished normally.

## Inventory dry run

`npm run migrate:offers` completed without database writes. Local candidates:

| Category | Offers |
| --- | ---: |
| tests | 8 |
| coaching | 10 |
| programs | 14 |
| courses | 8 |
| sessions | 6 |
| compass | 2 |
| Total | 48 |

These are 43 primary catalogue records, three approved additional free tests, and two existing compass price options. Animal patterns, code faces, spectrum pictures, compass gallery pictures and fingerprints remain supporting media/content, not invented independent paid offers. Specialized test interactions and the compass gallery are retained. No unsupported offer schema records were found in the local inventory. Live creates, skips and conflicts are **unknown**, not zero. The private local report is `.verification/legacy-import-report.json`; `.verification` is ignored by Git.

The mapper preserves original IDs, Arabic content, prices (including free zero/unknown null), custom packages and notes, variant availability, descriptive durations, original local images, legacy display order and relevant format metadata. Import creates missing documents only, with no overwrite or local-image re-upload. Imported historical publication dates are not invented. New dashboard offers receive `firstPublishedAt` on their first publish, atomically in a transaction for updates. Editing, unpublishing and republishing preserve it. Legacy offers keep their relative `displayOrder`; stable ID breaks ties. Promotional badges are independent of availability/publication.

## Manual review and activation steps — not executed here

1. Supply the server/client Firebase and Cloudinary configuration names from `.env.example` securely in the environment/provider settings. Keep client and server project IDs aligned to `zizi-offers`.
2. Run `npm run migrate:offers` with trusted server credentials. It reads the actual collection, exports all current records to a private, timestamped `.verification/offers-backup-*.json`, and reports creates/skips/conflicts by stable ID before any write. Inspect that report and backup. Review conflicting existing records; do not replace them automatically.
3. After approving the report, the explicit missing-only import command is `npm run migrate:offers -- --apply`. This creates drafts. To retain the already approved original public catalogue during activation, a separately reviewed command can use `--apply --publish-legacy` to publish **only newly imported original catalogue records**, never existing test/demo records. If existing conflicts are approved to remain unchanged, `--keep-existing-conflicts` explicitly acknowledges them; the script still never overwrites them.
4. Review existing original records in the dashboard and their publication states, then run `npm run migrate:offers -- --finalize-public` (with `--keep-existing-conflicts` only after the relevant review). This refuses missing, invalid or unreviewed draft originals. It sets the server-only activation marker, not the application's environment variable.
5. Configure `PUBLIC_OFFERS_SOURCE=firestore` for the intended environment, initially Preview. Runtime environment changes may require the provider's normal restart/redeploy; subsequent content changes do not require a Git commit or deployment. This task did not enable the production setting or apply an import. Keep the initial production switch pending owner review.
6. With an authorized admin account, test draft absence, publish placement on both surfaces, each delivery filter/price/availability, edits to image/badge/category/delivery, unavailable visibility, unpublish removal, dashboard reload and a separate public browser tab. Repeat the dry run to confirm all expected stable IDs are skipped, with no duplicate creates. Do not publish demo content automatically.

Only the automatic single-field status index is required; ordering happens after fetching, so older documents without firstPublishedAt are not excluded by an orderBy query. No composite index is necessary. Rules keep public reads limited to published records and writes restricted to trusted admins; the existing server API validates every larger package array.

## 10 October 2026 Preview activation update

The live database comparison was rerun from the Windows checkout with `.env.local` loaded by `scripts/migrate-offers.ts`. Firestore contained all 48 reviewed legacy IDs, so no import creates were needed. The report still listed 34 conflicts against the older local inventory, which is expected after dashboard and Cloudinary edits; those existing records were preserved and not overwritten.

The reviewed legacy publication command is:

```sh
npx tsx scripts/migrate-offers.ts --publish-reviewed-legacy --keep-existing-conflicts
```

It saved an ignored private backup, then published only the 48 reviewed legacy IDs: 46 newly published, 2 already published, 0 failures. It updates `status` and `updatedAt` for newly published drafts only, leaving already-published records and their `firstPublishedAt` values unchanged. It does not alter availability, prices, variants, badges, images or unrelated drafts.

The activation marker was then written with:

```sh
npx tsx scripts/migrate-offers.ts --finalize-public --keep-existing-conflicts
```

Vercel Preview was configured for branch `codex/catalog-migration-schema-safety` only:

| Key | Target | Branch | Value |
| --- | --- | --- | --- |
| `PUBLIC_OFFERS_SOURCE` | Preview | `codex/catalog-migration-schema-safety` | `firestore` |

Production remains unchanged. Subsequent saved content edits should be visible on new public requests without another deployment, because the public reader is dynamic and admin writes revalidate the public paths.

## Recovery

Every apply run writes a separate incremental `.verification/migration-created-*.json` manifest. If interrupted, retain that manifest and the private pre-write backup. Review only that run's created IDs and verify nobody has edited/reused them before any rollback deletion. Never delete skipped/conflicting records. Recover any prior records from the private export only through a separately reviewed operation; preserve Firestore Timestamp types when restoring serialized timestamp fields. Restoring `PUBLIC_OFFERS_SOURCE=local` restores the pre-switch catalogue without altering Firestore. No rollback is run automatically.

## Verification actually completed

- Lint, TypeScript and production build.
- 35 local editor/API/upload/public-reader tests: actual application handlers plus an in-memory Firestore fixture; publish/edit/recategorize/delivery/unpublish/republish; ordering preserved; shared homepage/category SSR; badges and images; original inventory intact; draft-only privacy; incomplete migration rejected; idempotent import planning. These are not live Firestore integration tests.
- 11 real Firestore emulator rules tests, including public draft denial, non-admin denial, unavailable published visibility, promotional badge validation and immutable first-publication timestamps.
- Chromium layout checks of rendered published fixtures at 1440 and 390px: newest card on the right, shared filtered card and badge, no horizontal overflow. Artifacts: `.verification/public-home-1440.png`, `public-home-390.png`, `public-category-1440.png`, `public-category-390.png`. These static SSR fixtures do not prove a live authenticated two-tab workflow.
- No live admin login, real database read/write/import, real Cloudinary change or separate authenticated/public tab persistence test was completed. Credentials and reviewed migration/activation remain prerequisites. No production switch, rule deployment or main merge was performed.
