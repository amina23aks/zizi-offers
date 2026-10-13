# Focused dashboard options — 13 October 2026

The existing authenticated server API remains the only dashboard write path. Saved offers now have an explicit delete action with branded confirmation, a separate overall availability selector, an `on-demand` price type, and optional structured `packagePresentation` data. Package items do not change delivery or existing variants; `fullPrice: null` means no explicit bundle price, never a computed sum. Disabling presentation retains its saved items.

Delete verifies the admin token (including revocation), removes only the selected offer document transactionally, updates the dashboard, and invalidates public paths. Shared Cloudinary assets and specialized content are retained. Deleting the final published offer also records intentional catalogue emptiness in the existing server-only activation marker; the inventory-hash activation guard stays enforced. Known specialized test sections remain present even when their catalogue record is deleted or unpublished. Unknown tests receive no invented anchor.

Overall availability occupies the physical top-left of card content. Variant availability remains independent. Unspecified overall availability has no badge. `on-demand` stores a null amount and renders حسب الطلب, never zero, free or unknown-price text. All dashboard selects use `AdminSelect`, native keyboard/touch menus, one left chevron and reserved text padding in both themes. Payment PNGs and interactions are unchanged; their tiles retain the same light colors in dark mode.

## Verification

- ESLint, TypeScript and optimized Next.js build passed.
- 66 application tests passed using real handlers/readers with in-memory backend fixtures: unauthorized deletion, exact-record removal, missing/repeated delete, last-offer emptiness, public-card absence, preserved specialized sections, price validation/readback, explicit package persistence and retained publication/images/variants.
- 13 Firestore rules tests passed against the real local emulator, including admin/member deletion and null-only on-demand pricing. Access restrictions and the direct-client variant limit remain enforced. Package presentation is validated by the server API; direct-client package writes remain denied by the unchanged field allowlist.
- Chromium at 390 and 1440 pixels passed controlled dashboard fixture workflows: overall availability with general delivery, on-demand save/readback, package editing and reload with explicit 90 USD, cancel/error/retry/duplicate-request deletion, centered dialogs, RTL selects/focus, left price/right details, five real section anchors below sticky navigation, and equal payment-tile colors in light/dark mode. Private screenshots/results are in ignored `.verification/`.
- Browser fixtures use simulated authentication/API responses; they do not establish live Firebase login or production database/Cloudinary operations. Emulator fixtures are temporary and no real offer was used for deletion.

## Single authorized triple-test record edit

The local inventory identifies `triple-test`; its live document must still be verified with real Firebase Admin credentials. No migration, publication command or production rule deployment is part of this workflow.

From `/workspace/zizi-offers`, provide real server-side credentials securely using the existing `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` bindings (or an ignored `.env.local`). The project must be `zizi-offers`. A PEM signing key must be usable locally; an HTTPS-proxy placeholder cannot sign Firebase credentials.

```sh
./node_modules/.bin/tsx scripts/configure-triple-package.ts
./node_modules/.bin/tsx scripts/configure-triple-package.ts --apply
```

The first command is read-only and verifies the actual document ID/category/project and original variant or poster identity. The second saves the affected field privately with mode 0600, checks for concurrent edits, writes only `packagePresentation`, then verifies its readback and every unrelated field. Items are مثلث الدراما 30 USD, تشخيص الأدوار الأربعة 30 USD, السلوك النفسي 60 USD; الباقة الكاملة is explicitly 90 USD. Variants, original poster, publication and availability are untouched. New public requests read this field dynamically. Do not enable Firestore mode or deploy rules as an incidental step.

If restoration is needed, review the private backup and restore only the affected field through a trusted operation; `fieldPresent: false` means remove only `packagePresentation`. Never replace the whole document or overwrite concurrent changes.

Live verification/application remains pending while the secure credentials are absent. After Preview is available, verify an authorized login and a separately identified disposable record across dashboard and public tabs; remove that disposable record with the new confirmation action. Do not use a real offer for deletion.
