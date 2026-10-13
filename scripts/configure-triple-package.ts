import { loadEnvConfig } from "@next/env";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { mkdirSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import { adminOfferSchema } from "../src/lib/admin-offer";

// A narrow, opt-in edit of one verified record; never an import or publication.
async function main() {
  loadEnvConfig(process.cwd());
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) throw new Error("Configure Firebase Admin credentials securely before running this command.");
  if (projectId !== "zizi-offers") throw new Error("Refusing another Firebase project.");
  const privateKey = rawKey.replace(/\\n/g, "\n");
  if (!privateKey.includes("BEGIN PRIVATE KEY")) throw new Error("A real server private key is required; proxy placeholders cannot sign credentials.");
  const db = getFirestore(initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }));
  const ref = db.collection("offers").doc("triple-test");
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.category !== "tests" || snapshot.data()?.id !== snapshot.id) throw new Error("Expected triple-test test record was not verified; no write performed.");
  const data = snapshot.data()!;
  const ids = Array.isArray(data.variants) ? data.variants.map((variant: { id?: string }) => variant.id) : [];
  const confirmedContent = ["drama-triangle", "four-roles", "psychological-behavior"].every((id) => ids.includes(id))
    || data.image?.assetId === "triad:الميولات-السوكيه";
  if (!confirmedContent) throw new Error("Triple-test content identity was not confirmed; inspect the live record before any write.");
  console.log(`Verified offers/${snapshot.id} in ${projectId}.`);
  const presentation = adminOfferSchema.shape.packagePresentation.parse({ enabled: true, label: "الباقة الكاملة", items: [
    { id: "drama-triangle", title: "مثلث الدراما", price: { status: "known", amountUsd: 30 } },
    { id: "four-roles", title: "تشخيص الأدوار الأربعة", price: { status: "known", amountUsd: 30 } },
    { id: "psychological-behavior", title: "السلوك النفسي", price: { status: "known", amountUsd: 60 } },
  ], fullPrice: { status: "known", amountUsd: 90 } });
  if (!process.argv.includes("--apply")) { console.log("Read-only verification complete. --apply saves a private backup and changes only packagePresentation."); return; }
  mkdirSync(".verification", { recursive: true, mode: 0o700 });
  const backup = `.verification/triple-package-${Date.now()}-${randomUUID()}.json`;
  const original = snapshot.data()!;
  writeFileSync(backup, JSON.stringify({ projectId, id: snapshot.id, fieldPresent: Object.hasOwn(original, "packagePresentation"), packagePresentation: original.packagePresentation ?? null }, null, 2), { mode: 0o600, flag: "wx" });
  await db.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (!current.exists || !current.updateTime?.isEqual(snapshot.updateTime!)) throw new Error("Record changed after verification; review and retry without overwriting it.");
    tx.update(ref, { packagePresentation: presentation });
  });
  const saved = (await ref.get()).data()!;
  if (!isDeepStrictEqual(saved.packagePresentation, presentation)) throw new Error("Package readback did not match.");
  for (const key of new Set([...Object.keys(original), ...Object.keys(saved)])) {
    if (key !== "packagePresentation" && !isDeepStrictEqual(original[key], saved[key])) throw new Error(`Unrelated field changed concurrently: ${key}. Review before claiming preservation.`);
  }
  console.log(`Verified package 30/30/60 and explicit 90 USD; all other fields preserved. Private backup: ${backup}`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Targeted package configuration failed."); process.exitCode = 1; });
