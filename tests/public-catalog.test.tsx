import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
const state = vi.hoisted(() => ({ records: new Map<string, Record<string, unknown>>(), ready: true, allowEmpty: false, clock: 100, queries: [] as unknown[], invalidations: [] as string[] }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/cache", () => ({ revalidatePath: (path: string) => state.invalidations.push(path) }));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { serverTimestamp: () => ({ seconds: ++state.clock }) } }));
vi.mock("../src/lib/firebase/admin", async () => {
  const { legacyInventoryHash } = await import("../src/lib/legacy-import");
  const collection = (name: string) => ({
    doc: (id: string) => ({ get: async () => name === "catalogState" ? { exists: state.ready, data: () => state.ready ? { inventoryHash: legacyInventoryHash(), ...(state.allowEmpty ? { allowEmptyPublishedCatalog: true } : {}) } : undefined } : { exists: state.records.has(id), data: () => state.records.get(id) }, create: async (data: Record<string, unknown>) => state.records.set(id, data), set: async (data: Record<string, unknown>) => state.records.set(id, { ...state.records.get(id), ...data }), update: async (data: Record<string, unknown>) => state.records.set(id, { ...state.records.get(id), ...data }) }),
    where: (field: string, op: string, value: string) => { state.queries.push([field, op, value]); return { get: async () => { const docs = [...state.records.entries()].filter(([, d]) => d.status === value).map(([id, data]) => ({ id, data: () => data })); return { docs, empty: docs.length === 0 }; } }; },
  });
  return { getFirebaseAdmin: () => ({ auth: { verifyIdToken: async (token: string) => ({ admin: token === "admin" }) }, db: { collection, runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ get: (ref: { get: () => unknown }) => ref.get(), set: (ref: { set: (data: unknown) => unknown }, data: unknown) => ref.set(data), update: (ref: { update: (data: unknown) => unknown }, data: unknown) => ref.update(data) }) } }) };
});
import { getPublicOffers } from "../src/lib/public-offers";
import { legacyInventory, importPlan } from "../src/lib/legacy-import";
import type { AdminOffer } from "../src/lib/admin-offer";
import { blankOffer, newVariant } from "../src/lib/offer-editor";
import { invalidatePublicOffers, publicOfferPaths } from "../src/lib/invalidate-public-offers";
import { matchesDelivery, publicOffer } from "../src/lib/public-offer-model";
import { POST } from "../src/app/api/admin/offers/route";
import { PUT } from "../src/app/api/admin/offers/[id]/route";
import Home from "../src/app/page";
import CompassPage from "../src/app/compass/page";
import { CategoryPage } from "../src/components/category-page";
import { OfferCard } from "../src/components/offer-card";

beforeEach(() => {
  vi.stubEnv("PUBLIC_OFFERS_SOURCE", "firestore"); state.records.clear(); state.ready = true; state.allowEmpty = false; state.queries = []; state.invalidations = [];
  for (const offer of legacyInventory()) state.records.set(offer.id, { ...offer, status: "published", legacyImported: true });
});
afterEach(() => vi.unstubAllEnvs());
const request = (data: unknown) => new Request("http://localhost/api/admin/offers", { method: "POST", headers: { Authorization: "Bearer admin", "Content-Type": "application/json" }, body: JSON.stringify(data) });
const update = (data: ReturnType<typeof blankOffer>) => PUT(request(data), { params: Promise.resolve({ id: data.id }) });

