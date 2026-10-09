import { writeFile, mkdir } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { offers, type Offer } from "../src/data/offers";

async function main() {
const apply = process.argv.includes("--apply");
const localOffers: readonly Offer[] = offers;
const mapped = localOffers.map((offer, displayOrder) => {
  // Retain every package and duration variant; never collapse them to two formats.
  const variants = offer.variants?.length ? offer.variants.map((variant) => ({ id: variant.id, title: variant.title, price: { amountUsd: variant.price.status === "variant" ? null : variant.price.amountUsd, status: variant.price.status === "variant" ? "unknown" : variant.price.status }, availability: variant.availability ?? "unknown", ...(variant.note ? { note: variant.note } : {}) })) : [{ id: "general", title: "السعر", price: { amountUsd: offer.price.status === "variant" ? null : offer.price.amountUsd, status: offer.price.status === "variant" ? "unknown" : offer.price.status }, availability: offer.availability }];
  return { id: offer.id, title: offer.title, category: offer.category, description: offer.summary ?? "", topics: [...(offer.bullets ?? [])], image: offer.assetId ? { kind: "local", assetId: offer.assetId, alt: offer.title } : { kind: "none", alt: offer.title }, variants, duration: offer.programDuration ?? offer.totalTrainingDuration ?? "", sessionDuration: offer.sessionDuration ?? "", capacity: offer.capacity ?? "", displayOrder, status: "draft" as const };
});
console.log(`Dry-run mapping: ${mapped.length} local offers with ${new Set(mapped.map((offer) => offer.id)).size} stable IDs.`);
console.log(`Mode: ${apply ? "APPLY (create missing only)" : "DRY RUN (no writes)"}.`);
if (!apply) process.exit(0);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const missing = [["FIREBASE_ADMIN_PROJECT_ID", projectId], ["FIREBASE_ADMIN_CLIENT_EMAIL", clientEmail], ["FIREBASE_ADMIN_PRIVATE_KEY", rawKey]].filter(([, value]) => !value).map(([name]) => name);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
if (projectId !== "zizi-offers") throw new Error("FIREBASE_ADMIN_PROJECT_ID must be zizi-offers");
const db = getFirestore(initializeApp({ credential: cert({ projectId, clientEmail, privateKey: rawKey!.replace(/\\n/g, "\n") }) }));
const created: string[] = []; const skipped: string[] = [];
for (const offer of mapped) {
  const ref = db.collection("offers").doc(offer.id);
  await db.runTransaction(async (transaction) => {
    if ((await transaction.get(ref)).exists) { skipped.push(offer.id); return; }
    transaction.create(ref, { ...offer, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); created.push(offer.id);
  });
}
await mkdir(".verification", { recursive: true });
await writeFile(".verification/migration-created.json", JSON.stringify({ projectId, created, skipped }, null, 2));
console.log(`Created ${created.length}; skipped existing ${skipped.length}. Roll back only IDs listed in .verification/migration-created.json after reviewing them.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Migration failed"); process.exitCode = 1; });
