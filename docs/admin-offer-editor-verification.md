# Admin offer editor verification

The dashboard still uses the authenticated `/api/admin/offers` and `/api/admin/upload` routes. The server requires Firebase's trusted `admin:true` claim. Public catalogue pages still import local offer data; this change does not enable Firestore as the public content source.

The editor stores optional `delivery` metadata (`individual`, `group`, `both`, `general`). Older records infer their format from variant IDs. A general variant stores one price/availability pair and has no individual/group badge. Custom package IDs, notes, prices and availability are retained and editable. Format switching keeps hidden standard options in memory, saves only selected standard options, and warns about removing previously saved standard options. Existing custom packages are always retained. Existing records that already lost packages in an earlier migration cannot be recovered from the editor alone; review the approved local catalogue before any separate repair.

The migration script is still dry-run by default and create-missing-only when explicitly applied. Its mapper now retains every supplied package. No application of that script occurred in this task. Production rules were not deployed. The existing two-variant direct Firestore client write limit is retained to avoid broadening client writes and exceeding the Firestore expression evaluation budget; the existing server API validates up to 30 variants with Zod before its Admin SDK write. Draft/public reads and trusted admin authorization remain enforced.

## Reproducible checks

From `/workspace/zizi-offers`:

```sh
npm run lint
npm run typecheck
npm run build
npx vitest run tests/offer-editor.test.ts tests/admin-api.test.ts tests/admin-upload.test.ts
XDG_CONFIG_HOME=/workspace/.config FIREBASE_EMULATORS_PATH=/workspace/.cache/firebase-emulators npx firebase-tools emulators:exec --only firestore --project demo-zizi-offers 'npm run test:rules'
npm run migrate:offers
```

Results: 23 editor/API/upload fixture tests, 9 actual emulator rules tests, and the three static/build checks passed. Migration dry-run reports 43 offers with 43 stable IDs and makes no writes. Dependencies and lockfile are unchanged.

A local browser fixture bundles the actual AdminDashboard, OfferForm and OfferCard using mocked Firebase authentication, Next navigation/image wrappers and controlled network responses. It verified 1440px desktop and 390px mobile layouts without mobile horizontal overflow, conditional formats, retained hidden prices and independent availability, field validation, positive/unknown group capacity, photo-free sessions, save failure/retry, duplicate submission/upload prevention, local-image editing without upload, upload failure/retry/removal, four-package preservation, simulated reload/list refresh/counters, and load error handling. The fixture is outside deployed routes and uses no real credentials. Generated screenshots are `.verification/admin-desktop.png` and `.verification/admin-mobile.png`. They show fixture records and are not evidence of a live backend account.

Unauthenticated HTTP checks against the actual Next server returned 401 for admin list and upload requests. Homepage, coaching and admin login pages served successfully. Actual admin login, non-admin account login, real Firestore writes/reloads, and real signed Cloudinary upload/replacement were not completed because no Firebase or Cloudinary runtime variables were supplied. Add the declared variable values securely in environment settings, review/save the configuration and publish the environment before validating those operations with an authorized account. Do not paste keys into chat or publish test content automatically.