describe("one published catalogue with reviewed migration", () => {
  it("refuses activation with an incomplete migration instead of dropping originals", async () => { state.ready = false; await expect(getPublicOffers()).rejects.toThrow("legacy import"); });
  it("distinguishes a reviewed empty catalogue from an unexpectedly empty activation", async () => {
    state.records.clear();
    await expect(getPublicOffers()).rejects.toThrow("unexpectedly empty");
    state.allowEmpty = true;
    await expect(getPublicOffers()).resolves.toEqual([]);
  });
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
    expect((await getPublicOffers()).some((o) => o.id === offer.id)).toBe(true);
    const unpublishRequest = new Request(`http://localhost/api/admin/offers/${offer.id}?unpublish=true`, { method: "PUT", headers: { Authorization: "Bearer admin", "Content-Type": "application/json" }, body: JSON.stringify(offer) });
    expect((await PUT(unpublishRequest, { params: Promise.resolve({ id: offer.id }) })).status).toBe(200);
    expect((await getPublicOffers()).some((o) => o.id === offer.id)).toBe(false); expect(state.records.has(offer.id)).toBe(true);
    offer = { ...offer, status: "published" }; expect((await update(offer)).status).toBe(200); expect(state.records.get(offer.id)!.firstPublishedAt).toEqual(first);
    publicRecords = await getPublicOffers(); expect(publicRecords.filter((o) => o.id === offer.id)).toHaveLength(1);
    expect(state.queries.every((q) => JSON.stringify(q) === JSON.stringify(["status", "==", "published"]))).toBe(true);
    expect(state.invalidations).toContain("/"); expect(state.invalidations).toContain("/courses"); expect(state.invalidations).toContain("/coaching");
  });
  it("uses saved homepage test-card data without changing the specialized tests page", async () => {
    const current = state.records.get("codes-abcd")!;
    state.records.set("codes-abcd", {
      ...current,
      status: "published",
      title: "اختبار الأكواد المنشور",
      description: "وصف محفوظ من لوحة الإدارة",
      badge: "جديد",
      image: { kind: "cloudinary", secureUrl: "https://res.cloudinary.com/test/image/upload/codes.png", publicId: "test/codes", width: 640, height: 640, alt: "غلاف محفوظ" },
      price: { status: "known", amountUsd: 12 },
      variants: [{ ...newVariant("general"), price: { status: "known", amountUsd: 12 }, availability: "available" }],
    });
    const home = renderToStaticMarkup(await Home());
    expect(home).toContain("اختبار الأكواد المنشور");
    expect(home).toContain("وصف محفوظ من لوحة الإدارة");
    expect(home).toContain("جديد");
    expect(home).toContain("codes.png");
  });
  it("does not resurrect stale local homepage test cards after a Firestore test offer is unpublished", async () => {
    state.records.set("etho", { ...state.records.get("etho")!, status: "draft", title: "إيثو محفوظ غير منشور" });
    const draftHome = renderToStaticMarkup(await Home());
    expect(draftHome).not.toContain("إيثو محفوظ غير منشور");
    expect(draftHome).not.toContain("اختبار الإيثو");
    expect(draftHome).not.toContain("/tests#etho");

    state.records.set("etho", { ...state.records.get("etho")!, status: "published", title: "إيثو محفوظ منشور" });
    const republishedHome = renderToStaticMarkup(await Home());
    expect(republishedHome).toContain("إيثو محفوظ منشور");
    expect(republishedHome.match(/\/tests#etho/g)).toHaveLength(1);
  });
  it("keeps compass pricing records out of the approved homepage and compass image galleries", async () => {
    const offer: AdminOffer = { ...blankOffer(1000), title: "عنصر بوصلة جديد", category: "compass", status: "published" };
    expect((await POST(request(offer))).status).toBe(201);
    const home = renderToStaticMarkup(await Home());
    const compass = renderToStaticMarkup(await CompassPage());
    expect(home).not.toContain("عنصر بوصلة جديد");
    expect(compass).not.toContain("عنصر بوصلة جديد");
    expect(home).toContain("مسار الانطلاق");
    expect(home).toContain("بطاقة الفضول");
    expect(compass).toContain("مسار الانطلاق");
    expect(compass).toContain("بطاقة الفضول");
    expect(home).toContain("الباقة الكاملة");
  });
  it("normalizes compatible legacy records and skips unsupported public records without resurrecting drafts", async () => {
    state.records.clear();
    state.records.set("compatible-offer", { ...blankOffer(1), id: "compatible-offer", title: "متوافق", status: "published", price: { status: "known", amountUsd: 12 }, delivery: "general", variants: [{ ...newVariant("general"), price: { status: "published", amountUsd: 12 } }] });
    state.records.set("unsupported-offer", { ...blankOffer(2), id: "unsupported-offer", title: "غير صالح", status: "published", category: "bad-section" });
    state.records.set("draft-offer", { ...blankOffer(3), id: "draft-offer", title: "مسودة", status: "draft" });
    const offers = await getPublicOffers();
    expect(offers.map((offer) => offer.id)).toEqual(["compatible-offer"]);
    expect(offers[0].priceLabel).toBe("12$");
  });
  it("invalidates old and new public paths when a saved offer moves category or detail slug", () => {
    const oldOffer = { ...blankOffer(0), id: "emotional-communication", slug: "old-slug", category: "coaching" as const };
    const newOffer = { ...oldOffer, slug: "new-slug", category: "courses" as const };
    expect(publicOfferPaths(oldOffer, newOffer)).toEqual(["/", "/coaching", "/offers/emotional-communication", "/offers/old-slug", "/courses", "/offers/new-slug"]);
    invalidatePublicOffers(oldOffer, newOffer);
    expect(state.invalidations).toEqual(["/", "/coaching", "/offers/emotional-communication", "/offers/old-slug", "/courses", "/offers/new-slug"]);
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
  it("anchors badges on image-less cards without a media placeholder row", () => {
    const offer = publicOffer({ ...blankOffer(0), title: "بطاقة بلا صورة", status: "published", badge: "جديد" });
    const html = renderToStaticMarkup(<OfferCard offer={offer} />);
    expect(html).toContain("offer-card-badged-no-media");
    expect(html).toContain("offer-promo-badge");
    expect(html).not.toContain("offer-card-media image-view-trigger");
  });
});
