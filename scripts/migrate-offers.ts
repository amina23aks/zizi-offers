import { mkdir, writeFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadEnvConfig } from "@next/env";
import { adminOfferSchema } from "../src/lib/admin-offer";
import { importPlan, legacyInventory, legacyInventoryHash } from "../src/lib/legacy-import";

type FirestoreRecord = Record<string, unknown> & { id: string };

async function main() {
  loadEnvConfig(process.cwd());
  const runId = Date.now();
  const apply = process.argv.includes("--apply");
  const finalize = process.argv.includes("--finalize-public");
  const keepConflicts = process.argv.includes("--keep-existing-conflicts");
  const publish = process.argv.includes("--publish-legacy");
  const publishReviewedLegacy = process.argv.includes("--publish-reviewed-legacy");
  const hasCredentials = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"].every((name) => Boolean(process.env[name]));
  if ((apply || finalize || publishReviewedLegacy) && !hasCredentials) throw new Error("Trusted server credentials are required; supply them securely, never in chat.");
  if (hasCredentials && process.env.FIREBASE_ADMIN_PROJECT_ID !== "zizi-offers") throw new Error("Unexpected Firebase project");
  const db = hasCredentials ? getFirestore(initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n") }) })) : null;
  const snapshot = db ? await db.collection("offers").get() : null;
  const existing = snapshot?.docs.map((doc) => ({ ...doc.data(), id: doc.id })) ?? null;
  const report = importPlan(existing);
  await mkdir(".verification", { recursive: true, mode: 0o700 });
  // Private read-only export before any writes, including skips/conflicts.
  if (existing) await writeFile(`.verification/offers-backup-${runId}.json`, JSON.stringify(existing, null, 2), { mode: 0o600 });
  await writeFile(".verification/legacy-import-report.json", JSON.stringify(report, null, 2), { mode: 0o600 });
  console.log(JSON.stringify(report, null, 2));
  if (!apply && !finalize && !publishReviewedLegacy) { console.log("DRY RUN: no writes. Database comparison " + (db ? "completed" : "unavailable; counts are local candidates only.")); return; }
  if (report.conflicts.length && !keepConflicts) throw new Error("Review conflicts before importing; existing records are never overwritten.");
  const created: string[] = [];
  if (apply) {
    for (const offer of legacyInventory()) {
      const ref = db!.collection("offers").doc(offer.id);
      const didCreate = await db!.runTransaction(async (tx) => {
        if ((await tx.get(ref)).exists) return false;
        tx.create(ref, { ...offer, status: publish ? "published" : "draft", legacyImported: true, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        return true;
      });
      // Persist incremental recovery data even if a later operation fails.
      if (didCreate) created.push(offer.id);
      await writeFile(`.verification/migration-created-${runId}.json`, JSON.stringify({ inventoryHash: report.inventoryHash, created }, null, 2), { mode: 0o600 });
    }
  }
  if (finalize) {
    const state = await db!.collection("offers").get();
    const records = new Map<string, FirestoreRecord>(state.docs.map((doc) => [doc.id, { ...doc.data(), id: doc.id }]));
    if (legacyInventory().some((o) => records.get(o.id)?.status !== "published")) throw new Error("Activation refused: all original public offers must be present and reviewed as published before the first switch.");
    for (const record of records.values()) if (record.status === "published" || legacyInventory().some((o) => o.id === record.id)) adminOfferSchema.parse(record);
    await db!.collection("catalogState").doc("legacy-v1").set({ inventoryHash: legacyInventoryHash(), reviewedAt: FieldValue.serverTimestamp() });
  }
  if (publishReviewedLegacy) {
    const legacyIds = new Set(legacyInventory().map((offer) => offer.id));
    const fresh = await db!.collection("offers").get();
    const records = new Map<string, FirestoreRecord>(fresh.docs.map((doc) => [doc.id, { ...doc.data(), id: doc.id }]));
    const missing = [...legacyIds].filter((id) => !records.has(id));
    if (missing.length) throw new Error(`Publication refused: missing reviewed legacy offers: ${missing.join(", ")}`);
    const failures: string[] = [];
    let alreadyPublished = 0;
    let newlyPublished = 0;
    for (const offer of legacyInventory()) {
      const record = records.get(offer.id)!;
      const parsed = adminOfferSchema.safeParse(record);
      if (!parsed.success) { failures.push(offer.id); continue; }
      if (record.status === "published") { alreadyPublished += 1; continue; }
      if (record.status !== "draft") { failures.push(offer.id); continue; }
      const ref = db!.collection("offers").doc(offer.id);
      const didPublish = await db!.runTransaction(async (tx) => {
        const current = await tx.get(ref);
        if (!current.exists) throw new Error(`Offer disappeared during publication: ${offer.id}`);
        if (current.data()?.status === "published") return false;
        tx.update(ref, { status: "published", updatedAt: FieldValue.serverTimestamp() });
        return true;
      });
      if (didPublish) newlyPublished += 1;
    }
    const result = { inventoryHash: report.inventoryHash, totalReviewedLegacy: legacyIds.size, newlyPublished, alreadyPublished, failures };
    await writeFile(`.verification/publish-reviewed-legacy-${runId}.json`, JSON.stringify(result, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ publication: result }, null, 2));
    if (failures.length) throw new Error(`Publication completed with validation failures: ${failures.join(", ")}`);
  }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Import failed"); process.exitCode = 1; });
