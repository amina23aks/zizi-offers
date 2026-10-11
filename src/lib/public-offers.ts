import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { offers as localOffers, type Offer } from "@/data/offers";
import { toDisplayOffer } from "@/data/catalog";
import { getFirebaseAdmin } from "./firebase/admin";
import { parseAdminOfferRecord } from "./admin-offer";
import { publicOffer, sortPublished } from "./public-offer-model";
import { legacyInventory, legacyInventoryHash } from "./legacy-import";

export const getPublicOffers = cache(async () => {
  // One request-scoped read for all surfaces, with no persistent content cache.
  await connection();
  if (process.env.PUBLIC_OFFERS_SOURCE !== "firestore") return localOffers.map((offer: Offer) => ({ ...toDisplayOffer(offer), delivery: offer.variants?.some((v) => v.id.startsWith("individual")) ? (offer.variants.some((v) => v.id.startsWith("group")) ? "both" as const : "individual" as const) : offer.variants?.some((v) => v.id.startsWith("group")) || offer.capacity ? "group" as const : "general" as const }));
  const { db } = getFirebaseAdmin();
  const state = await db.collection("catalogState").doc("legacy-v1").get();
  const activation = state.data();
  if (activation?.inventoryHash !== legacyInventoryHash()) throw new Error("Public Firestore catalogue is not activated: review and complete the legacy import first.");
  const snapshot = await db.collection("offers").where("status", "==", "published").get();
  if (snapshot.empty && activation.allowEmptyPublishedCatalog !== true) throw new Error("Public Firestore catalogue is unexpectedly empty after activation.");
  const legacyOrder = new Map(legacyInventory().map((o) => [o.id, o.displayOrder]));
  const records = snapshot.docs.flatMap((doc) => {
    const displayOrder = (doc.data().displayOrder as number | undefined) ?? legacyOrder.get(doc.id) ?? 100000;
    const parsed = parseAdminOfferRecord(doc.data(), { id: doc.id, displayOrder });
    return parsed.offer ? [{ ...parsed.offer, firstPublishedAt: doc.data().firstPublishedAt }] : [];
  });
  if (!records.length && activation.allowEmptyPublishedCatalog !== true) throw new Error("Public Firestore catalogue has no readable published offers.");
  return sortPublished(records).map(publicOffer);
});
