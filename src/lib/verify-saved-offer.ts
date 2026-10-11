import { isDeepStrictEqual } from "node:util";
import type { AdminOffer } from "./admin-offer";

// Compare normalized, persisted fields; Firestore timestamps and other metadata
// are intentionally outside AdminOffer and are not submitted by the editor.
export function verifySavedOffer(saved: AdminOffer, expected: AdminOffer) {
  if (!isDeepStrictEqual(saved, expected)) {
    throw new Error("Saved offer fields or publication state did not match the submitted form.");
  }
}
