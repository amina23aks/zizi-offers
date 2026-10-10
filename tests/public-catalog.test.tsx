import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
const state = vi.hoisted(() => ({ records: new Map<string, Record<string, unknown>>(), ready: true, clock: 100, queries: [] as unknown[], invalidations: [] as string[] }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/cache", () => ({ revalidatePath: (path: string) => state.invalidations.push(path) }));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { serverTimestamp: () => ({ seconds: ++state.clock }) } }));
vi.mock("../src/lib/firebase/admin", async () => {
  const { legacyInventoryHash } = await import("../src/lib/legacy-import");
  const collection = (name: string) => ({
    doc: (id: string) => ({ get: async () => name === "catalogState" ? { exists: state.ready, data: () => state.ready ? { inventoryHash: legacyInventoryHash() } : undefined } : { exists: state.records.has(id), data: () => state.records.get(id) }, create: async (data: Record<string, unknown>) => state.records.set(id, data), set: async (data: Record<string, unknown>) => state.records.set(id, { ...state.records.get(id), ...data }) }),
    where: (field: string, op: string, value: string) => { state.queries.push([field, op, value]); return { get: async () => ({ docs: [...state.records.entries()].filter(([, d]) => d.status === value).map(([id, data]) => ({ id, data: () => data })) }) }; },
  });
  return { getFirebaseAdmin: () => ({ auth: { verifyIdToken: async (token: string) => ({ admin: token === "admin" }) }, db: { collection, runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ get: (ref: { get: () => unknown }) => ref.get(), set: (ref: { set: (data: unknown) => unknown }, data: unknown) => ref.set(data) }) } }) };
});
import { getPublicOffers } from "../src/lib/public-offers";
import { legacyInventory, importPlan } from "../src/lib/legacy-import";
import type { AdminOffer } from "../src/lib/admin-offer";
import { blankOffer, newVariant } from "../src/lib/offer-editor";
import { matchesDelivery, publicOffer } from "../src/lib/public-offer-model";
import { POST } from "../src/app/api/admin/offers/route";
import { PUT } from "../src/app/api/admin/offers/[id]/route";
import Home from "../src/app/page";
import { CategoryPage } from "../src/components/category-page";
import { OfferCard } from "../src/components/offer-card";

beforeEach(() => {
  vi.stubEnv("PUBLIC_OFFERS_SOURCE", "firestore"); state.records.clear(); state.ready = true; state.queries = []; state.invalidations = [];
  for (const offer of legacyInventory()) state.records.set(offer.id, { ...offer, status: "published", legacyImported: true });
});
afterEach(() => vi.unstubAllEnvs());
const request = (data: unknown) => new Request("http://localhost/api/admin/offers", { method: "POST", headers: { Authorization: "Bearer admin", "Content-Type": "application/json" }, body: JSON.stringify(data) });
const update = (data: ReturnType<typeof blankOffer>) => PUT(request(data), { params: Promise.resolve({ id: data.id }) });

