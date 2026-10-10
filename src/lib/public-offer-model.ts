import type { AdminOffer } from "./admin-offer";
import { editorPreview, inferDelivery } from "./offer-editor";
import { getAsset, type DisplayOffer } from "../data/catalog";

export function publishedTime(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") return value.toMillis();
  if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}
export function sortPublished(records: (AdminOffer & { firstPublishedAt?: unknown })[]) {
  return records.slice().sort((a, b) => publishedTime(b.firstPublishedAt) - publishedTime(a.firstPublishedAt) || a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));
}
export function publicOffer(record: AdminOffer): DisplayOffer {
  const local = record.image.kind === "local" ? getAsset(record.image.assetId) : null;
  return { ...editorPreview(record), delivery: inferDelivery(record), badge: record.badge || undefined,
    image: record.image.kind === "cloudinary" ? { src: record.image.secureUrl, width: record.image.width, height: record.image.height, alt: record.image.alt || record.title } : local ? { src: local.publicPath, width: local.width, height: local.height, alt: record.image.alt || record.title } : undefined };
}
export function matchesDelivery(offer: DisplayOffer, mode: "individual" | "group") {
  return offer.delivery === "both" || offer.delivery === mode;
}
export function matchesVariant(id: string, mode: "individual" | "group") {
  return id === mode || id.startsWith(`${mode}-`);
}
