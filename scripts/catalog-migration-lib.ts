import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { readFile, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { imageAssets } from "../src/data/assets";
import { codeCards, ethoAnimals, mindsets, spectraAssets, compassCards, compassLaunchAsset, fingerprintNames } from "../src/data/catalog";
import { legacyInventory, legacySources } from "../src/lib/legacy-import";
import { normalizeArabic } from "../src/data/catalog";

export const version = "catalog-cloudinary-v1";
export const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const localAssetPath = (publicPath: string) => decodeURIComponent(publicPath.split(/[?#]/)[0]);
export const supportingContent = { codeCards, ethoAnimals, mindsets, spectraAssets, compassCards, compassLaunchAsset, fingerprintNames };
export type AssetReference = { kind: "cloudinary"; secureUrl: string; publicId: string; width: number; height: number; alt: string };
export type AssetEntry = { publicId: string; sha256: string; paths: string[]; assetIds: string[]; bytes: number; sections: string[] };
export type AssetManifest = { version: string; assets: Record<string, { sha256: string; image: AssetReference; format: string; bytes: number; version: number; paths: string[]; assetIds: string[] }> };

export async function inventoryAssets(root: string) {
  const grouped = new Map<string, AssetEntry>();
  const missing: string[] = [];
  for (const asset of imageAssets) {
    let bytes: Buffer;
    try { bytes = await readFile(resolve(root, "public", `.${localAssetPath(asset.publicPath)}`)); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; missing.push(asset.publicPath); continue; }
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const entry = grouped.get(sha256) ?? { publicId: `zizi-offers/legacy-v1/${sha256}`, sha256, paths: [], assetIds: [], bytes: bytes.length, sections: [] };
    entry.paths.push(asset.publicPath); entry.assetIds.push(asset.id);
    if (!entry.sections.includes(asset.section)) entry.sections.push(asset.section);
    grouped.set(sha256, entry);
  }
  const registered = new Set(imageAssets.map((a) => localAssetPath(a.publicPath)));
  const unregistered: string[] = [];
  async function walk(dir: string) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, item.name);
      if (item.isSymbolicLink()) throw new Error("Asset symlink requires manual inspection");
      if (item.isDirectory()) await walk(path);
      else if (/\.(jpe?g|png|webp|gif|svg|avif)$/i.test(item.name)) {
        const publicPath = `/${relative(resolve(root, "public"), path).split("\\").join("/")}`;
        if (!registered.has(publicPath)) unregistered.push(publicPath);
      }
    }
  }
  await walk(resolve(root, "public/assets"));
  return { assets: [...grouped.values()], missing, unregistered };
}

export function reconcile(existing: Record<string, unknown>[] | null, migratedImages: Record<string, AssetReference> = {}) {
  const offers = legacyInventory();
  if (existing === null) return { databaseCompared: false, create: null, skip: null, reconcile: null, candidates: offers.map((o) => o.id) };
  const create: string[] = [], skip: string[] = [];
  const conflicts: { id: string; matches: string[]; reasons: string[] }[] = [];
  for (const offer of offers) {
    if (offer.image.kind === "local" && migratedImages[offer.image.assetId]) offer.image = { ...migratedImages[offer.image.assetId], alt: offer.image.alt };
    const exact = existing.find((r) => r.id === offer.id);
    const matches = existing.filter((r) => r.id !== offer.id && (
      r.slug === offer.slug ||
      r.slug === offer.id ||
      (typeof r.source === "string" && r.source === offer.source && (r.id === offer.slug || r.slug === offer.slug || (typeof r.title === "string" && normalizeArabic(r.title) === normalizeArabic(offer.title)))) ||
      (typeof r.title === "string" && normalizeArabic(r.title) === normalizeArabic(offer.title))
    ));
    if (matches.length) { conflicts.push({ id: offer.id, matches: matches.map((r) => String(r.id)), reasons: ["Potential source identity, title or slug match; never auto-merge"] }); continue; }
    if (!exact) { create.push(offer.id); continue; }
    const fields = Object.keys(offer).filter((key) => key !== "status" && key !== "displayOrder");
    const changed = fields.filter((key) => !isDeepStrictEqual(exact[key], offer[key as keyof typeof offer]));
    if (changed.length) conflicts.push({ id: offer.id, matches: [offer.id], reasons: changed });
    else skip.push(offer.id);
  }
  return { databaseCompared: true, create, skip, reconcile: conflicts, candidates: offers.map((o) => o.id) };
}

export function fullInventory() {
  return legacyInventory().map((record, index) => ({ record, approvedSource: legacySources[index], migrationVersion: version }));
}