describe("one published catalogue with reviewed migration", () => {
  it("refuses activation with an incomplete migration instead of dropping originals", async () => { state.ready = false; await expect(getPublicOffers()).rejects.toThrow("legacy import"); });
  it("publishes, edits, recategorizes and unpublishes through the real handlers and shared readers", async () => {
    const originalIds = legacyInventory().map((o) => o.id);
    let offer: AdminOffer = { ...blankOffer(999), title: "عرض مشترك", badge: "جديد", delivery: "both" as const, variants: [{ ...newVariant("individual"), price: { status: "known" as const, amountUsd: 77 }, availability: "available" as const }, { ...newVariant("group"), price: { status: "known" as const, amountUsd: 9 }, availability: "unavailable" as const }], capacity: "8" };
    expect((await POST(request(offer))).status).toBe(201);
    expect((await getPublicOffers()).some((o) => o.id === offer.id)).toBe(false);
    offer = { ...offer, status: "published" }; expect((await update(offer)).status).toBe(200);
    const first = state.records.get(offer.id)!.firstPublishedAt;
    let publicRecords = await getPublicOffers(); expect(publicRecords[0].id).toBe(offer.id); expect(publicRecords).toHaveLength(originalIds.length + 1);
    expect(publicRecords.filter((o) => originalIds.includes(o.id)).map((o) => o.id)).toEqual(originalIds);
    const html = renderToStaticMarkup(await Home()); expect(html).toContain("عرض مشترك"); mkdirSync(".verification", { recursive: true }); writeFileSync(".verification/public-home-fixture.html", html);
    const category = renderToStaticMarkup(await CategoryPage({ category: "coaching", coachingFormat: "group" })); expect(category).toContain("9$"); expect(category).toContain("غير متاح"); expect(category).toContain("جديد"); writeFileSync(".verification/public-category-fixture.html", category);
    offer = { ...offer, category: "courses", badge: "مميز", image: { kind: "cloudinary", secureUrl: "https://res.cloudinary.com/test/image/upload/new.png", publicId: "test/new", width: 300, height: 500, alt: "غلاف" } };
    expect((await update(offer)).status).toBe(200); expect(state.records.get(offer.id)!.firstPublishedAt).toEqual(first);
    expect(renderToStaticMarkup(await CategoryPage({ category: "coaching" }))).not.toContain("عرض مشترك");
    const moved = renderToStaticMarkup(await CategoryPage({ category: "courses" })); expect(moved).toContain("عرض مشترك"); expect(moved).toContain("new.png"); expect(moved).toContain("مميز");
    offer = { ...offer, delivery: "individual", variants: [offer.variants[0]] }; expect((await update(offer)).status).toBe(200);
    const changed = (await getPublicOffers()).find((o) => o.id === offer.id)!; expect(matchesDelivery(changed, "group")).toBe(false); expect(matchesDelivery(changed, "individual")).toBe(true);
    offer = { ...offer, status: "draft", badge: "" }; expect((await update(offer)).status).toBe(200);
    expect((await getPublicOffers()).some((o) => o.id === offer.id)).toBe(false); expect(state.records.has(offer.id)).toBe(true);
    offer = { ...offer, status: "published" }; expect((await update(offer)).status).toBe(200); expect(state.records.get(offer.id)!.firstPublishedAt).toEqual(first);
    publicRecords = await getPublicOffers(); expect(publicRecords.filter((o) => o.id === offer.id)).toHaveLength(1);
    expect(state.queries.every((q) => JSON.stringify(q) === JSON.stringify(["status", "==", "published"]))).toBe(true);
    expect(state.invalidations).toContain("/"); expect(state.invalidations).toContain("/courses"); expect(state.invalidations).toContain("/coaching");
  });
  it.each(["individual", "group", "both", "general"] as const)("filters %s by delivery regardless of unavailable status", (delivery) => {
    const ids = delivery === "both" ? ["individual", "group"] : [delivery];
    const offer = publicOffer({ ...blankOffer(0), delivery, variants: ids.map((id) => ({ ...newVariant(id), availability: "unavailable" })) });
    expect(matchesDelivery(offer, "group")).toBe(delivery === "group" || delivery === "both"); expect(matchesDelivery(offer, "individual")).toBe(delivery === "individual" || delivery === "both");
    if (delivery === "general") expect(renderToStaticMarkup(<OfferCard offer={offer} />)).not.toContain("offer-variant-pill");
  });
  it("reports an idempotent inventory and conflicts without overwriting existing records", () => {
    const originals = legacyInventory(); expect(originals).toHaveLength(48);
    const plan = importPlan(originals); expect(plan.creates).toHaveLength(0); expect(plan.skips).toHaveLength(48); expect(plan.conflicts).toHaveLength(0);
    expect(importPlan(originals).inventoryHash).toBe(plan.inventoryHash);
    expect(importPlan([{ ...originals[0], title: "Existing manual edit" }]).conflicts).toEqual([originals[0].id]);
    expect(importPlan(null).databaseCompared).toBe(false);
  });
  it.each([undefined, "", "جديد", "مميز", "شارة خاصة"])("round-trips optional badge %s", async (badge) => {
    const offer = { ...blankOffer(0), title: "شارة", status: "published" as const, badge };
    expect((await POST(request(offer))).status).toBe(201);
    const saved = (await getPublicOffers()).find((o) => o.id === offer.id)!;
    expect(saved.badge).toBe(badge || undefined);
  });
});
