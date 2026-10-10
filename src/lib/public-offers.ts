import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { offers as localOffers, type Offer } from "@/data/offers";
import { toDisplayOffer } from "@/data/catalog";
import { getFirebaseAdmin } from "./firebase/admin";
import { adminOfferSchema } from "./admin-offer";
import { publicOffer, sortPublished } from "./public-offer-model";
import { legacyInventory, legacyInventoryHash } from "./legacy-import";

export const getPublicOffers = cache(async () => {
  // One request-scoped read for all surfaces, with no persistent content cache.
  await connection();
  if (process.env.PUBLIC_OFFERS_SOURCE !== "firestore") return localOffers.map((offer: Offer) => ({ ...toDisplayOffer(offer), delivery: offer.variants?.some((v) => v.id.startsWith("individual")) ? (offer.variants.some((v) => v.id.startsWith("group")) ? "both" as const : "individual" as const) : offer.variants?.some((v) => v.id.startsWith("group")) || offer.capacity ? "group" as const : "general" as const }));
  const { db } = getFirebaseAdmin();
  const state = await db.collection("catalogState").doc("legacy-v1").get();
  if (state.data()?.inventoryHash !== legacyInventoryHash()) throw new Error("Public Firestore catalogue is not activated: review and complete the legacy import first.");
  const snapshot = await db.collection("offers").where("status", "==", "published").get();
  const legacyOrder = new Map(legacyInventory().map((o) => [o.id, o.displayOrder]));
  const records = snapshot.docs.map((doc) => ({ ...adminOfferSchema.parse({ ...doc.data(), id: doc.id, displayOrder: doc.data().displayOrder ?? legacyOrder.get(doc.id) ?? 100000 }), firstPublishedAt: doc.data().firstPublishedAt }));
  return sortPublished(records).map(publicOffer);
});
