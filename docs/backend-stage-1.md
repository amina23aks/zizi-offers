# Backend Stage 1 operations

The public catalogue continues to import `src/data/offers.ts`; this backend does not switch public pages to Firestore.

## Trusted setup

1. Configure every name in `.env.example` in Vercel Preview and Production. Keep server variables out of client bundles.
2. Validate credentials and grant the sole initial administrator from a trusted machine:
   `npm run admin:provision`
   The script verifies project `zizi-offers`, performs an authenticated `getUser`, preserves other claims, sets `admin:true`, then reads the user again. The administrator must sign out/in afterward (or force-refresh the token).
3. Review and deploy rules only: `npx firebase-tools deploy --only firestore:rules --project zizi-offers`.
4. Preview the stable-ID migration without credentials: `npm run migrate:offers`. Apply only after review with `npm run migrate:offers -- --apply`. Existing documents are skipped transactionally. The apply run records newly created IDs in `.verification/migration-created.json`; rollback means reviewing that manifest and deleting only those documents. All migrated offers are drafts.

## Emulator verification

Run `npx firebase-tools emulators:exec --only firestore "npm run test:rules"`. The focused suite verifies public/draft reads and unauthenticated, non-admin, and admin writes.

Uploads are accepted only through the Node.js admin route after Firebase token and `admin:true` verification. The server validates JPG/PNG/WebP and a 10 MB maximum before its authenticated Cloudinary upload; only the resulting secure URL, public ID, dimensions, and supplied alt text enter the editor.
