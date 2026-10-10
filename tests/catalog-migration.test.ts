import { describe, expect, it } from "vitest";
import { inventoryAssets, reconcile, fullInventory, localAssetPath } from "../scripts/catalog-migration-lib";
import { legacyInventory } from "../src/lib/legacy-import";

describe("catalog migration safety", () => {
  it("blocks different-ID title/slug matches instead of duplicating them", () => {
    const offer = legacyInventory()[0];
    const result = reconcile([{ ...offer, id: "dashboard-created" }]);
    expect(result.create).not.toContain(offer.id);
    expect(result.reconcile?.[0].matches).toEqual(["dashboard-created"]);
  });
  it("retains existing edits, drafts and ordering", () => {
    const offer = legacyInventory()[0];
    expect(reconcile([{ ...offer, status: "published", displayOrder: 900 }]).skip).toContain(offer.id);
    expect(reconcile([{ ...offer, description: "An admin edit" }]).reconcile?.[0].reasons).toContain("description");
    expect(reconcile(null).create).toBeNull();
  });
  it("preserves raw approved prices, variants and notes alongside proposed records", () => {
    const inventory = fullInventory();
    expect(inventory).toHaveLength(48);
    expect(inventory.find((o) => o.record.id === "business-coaching")?.record.variants.map((v) => v.price.amountUsd)).toEqual([1000, 2000, 100, 200]);
    expect(inventory.find((o) => o.record.id === "work-field-entry")?.approvedSource.price.amountUsd).toBeNull();
    expect(inventory.filter((o) => o.record.variants.some((v) => v.price.status === "free"))).toHaveLength(3);
  });
  it("resolves cache-busted URLs to originals and hashes every registered file", async () => {
    expect(localAssetPath("/assets/codes/A.jpg?v=123")).toBe("/assets/codes/A.jpg");
    const result = await inventoryAssets(process.cwd());
    expect(result.missing).toEqual([]); expect(result.unregistered).toEqual([]);
    expect(new Set(result.assets.map((a) => a.publicId)).size).toBe(result.assets.length);
    expect(result.assets.flatMap((a) => a.assetIds.filter((id) => id.startsWith("etho:")))).toHaveLength(51);
  });
});
