import { toDisplayOffer } from "../data/catalog";
import type { Offer, OfferFormat } from "../data/offers";
import type { AdminOffer } from "./admin-offer";

export const categories = { tests: "الاختبارات", coaching: "الكوتشينغ", courses: "الدورات", programs: "البرمجات", sessions: "الجلسات", compass: "البوصلة" } as const;
export const deliveryLabels = { individual: "فردي", group: "جماعي", both: "فردي وجماعي", general: "لا ينطبق" } as const;
export type Delivery = keyof typeof deliveryLabels;
export type Variant = AdminOffer["variants"][number];
export const standardIds = ["individual", "group", "general"];
export const newVariant = (id: string): Variant => ({ id, title: id === "general" ? "السعر" : deliveryLabels[id as "individual" | "group"], price: { amountUsd: null, status: "unknown" }, availability: "unknown" });
export function inferDelivery(offer: AdminOffer): Delivery {
  if (offer.delivery) return offer.delivery;
  const individual = offer.variants.some((v) => v.id === "individual" || v.id.startsWith("individual-"));
  const group = offer.variants.some((v) => v.id === "group" || v.id.startsWith("group-"));
  return individual && group ? "both" : group ? "group" : individual ? "individual" : "general";
}
export function blankOffer(displayOrder: number): AdminOffer {
  return { id: `offer-${crypto.randomUUID()}`, title: "", category: "coaching", description: "", topics: [], image: { kind: "none", alt: "" }, delivery: "individual", variants: [newVariant("individual")], duration: "", sessionDuration: "", capacity: "", displayOrder, status: "draft" };
}
// Custom package IDs are always retained. Only the three format slots are conditional.
export function activeVariants(bank: Variant[], delivery: Delivery): Variant[] {
  const ids = delivery === "both" ? ["individual", "group"] : [delivery];
  const packages = bank.filter((v) => !standardIds.includes(v.id));
  return [...ids.flatMap((id) => {
    const existing = bank.find((v) => v.id === id);
    if (existing) return [existing];
    if (packages.some((v) => id === "general" || v.id.startsWith(`${id}-`))) return [];
    return [newVariant(id)];
  }), ...packages];
}
export function editorPreview(offer: AdminOffer) {
  const general = offer.variants.find((v) => v.id === "general");
  const formats: Record<AdminOffer["category"], OfferFormat> = { tests: "test", coaching: "coaching", programs: "program", courses: "course", sessions: "session", compass: "package" };
  return toDisplayOffer({ id: offer.id, slug: offer.id, title: offer.title || "اسم العرض", category: offer.category, format: formats[offer.category], summary: offer.description, bullets: offer.topics.filter(Boolean), programDuration: offer.duration, sessionDuration: offer.sessionDuration, capacity: offer.capacity, assetId: offer.image.kind === "local" ? offer.image.assetId as Offer["assetId"] : null, price: general?.price ?? (offer.variants.length === 1 ? offer.variants[0].price : { amountUsd: null, status: "variant" }), availability: general?.availability ?? "unknown", variants: general && offer.variants.length === 1 ? [] : offer.variants.filter((v) => v.id !== "general"), source: "admin-preview" });
}
