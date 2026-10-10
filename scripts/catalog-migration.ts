// Default is read-only. No public activation or existing-record update is supported.
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { serialize } from "node:v8";
import { loadEnvConfig } from "@next/env";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";
import { adminOfferSchema } from "../src/lib/admin-offer";
import { legacyInventory } from "../src/lib/legacy-import";
import { version, digest, supportingContent, inventoryAssets, reconcile, fullInventory, localAssetPath, type AssetManifest, type AssetReference } from "./catalog-migration-lib";

const firebaseNames = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"];
const cloudNames = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const args = process.argv.slice(2);
const upload = args.includes("--upload"), apply = args.includes("--import");
const arg = (name: string) => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
async function privateJson(path: string, data: unknown) {
  await writeFile(`${path}.tmp`, JSON.stringify(data, null, 2), { mode: 0o600 });
  await rename(`${path}.tmp`, path);
}
async function main() {
  if (args.some((a) => !["--upload", "--import", "--approve"].includes(a) && a !== arg("--approve"))) throw new Error("Unknown option");
  const root = process.cwd(), privateDir = resolve(root, ".verification/catalog-migration");
  // Use Next's existing environment loader, including ignored .env.local; never shell-source it.
  loadEnvConfig(root, true, { info: () => {}, error: () => {} });
  await mkdir(privateDir, { recursive: true, mode: 0o700 });
  const media = await inventoryAssets(root);
  const inventory = fullInventory();
  const inventoryHash = digest({ version, inventory, supportingContent, assets: media.assets });
  const missingConfiguration = [...firebaseNames, ...cloudNames].filter((name) => !process.env[name]);
  const hasFirebase = firebaseNames.every((name) => process.env[name]);
  const hasCloud = cloudNames.every((name) => process.env[name]);
  if (hasFirebase && process.env.FIREBASE_ADMIN_PROJECT_ID !== "zizi-offers") throw new Error("Unexpected Firebase project");
  const db = hasFirebase ? getFirestore(initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n") }) }, "catalog-migration")) : null;
  const snapshot = db ? await db.collection("offers").get() : null;
  const existing = snapshot?.docs.map((doc) => ({ ...doc.data(), id: doc.id })) ?? null;
  const manifestPath = resolve(privateDir, "cloudinary-manifest.json");
  let manifest: AssetManifest = { version, assets: {} };
  try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  if (manifest.version !== version) throw new Error("Unexpected manifest version");
  if (hasCloud) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  const imagePlan: { publicId: string; paths: string[]; action: string }[] = [];
  for (const asset of media.assets) {
    let action = "unknown: Cloudinary credentials missing";
    if (hasCloud) {
      try {
        const resource = await cloudinary.api.resource(asset.publicId, { resource_type: "image", context: true });
        if (resource.context?.custom?.sha256 !== asset.sha256 || resource.bytes !== asset.bytes) throw new Error("Asset identity mismatch");
        const image: AssetReference = { kind: "cloudinary", secureUrl: resource.secure_url, publicId: resource.public_id, width: resource.width, height: resource.height, alt: "" };
        adminOfferSchema.shape.image.parse(image);
        manifest.assets[asset.publicId] = { sha256: asset.sha256, image, format: resource.format, bytes: resource.bytes, version: resource.version, paths: asset.paths, assetIds: asset.assetIds };
        action = "reuse";
      } catch (error) {
        const e = error as { http_code?: number; error?: { http_code?: number } };
        if ((e.http_code ?? e.error?.http_code) !== 404) throw new Error("Cloudinary read failed or asset identity mismatch; no mutations attempted");
        delete manifest.assets[asset.publicId]; action = "upload";
      }
    }
    imagePlan.push({ publicId: asset.publicId, paths: asset.paths, action });
  }
  const migratedImages = hasCloud ? Object.fromEntries(Object.values(manifest.assets).flatMap((a) => a.assetIds.map((id) => [id, a.image]))) : {};
  const plan = reconcile(existing, migratedImages);
  const report = { version, inventoryHash, firestoreCount: existing?.length ?? null, plan, missingConfiguration, media, imagePlan, verifiedCloudinaryManifest: hasCloud ? manifest : null, inventory, supportingContent,
    editorGaps: ["Top-level availability, variant price metadata, unknown-price clarification, slug and source are preserved in offer records", "Internal notes remain only in private migration reports/source manifests and are not written to public offer documents", "Supporting galleries and approved copy require a separate versioned content editor", "Public reader rejects an unexpectedly empty activated catalogue unless the activation marker explicitly allows an empty published catalogue"],
    unsupportedEditors: ["Code card copy/images", "51 Etho names/aliases/images", "Mindset verbatim bodies and cover", "Spectra gallery", "Compass gallery", "Fingerprint names/illustrations"],
    contentWarnings: inventory.filter((o) => o.approvedSource.internalNotes).map((o) => ({ id: o.record.id, note: o.approvedSource.internalNotes })),
    publication: "All imports are drafts. No activation, test publication, existing edits or supporting-content writes." };
  await privateJson(resolve(privateDir, "dry-run.json"), report);
  console.log(JSON.stringify({ version, inventoryHash, firestoreCount: existing?.length ?? null, candidates: inventory.length, databaseCompared: plan.databaseCompared, create: plan.create, skip: plan.skip, reconcile: plan.reconcile, registeredPaths: media.assets.reduce((n, a) => n + a.paths.length, 0), uniqueImages: media.assets.length, missingFiles: media.missing, unregisteredFiles: media.unregistered, imageActions: Object.fromEntries([...new Set(imagePlan.map((i) => i.action))].map((action) => [action, imagePlan.filter((i) => i.action === action).length])), missingConfiguration, report: ".verification/catalog-migration/dry-run.json" }, null, 2));
  if (!upload && !apply) return;
  if (arg("--approve") !== inventoryHash) throw new Error("Live phase requires the exact reviewed inventory hash via --approve");
  if (!hasFirebase || !hasCloud || !plan.databaseCompared || media.missing.length || media.unregistered.length || plan.reconcile?.length) throw new Error("Live phase blocked: credentials, asset inventory or record reconciliation incomplete");
  const runId = `${Date.now()}-${crypto.randomUUID()}`;
  // JSON preserves timestamp fields; binary export preserves typed raw records for forensic recovery.
  await privateJson(resolve(privateDir, `backup-${runId}.json`), existing);
  await writeFile(resolve(privateDir, `backup-${runId}.bin`), serialize(existing), { mode: 0o600 });
  await privateJson(resolve(privateDir, `source-${runId}.json`), { version, inventoryHash, inventory, supportingContent });
  if (upload) {
    for (const asset of media.assets) {
      if (manifest.assets[asset.publicId]) continue;
      const result = await cloudinary.uploader.upload(resolve(root, "public", `.${localAssetPath(asset.paths[0])}`), { public_id: asset.publicId, resource_type: "image", overwrite: false, unique_filename: false, context: { sha256: asset.sha256 }, allowed_formats: ["jpg", "jpeg", "png", "webp"] });
      if (result.existing || result.bytes !== asset.bytes) throw new Error("Upload race or byte mismatch; rerun read-only validation");
      const image: AssetReference = { kind: "cloudinary", secureUrl: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, alt: "" };
      adminOfferSchema.shape.image.parse(image);
      manifest.assets[asset.publicId] = { sha256: asset.sha256, image, format: result.format, bytes: result.bytes, version: result.version, paths: asset.paths, assetIds: asset.assetIds };
      await privateJson(manifestPath, manifest);
    }
  }
  await privateJson(manifestPath, manifest);
  if (apply) {
    if (media.assets.some((a) => !manifest.assets[a.publicId])) throw new Error("Upload/verify all assets before import");
    const creates = plan.create!;
    const planned = legacyInventory().filter((o) => creates.includes(o.id)).map((o) => {
      if (o.image.kind === "local") {
        const asset = media.assets.find((a) => a.assetIds.includes(o.image.kind === "local" ? o.image.assetId : ""));
        if (!asset) throw new Error("Missing image mapping");
        o.image = { ...manifest.assets[asset.publicId].image, alt: o.image.alt };
      }
      return adminOfferSchema.parse(o);
    });
    // One atomic missing-only batch: a concurrent admin creation aborts everything.
    await privateJson(resolve(privateDir, `import-${runId}.json`), { version, inventoryHash, state: "prepared", records: planned });
    const batch = db!.batch();
    for (const o of planned) batch.create(db!.collection("offers").doc(o.id), { ...o, legacyImported: true, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    if (planned.length) await batch.commit();
    await privateJson(resolve(privateDir, `import-${runId}.json`), { version, inventoryHash, state: "committed", records: planned });
  }
}
main().catch(() => { console.error("Migration stopped. Check credential readiness, private report and manifests; no secret values are logged. Do not assume a failed commit response proves no writes."); process.exitCode = 1; });
