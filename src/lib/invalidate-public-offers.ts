import "server-only";
import { revalidatePath } from "next/cache";
import type { AdminOffer } from "./admin-offer";

const categoryPaths: Record<AdminOffer["category"], string> = {
  tests: "/tests",
  coaching: "/coaching",
  courses: "/courses",
  programs: "/programs",
  sessions: "/sessions",
  compass: "/compass",
};

export function publicOfferPaths(...offers: (Pick<AdminOffer, "id" | "category" | "slug"> | null | undefined)[]) {
  const paths = new Set(["/"]);
  for (const offer of offers) {
    if (!offer) continue;
    paths.add(categoryPaths[offer.category]);
    paths.add(`/offers/${offer.id}`);
    if (offer.slug && offer.slug !== offer.id) paths.add(`/offers/${offer.slug}`);
  }
  return [...paths];
}

export function invalidatePublicOffers(...offers: (Pick<AdminOffer, "id" | "category" | "slug"> | null | undefined)[]) {
  for (const path of publicOfferPaths(...offers)) revalidatePath(path);
}
