import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { offers, additionalTestOffers, type Offer } from "../data/offers";
import { compassPricing } from "../data/catalog";
import { adminOfferSchema, type AdminOffer } from "./admin-offer";
import { inferDelivery } from "./offer-editor";

export const legacySources: readonly Offer[] = [
  ...offers,
  ...additionalTestOffers.map((o) => ({ ...o, slug: o.id, category: "tests" as const, format: "test" as const, source: "additionalTestOffers" })),
  ...compassPricing.map((o, index) => ({ id: index ? "compass-package" : "compass-element", slug: index ? "compass-package" : "compass-element", title: o.title, category: "compass" as const, format: "package" as const, price: { status: "known" as const, amountUsd: Number(o.price.replace("$", "")) }, availability: "available" as const, source: "compassPricing" })),
];
export function legacyInventory() {
  return legacySources.map((o, displayOrder) => {
    const variants = o.variants?.length ? o.variants.map((v) => ({ id: v.id, title: v.title, price: { status: v.price.status === "variant" ? "unknown" as const : v.price.status, amountUsd: v.price.status === "variant" ? null : v.price.amountUsd }, availability: v.availability ?? "unknown" as const, ...(v.note ? { note: v.note } : {}) })) : [{ id: "general", title: "السعر", price: { status: o.price.status === "variant" ? "unknown" as const : o.price.status, amountUsd: o.price.status === "variant" ? null : o.price.amountUsd }, availability: o.availability }];
    const record: AdminOffer = { id: o.id, title: o.title, category: o.category, description: o.summary ?? "", topics: [...o.bullets ?? []], image: o.assetId ? { kind: "local", assetId: o.assetId, alt: o.title } : { kind: "none", alt: o.title }, variants, duration: o.programDuration ?? o.totalTrainingDuration ?? "", sessionDuration: o.sessionDuration ?? "", capacity: o.capacity ?? "", displayOrder, status: "draft", catalogDetails: { format: o.format, durationKind: o.totalTrainingDuration ? "training" : "program", ...(o.priceBasis ? { priceBasis: o.priceBasis } : {}), ...(o.availableThroughoutYear === undefined ? {} : { availableThroughoutYear: o.availableThroughoutYear }) } };
    record.delivery = o.capacity && !o.variants?.length ? "group" : inferDelivery(record);
    if (record.delivery === "group" && variants[0]?.id === "general") record.variants = [{ ...variants[0], id: "group", title: "جماعي" }];
    return adminOfferSchema.parse(record);
  });
}
export const legacyInventoryHash = () => createHash("sha256").update(JSON.stringify(legacyInventory())).digest("hex");
export function importPlan(existing: Record<string, unknown>[] | null) {
  const inventory = legacyInventory();
  const categories = Object.fromEntries([...new Set(inventory.map((o) => o.category))].map((c) => [c, inventory.filter((o) => o.category === c).length]));
  const byId = new Map(existing?.map((o) => [o.id, o]) ?? []);
  const creates = inventory.filter((o) => !byId.has(o.id)).map((o) => o.id);
  const skips = inventory.filter((o) => byId.has(o.id)).map((o) => o.id);
  const conflicts = skips.filter((id) => { const current = byId.get(id)!; const expected = inventory.find((o) => o.id === id)!; return current.title !== expected.title || current.category !== expected.category || !isDeepStrictEqual(current.variants, expected.variants) || !isDeepStrictEqual(current.image, expected.image); });
  return { inventoryHash: legacyInventoryHash(), categories, count: inventory.length, counts: { creates: existing ? creates.length : null, skips: existing ? skips.length : null, conflicts: existing ? conflicts.length : null, unsupported: 0 }, databaseCompared: existing !== null, creates: existing ? creates : [], proposedWithoutDatabase: existing ? [] : creates, skips, conflicts, unsupported: [], nonOfferContent: ["Fingerprint illustrations and names", "Code cards, animal patterns, spectrum illustrations and compass gallery artwork remain supporting media, not independent paid offers"], specialLayouts: ["Tests retain their interactive family layouts", "Compass retains its shared image gallery; its two pricing options are imported"] };
}
